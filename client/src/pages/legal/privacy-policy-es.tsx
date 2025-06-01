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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Información del Responsable</h2>
              <p className="mb-4">
                <strong>OnCall Clinic</strong> (en adelante, "la Plataforma") actúa como intermediario en nombre ajeno 
                entre pacientes y profesionales médicos colegiados. Los servicios médicos son prestados directamente 
                por los médicos registrados en nuestra plataforma.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Denominación social: OnCall Clinic S.L.</li>
                <li>CIF: B-12345678</li>
                <li>Domicilio: Calle Ejemplo, 123, 28001 Madrid, España</li>
                <li>Email: privacy@oncallclinic.com</li>
                <li>Teléfono: +34 900 123 456</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Datos que Recopilamos</h2>
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Datos de Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos de identificación: nombre, apellidos, DNI/NIE</li>
                <li>Datos de contacto: email, teléfono, dirección postal</li>
                <li>Datos médicos: motivo de consulta, historial médico (cuando sea proporcionado)</li>
                <li>Datos de geolocalización: para coordinar la visita médica</li>
                <li>Datos de pago: información necesaria para procesar el pago a través de Revolut Pay</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Datos de Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos profesionales: número de colegiado, especialidad, experiencia</li>
                <li>Datos fiscales: NIF, domicilio fiscal (para facturación)</li>
                <li>Datos bancarios: IBAN para transferencias de honorarios</li>
                <li>Documentación: DNI, certificados profesionales</li>
                <li>Geolocalización: para mostrar ubicación en tiempo real durante las consultas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Finalidades del Tratamiento</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitar la contratación de servicios médicos entre pacientes y doctores</li>
                <li>Procesamiento de pagos y emisión de facturas</li>
                <li>Comunicación entre las partes (chat, notificaciones)</li>
                <li>Seguimiento en tiempo real de las consultas médicas</li>
                <li>Gestión de reclamaciones y atención al cliente</li>
                <li>Cumplimiento de obligaciones legales y fiscales</li>
                <li>Mejora de nuestros servicios mediante análisis estadístico</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Base Legal</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Ejecución contractual:</strong> para prestar el servicio de intermediación</li>
                <li><strong>Consentimiento:</strong> para datos médicos y comunicaciones comerciales</li>
                <li><strong>Obligación legal:</strong> para cumplir con normativas fiscales y sanitarias</li>
                <li><strong>Interés legítimo:</strong> para prevención de fraudes y mejora del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Compartición de Datos</h2>
              <p className="mb-4">Sus datos pueden ser compartidos con:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Médicos asignados (solo datos necesarios para la consulta)</li>
                <li>Proveedores de pago (Revolut) para procesar transacciones</li>
                <li>Autoridades competentes cuando sea legalmente requerido</li>
                <li>Proveedores de servicios técnicos bajo acuerdos de confidencialidad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Conservación de Datos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Datos de facturación: 6 años (obligación fiscal)</li>
                <li>Datos médicos: 5 años (Ley de Autonomía del Paciente)</li>
                <li>Datos de contacto: hasta que solicite la baja</li>
                <li>Datos de geolocalización: 24 horas después de la consulta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Sus Derechos</h2>
              <p className="mb-4">Tiene derecho a:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Suprimir sus datos (derecho al olvido)</li>
                <li>Limitar el tratamiento</li>
                <li>Portabilidad de datos</li>
                <li>Oposición al tratamiento</li>
                <li>Retirar el consentimiento en cualquier momento</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contacte con: <strong>privacy@oncallclinic.com</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Seguridad</h2>
              <p className="mb-4">
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos 
                personales contra el acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contacto y Reclamaciones</h2>
              <p className="mb-4">
                Para cualquier consulta sobre esta política de privacidad: <strong>privacy@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Puede presentar reclamaciones ante la Agencia Española de Protección de Datos (AEPD): 
                <a href="https://www.aepd.es" className="text-blue-600 hover:underline">www.aepd.es</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}