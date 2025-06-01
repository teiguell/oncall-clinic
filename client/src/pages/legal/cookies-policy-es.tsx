import React from 'react';

export default function CookiesPolicyES() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. ¿Qué son las cookies?</h2>
              <p className="mb-4">
                Las cookies son pequeños archivos de texto que los sitios web envían a su dispositivo 
                cuando los visita. Se almacenan en su navegador y nos permiten reconocer su dispositivo 
                y recordar información sobre su visita.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. ¿Cómo utilizamos las cookies?</h2>
              <p className="mb-4">
                OnCall Clinic utiliza cookies para mejorar su experiencia de usuario, analizar el tráfico 
                del sitio web y personalizar el contenido. Las cookies nos ayudan a:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Mantener su sesión activa durante su visita</li>
                <li>Recordar sus preferencias de idioma</li>
                <li>Analizar cómo utiliza nuestros servicios</li>
                <li>Mejorar la funcionalidad de la plataforma</li>
                <li>Proporcionar funciones de seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Tipos de cookies que utilizamos</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Cookies estrictamente necesarias</h3>
              <p className="mb-4">
                Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones. 
                Sin estas cookies, no podríamos proporcionar los servicios que solicita.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Propósito</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">session_id</td>
                      <td className="py-2">Mantiene su sesión de usuario</td>
                      <td className="py-2">Sesión</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Protección contra ataques CSRF</td>
                      <td className="py-2">Sesión</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">cookie_consent</td>
                      <td className="py-2">Recuerda sus preferencias de cookies</td>
                      <td className="py-2">1 año</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Cookies de funcionalidad</h3>
              <p className="mb-4">
                Estas cookies permiten que el sitio web recuerde las opciones que usted hace 
                y proporcionan funciones mejoradas y más personales.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Propósito</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">user_language</td>
                      <td className="py-2">Recuerda su idioma preferido</td>
                      <td className="py-2">1 año</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">theme_preference</td>
                      <td className="py-2">Recuerda su tema visual preferido</td>
                      <td className="py-2">6 meses</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.3 Cookies analíticas</h3>
              <p className="mb-4">
                Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, 
                proporcionándonos información sobre las áreas visitadas, el tiempo de permanencia y 
                cualquier problema encontrado.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Propósito</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - Distingue usuarios</td>
                      <td className="py-2">2 años</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">_ga_*</td>
                      <td className="py-2">Google Analytics - Estado de la sesión</td>
                      <td className="py-2">2 años</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.4 Cookies de terceros</h3>
              <p className="mb-4">
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Maps:</strong> Para mostrar mapas y ubicaciones</li>
                <li><strong>Revolut Pay:</strong> Para procesar pagos seguros</li>
                <li><strong>SendGrid:</strong> Para el envío de emails transaccionales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Gestión de cookies</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Panel de consentimiento</h3>
              <p className="mb-4">
                Al visitar nuestro sitio web por primera vez, verá un banner de cookies que le permite:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Aceptar todas las cookies</li>
                <li>Rechazar cookies no esenciales</li>
                <li>Personalizar sus preferencias por categoría</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Configurar preferencias de cookies</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Puede cambiar sus preferencias en cualquier momento haciendo clic en el botón a continuación:
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  Gestionar cookies
                </button>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Configuración del navegador</h3>
              <p className="mb-4">
                También puede gestionar las cookies directamente desde su navegador:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Chrome:</strong> Configuración > Privacidad y seguridad > Cookies y otros datos de sitios</li>
                <li><strong>Firefox:</strong> Preferencias > Privacidad y seguridad > Cookies y datos del sitio</li>
                <li><strong>Safari:</strong> Preferencias > Privacidad > Gestionar datos de sitios web</li>
                <li><strong>Edge:</strong> Configuración > Privacidad, búsqueda y servicios > Cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cookies en dispositivos móviles</h2>
              <p className="mb-4">
                Si accede a nuestros servicios desde un dispositivo móvil, las cookies funcionan de manera similar. 
                Puede gestionar las cookies a través de la configuración de su navegador móvil.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Consecuencias de desactivar cookies</h2>
              <p className="mb-4">
                Si decide desactivar las cookies, algunas funciones de nuestro sitio web pueden no funcionar correctamente:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Podría necesitar iniciar sesión repetidamente</li>
                <li>Sus preferencias de idioma no se recordarán</li>
                <li>Algunas funciones interactivas pueden no estar disponibles</li>
                <li>La experiencia de usuario puede verse afectada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Actualizaciones de esta política</h2>
              <p className="mb-4">
                Podemos actualizar esta Política de Cookies ocasionalmente. Cuando lo hagamos, 
                revisaremos la fecha de "última actualización" en la parte superior de esta página. 
                Le recomendamos que revise esta política periódicamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Más información</h2>
              <p className="mb-4">
                Para obtener más información sobre las cookies, puede visitar:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://www.aboutcookies.org" className="text-blue-600 hover:underline">www.aboutcookies.org</a></li>
                <li><a href="https://www.allaboutcookies.org" className="text-blue-600 hover:underline">www.allaboutcookies.org</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contacto</h2>
              <p className="mb-4">
                Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos en:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Email: <strong>privacy@oncallclinic.com</strong></li>
                <li>Teléfono: <strong>+34 900 123 456</strong></li>
                <li>Dirección: <strong>Calle Ejemplo, 123, 28001 Madrid, España</strong></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}