import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white' | 'blue' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
  href?: string;
  useImage?: boolean;
  linkTo?: string;
}

/**
 * Componente Logo con opciones de personalización
 * @param variant Color del logo: default, white, blue, dark (determina si usa logo claro u oscuro)
 * @param size Tamaño del logo: sm, md, lg, xl
 * @param withText Mostrar texto junto al icono (solo para SVG inline, no para imagen)
 * @param className Clases CSS adicionales
 * @param href URL para enlace externo (usa <a>)
 * @param useImage Usar imagen SVG en lugar de componente inline
 * @param linkTo URL para enlaces internos (usa wouter <Link>)
 */
const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  withText = true,
  className,
  href,
  useImage = true,
  linkTo = '/'
}) => {
  // Configuración de tamaños
  const sizes = {
    sm: { icon: 'h-6 w-auto', text: 'text-sm' },
    md: { icon: 'h-8 w-auto', text: 'text-base' },
    lg: { icon: 'h-10 w-auto', text: 'text-lg' },
    xl: { icon: 'h-12 w-auto', text: 'text-xl' }
  };

  // Configuración de colores
  const colors = {
    default: { icon: 'text-blue-500', text: 'text-gray-800' },
    white: { icon: 'text-white', text: 'text-white' },
    blue: { icon: 'text-blue-500', text: 'text-blue-700' },
    dark: { icon: 'text-blue-400', text: 'text-gray-700' }
  };

  // Configuración de tamaños para la imagen del logo
  // Los valores son mayores para el logo que proporcionaste ya que es más ancho que alto
  const imageSizes = {
    sm: { height: 32, width: 'auto' },
    md: { height: 40, width: 'auto' },
    lg: { height: 48, width: 'auto' },
    xl: { height: 64, width: 'auto' }
  };

  // Determinar qué logo usar - siempre usamos el mismo logo
  const logoSrc = '/images/logos/logo-white.png';
  
  // Aplicar filtros para adaptar el logo al fondo según la variante
  const getFilterStyle = () => {
    // El logo ya tiene contornos blancos, por lo que es adecuado para fondos oscuros
    // Para fondos claros (default o blue), podemos agregar un filtro que invierta los colores
    switch(variant) {
      case 'default':
      case 'blue':
        // Para fondos claros, aplicar un filtro de inversión para que el logo sea visible
        // y un drop-shadow para hacerlo destacar más en fondos claros
        return { 
          filter: 'invert(0.15) brightness(0.85) contrast(1.1) drop-shadow(0 0 2px rgba(0,0,0,0.2))',
          opacity: 0.85 
        };
      case 'white':
      case 'dark':
      default:
        // Para fondos oscuros, aplicamos un leve glow para mejorar la visibilidad
        return { 
          filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.25))',
          opacity: 0.95
        };
    }
  };

  // Componente SVG del logo (inline o imagen)
  const LogoIcon = useImage ? (
    <img 
      src={logoSrc}
      alt="OnCall Clinic Logo"
      className={sizes[size].icon}
      style={{ 
        objectFit: 'contain',
        width: imageSizes[size].width,
        height: imageSizes[size].height,
        maxWidth: '100%',
        ...getFilterStyle()
      }}
    />
  ) : (
    <svg 
      className={cn(sizes[size].icon, colors[variant].icon, "fill-current")} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="65" fill="currentColor" />
      <path d="M100 60V140M60 100H140" stroke="white" strokeWidth="18" strokeLinecap="round" />
    </svg>
  );

  // Componente del texto del logo (solo se muestra si no se usa imagen y withText es true)
  const LogoText = (withText && !useImage) && (
    <div className={cn("flex flex-col ml-2", sizes[size].text, colors[variant].text, "font-bold leading-none")}>
      <span>OnCall</span>
      <span>Clinic</span>
    </div>
  );

  // Renderizado con o sin enlace
  const logoContent = (
    <div className={cn("flex items-center", className)}>
      {LogoIcon}
      {LogoText}
    </div>
  );

  // Decidir qué tipo de enlace usar (href o linkTo)
  const targetHref = href || linkTo;

  // Si se proporciona un enlace, usamos el componente Link de wouter
  // Nota: En versiones recientes de wouter, <Link> envuelve automáticamente el contenido
  // sin necesidad de un elemento <a> explícito que puede causar problemas de anidamiento
  return targetHref ? (
    <Link href={targetHref} className="inline-flex">
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
};

export default Logo;