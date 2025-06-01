import React from 'react';

export default function TermsOfUseES() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones de Uso</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Objeto y Naturaleza del Servicio</h2>
              <p className="mb-4">
                OnCall Clinic S.L. (en adelante, "la Plataforma") actúa como <strong>intermediario en nombre ajeno</strong> 
                facilitando la contratación de servicios médicos a domicilio entre pacientes y profesionales médicos 
                colegiados independientes.
              </p>
              <p className="mb-4">
                <strong>IMPORTANTE:</strong> Los servicios médicos son prestados directamente por los médicos 
                registrados. La Plataforma NO presta servicios sanitarios, únicamente facilita el contacto 
                y la coordinación entre las partes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Usuarios de la Plataforma</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Deben ser mayores de 18 años o contar con autorización parental</li>
                <li>Deben proporcionar información veraz y actualizada</li>
                <li>Son responsables de pagar directamente al médico por los servicios recibidos</li>
                <li>Pueden acceder al seguimiento de su cita mediante código único</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Deben estar colegiados y en ejercicio activo</li>
                <li>Son profesionales independientes que facturan directamente al paciente</li>
                <li>Deben completar sus datos fiscales para activar su perfil</li>
                <li>Son responsables de la prestación del servicio médico</li>
                <li>Pagan una comisión a la Plataforma por cada servicio gestionado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Funcionamiento del Servicio</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Proceso de Contratación</h3>
              <ol className="list-decimal pl-6 mb-4">
                <li>El paciente solicita una consulta médica través de la Plataforma</li>
                <li>La Plataforma asigna un médico disponible en la zona</li>
                <li>El paciente realiza el pago a través de Revolut Pay</li>
                <li>Se generan automáticamente las facturas correspondientes</li>
                <li>El médico acude al domicilio del paciente</li>
                <li>Ambas partes confirman la finalización del servicio</li>
              </ol>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Sistema de Facturación</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>El médico emite factura al paciente (exenta de IVA según normativa sanitaria)</li>
                <li>La Plataforma emite factura al médico por la comisión de intermediación (con IVA)</li>
                <li>Todas las facturas se generan y envían automáticamente</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Precios y Pagos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Los precios son establecidos por cada médico de forma independiente</li>
                <li>El pago se realiza a través de Revolut Pay antes de la consulta</li>
                <li>Los honorarios se transfieren al médico tras deducir la comisión de la Plataforma</li>
                <li>La comisión de la Plataforma es del 15% del importe total</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Seguimiento y Trazabilidad</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Cada cita genera un código de seguimiento único</li>
                <li>Los pacientes pueden consultar el estado en tiempo real sin registro</li>
                <li>Se proporciona geolocalización del médico durante los 15 minutos previos</li>
                <li>Sistema de chat directo entre médico y paciente</li>
                <li>Confirmación obligatoria de finalización por ambas partes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Responsabilidades</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 De la Plataforma</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitar el contacto entre médicos y pacientes</li>
                <li>Procesar pagos de forma segura</li>
                <li>Gestionar reclamaciones relacionadas con el servicio de intermediación</li>
                <li>Mantener la confidencialidad de los datos</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 De los Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Prestar servicios médicos según deontología profesional</li>
                <li>Mantener seguros profesionales vigentes</li>
                <li>Cumplir horarios y compromisos adquiridos</li>
                <li>Facturar correctamente al paciente</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.3 De los Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Proporcionar información médica veraz</li>
                <li>Facilitar el acceso al domicilio</li>
                <li>Realizar el pago según lo acordado</li>
                <li>Confirmar la finalización del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cancelaciones y Reembolsos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Cancelación gratuita hasta 2 horas antes de la cita</li>
                <li>Cancelaciones tardías: reembolso del 50%</li>
                <li>No presentación del médico: reembolso completo</li>
                <li>Los reembolsos se procesan en 3-5 días laborables</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-800 mb-4">8. Sistema de Quejas y Reclamaciones</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Formulario de quejas disponible tras cada consulta</li>
                <li>Código único de seguimiento para cada reclamación</li>
                <li>Respuesta garantizada en 48 horas laborables</li>
                <li>Posibilidad de escalado a autoridades competentes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitación de Responsabilidad</h2>
              <p className="mb-4">
                La Plataforma NO es responsable de:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>La calidad o resultado de los servicios médicos prestados</li>
                <li>Decisiones médicas tomadas por los profesionales</li>
                <li>Complicaciones derivadas del tratamiento</li>
                <li>Incumplimientos del médico en su relación directa con el paciente</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Legislación Aplicable</h2>
              <p className="mb-4">
                Estos términos se rigen por la legislación española. Para cualquier controversia, 
                los tribunales competentes serán los de Madrid, España.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contacto</h2>
              <p className="mb-4">
                Para consultas sobre estos términos: <strong>legal@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Para reclamaciones: <strong>complaints@oncallclinic.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}