import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import { storage } from '../storage';
import { generateSessionId } from '../routes';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Define una interfaz para la información de usuario desde el proveedor OAuth
interface OAuthUserInfo {
  sub: string;        // ID único del proveedor (subject)
  email: string;      // Email del usuario
  name: string;       // Nombre completo
  given_name?: string; // Nombre
  family_name?: string; // Apellido
  picture?: string;   // URL de la foto de perfil
  email_verified?: boolean; // Si el email ha sido verificado
  locale?: string;    // Configuración regional del usuario
}

export async function handleGoogleLogin(req: Request, res: Response) {
  try {
    const { credential, userType } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'No se ha proporcionado un token de autenticación' });
    }
    
    // Verificar el token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload() as OAuthUserInfo;
    
    if (!payload) {
      return res.status(400).json({ message: 'Token de Google inválido' });
    }
    
    // Extraer información necesaria del payload
    const { sub, email, name, given_name, family_name, picture, email_verified } = payload;
    
    if (!email) {
      return res.status(400).json({ message: 'El token no contiene un correo electrónico' });
    }
    
    // Buscar usuario por proveedor y ID de proveedor
    let user = await storage.getUserByOAuth('google', sub);
    
    if (!user) {
      // El usuario no existe, verificar si existe un usuario con ese email
      const existingUserByEmail = await storage.getUserByEmail(email);
      
      if (existingUserByEmail) {
        // Si el usuario existe pero se registró de otra forma, actualizamos sus datos OAuth
        user = await storage.updateUser(existingUserByEmail.id, {
          authProvider: 'google',
          authProviderId: sub,
          emailVerified: email_verified || existingUserByEmail.emailVerified
        });
      } else {
        // Crear un nuevo usuario
        const firstName = given_name || (name ? name.split(' ')[0] : '');
        const lastName = family_name || (name ? name.split(' ').slice(1).join(' ') : '');
        
        // Generar un nombre de usuario a partir del email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        const newUser = {
          email,
          username,
          // Creamos una contraseña aleatoria para cumplir con el esquema
          // Ésta nunca se usará ya que el usuario siempre se autenticará con OAuth
          password: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
          userType: userType || 'patient',
          firstName: firstName || 'Usuario',
          lastName: lastName || 'Google',
          phoneNumber: '', // Requerido para el esquema, pero no proporcionado por Google
          emailVerified: email_verified || false,
          profilePicture: picture,
          authProvider: 'google',
          authProviderId: sub
        };
        
        user = await storage.createUser(newUser);
        
        // Si el usuario es médico, redirigiremos después para completar el perfil
      }
    }
    
    // Generar sesión como se hace normalmente
    const sessionId = generateSessionId();
    
    // En una aplicación real, aquí guardaríamos la sesión en la base de datos
    // storage.createSession({ userId: user.id, sessionId });
    
    // Devolver información de sesión al cliente
    res.status(200).json({
      message: 'Login exitoso',
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profilePicture: user.profilePicture,
        isNewUser: !user.emailVerified,
        needsProfileCompletion: user.userType === 'doctor' && !await storage.getDoctorProfileByUserId(user.id)
      }
    });
    
  } catch (error) {
    console.error('Error en OAuth login:', error);
    res.status(500).json({ 
      message: 'Error al procesar la autenticación con Google',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

export async function handleOAuthLogin(req: Request, res: Response) {
  const { provider } = req.body;
  
  if (provider === 'google') {
    return handleGoogleLogin(req, res);
  }
  
  // Soporte para Apple será añadido en el futuro
  
  return res.status(400).json({ message: 'Proveedor OAuth no soportado' });
}