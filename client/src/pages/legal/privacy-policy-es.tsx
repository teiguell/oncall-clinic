import React from 'react';

export default function PrivacyPolicyES() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Información del Responsable del Tratamiento</h2>
              <p className="mb-4">
                <strong>OnCall Clinic</strong> (en adelante, "la Plataforma") actúa como <strong>intermediario por cuenta ajena</strong> 
                facilitando la contratación de servicios médicos a domicilio entre pacientes y profesionales sanitarios registrados. 
                Los servicios médicos son prestados directamente por los médicos registrados en nuestra plataforma.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Denominación social: OnCall Clinic S.L.</li>
                <li>CIF: B-12345678</li>
                <li>Dirección: Calle Ejemplo, 123, 28001 Madrid, España</li>
                <li>Email: privacy@oncallclinic.com</li>
                <li>Teléfono: +34 900 123 456</li>
                <li>Contacto DPO: dpo@oncallclinic.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Datos que Recopilamos</h2>
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Datos de Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos identificativos: nombre, apellidos, DNI/NIE</li>
                <li>Datos de contacto: email, teléfono, dirección postal</li>
                <li>Datos médicos: motivo de consulta, historial médico (cuando se proporcione)</li>
                <li>Datos de geolocalización: para coordinar las visitas médicas</li>
                <li>Datos de pago: información necesaria para procesar el pago a través de Revolut Pay</li>
                <li>Datos de uso: interacción con la plataforma, cookies, información del dispositivo</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Datos de Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos profesionales: número de colegiación, especialidad, experiencia</li>
                <li>Datos fiscales: NIF, domicilio fiscal (para facturación)</li>
                <li>Datos bancarios: IBAN para transferencias de honorarios</li>
                <li>Documentación: DNI, certificados profesionales</li>
                <li>Geolocalización: para mostrar ubicación en tiempo real durante consultas</li>
                <li>Documentos de verificación: documentos de identidad, credenciales profesionales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Finalidad del Tratamiento de Datos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitar la contratación de servicios médicos entre pacientes y médicos</li>
                <li>Procesamiento de pagos y generación de facturas</li>
                <li>Comunicación entre las partes (chat, notificaciones)</li>
                <li>Seguimiento en tiempo real de las consultas médicas</li>
                <li>Gestión de reclamaciones y atención al cliente</li>
                <li>Cumplimiento de obligaciones legales y fiscales</li>
                <li>Mejora del servicio mediante análisis estadísticos</li>
                <li>Prevención del fraude y seguridad de la plataforma</li>
                <li>Comunicaciones de marketing (con consentimiento explícito)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Base Jurídica</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Ejecución contractual:</strong> para prestar servicios de intermediación</li>
                <li><strong>Consentimiento:</strong> para datos médicos y comunicaciones de marketing</li>
                <li><strong>Obligación legal:</strong> para cumplir normativas fiscales y sanitarias</li>
                <li><strong>Interés legítimo:</strong> para prevención de fraude y mejora del servicio</li>
                <li><strong>Intereses vitales:</strong> en situaciones médicas de emergencia</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cesiones de Datos</h2>
              <p className="mb-4">Sus datos podrán ser comunicados a:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Médicos asignados (solo datos necesarios para la consulta)</li>
                <li>Proveedores de pago (Revolut) para procesar transacciones</li>
                <li>Autoridades competentes cuando sea legalmente requerido</li>
                <li>Proveedores de servicios técnicos bajo acuerdos de confidencialidad</li>
                <li>Servicios de verificación profesional (para validación de médicos)</li>
                <li>Compañías de seguros (con consentimiento explícito para reclamaciones)</li>
              </ul>
              <p className="mb-4">
                <strong>Transferencias internacionales:</strong> Algunos proveedores de servicios pueden estar ubicados fuera de la UE. 
                En estos casos, garantizamos una protección adecuada mediante decisiones de adecuación o garantías apropiadas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Conservación de Datos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos de facturación: 6 años (obligación fiscal)</li>
                <li>Datos médicos: 5 años (Ley de Autonomía del Paciente)</li>
                <li>Datos de contacto: hasta que solicite la eliminación</li>
                <li>Datos de geolocalización: 24 horas después de la consulta</li>
                <li>Datos de marketing: hasta que retire el consentimiento</li>
                <li>Logs de seguridad: 12 meses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Sus Derechos</h2>
              <p className="mb-4">Según el RGPD, tiene derecho a:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Acceso:</strong> obtener información sobre sus datos personales</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos</li>
                <li><strong>Supresión:</strong> eliminar sus datos (derecho al olvido)</li>
                <li><strong>Limitación:</strong> restringir el tratamiento en determinadas circunstancias</li>
                <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado</li>
                <li><strong>Oposición:</strong> oponerse al tratamiento basado en intereses legítimos</li>
                <li><strong>Retirar consentimiento:</strong> en cualquier momento para tratamientos basados en consentimiento</li>
                <li><strong>Presentar reclamación:</strong> ante la Agencia Española de Protección de Datos (AEPD)</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contacte: <strong>privacy@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Responderemos en el plazo de un mes desde la recepción de su solicitud.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Medidas de Seguridad</h2>
              <p className="mb-4">
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
                contra el acceso no autorizado, alteración, divulgación o destrucción, incluyendo:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Controles de acceso y sistemas de autenticación</li>
                <li>Auditorías de seguridad regulares y evaluaciones de vulnerabilidades</li>
                <li>Formación del personal en protección de datos</li>
                <li>Procedimientos de respuesta a incidentes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Cookies y Seguimiento</h2>
              <p className="mb-4">
                Utilizamos cookies y tecnologías similares para mejorar su experiencia. 
                Para información detallada, consulte nuestra <a href="/legal/cookies-policy-es" className="text-blue-600 hover:underline">Política de Cookies</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Menores de Edad</h2>
              <p className="mb-4">
                Nuestros servicios están dirigidos a personas mayores de 18 años. Para menores, se requiere 
                consentimiento de padres o tutores. No recopilamos conscientemente datos personales de niños menores de 13 años.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Actualizaciones de esta Política</h2>
              <p className="mb-4">
                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos cualquier cambio 
                material por email o a través de la plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contacto y Reclamaciones</h2>
              <p className="mb-4">
                Para cualquier consulta sobre esta política de privacidad: <strong>privacy@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Puede presentar reclamaciones ante la Agencia Española de Protección de Datos (AEPD): 
                <a href="https://www.aepd.es" className="text-blue-600 hover:underline">www.aepd.es</a>
              </p>
              <p className="mb-4">
                Dirección: C/ Jorge Juan, 6, 28001 Madrid, España<br/>
                Teléfono: +34 901 100 099
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}