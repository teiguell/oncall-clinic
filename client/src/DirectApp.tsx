export default function DirectApp() {
  return (
    <div>
      <h1>OnCall Clinic</h1>
      <p>Médicos profesionales a domicilio en España</p>
      <div>
        <h2>Dr. Test Alpha - Disponible</h2>
        <p>Medicina General - Licencia: MD-ALPHA-TEST</p>
        <p>Distancia: 0.1km - Cala de Bou, Ibiza</p>
        <p>€60/hora - Disponible 24/7</p>
        <button>Reservar Cita</button>
      </div>
      <div>
        <a href="/doctor-login">Login Médicos</a>
        <a href="/legal/privacy-policy-es">Política de Privacidad</a>
        <a href="/legal/terms-of-use-es">Términos de Uso</a>
      </div>
      <button onClick={() => {
        const password = prompt('Contraseña de administrador:');
        if (password === 'Pepillo2727#') {
          window.location.href = '/admin';
        }
      }}>🛡️</button>
    </div>
  );
}