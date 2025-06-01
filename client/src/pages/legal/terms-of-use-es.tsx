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
                OnCall Clinic S.L. (en adelante, "la Plataforma") actúa como <strong>intermediario por cuenta ajena</strong> 
                facilitando la contratación de servicios médicos a domicilio entre pacientes y profesionales sanitarios 
                independientes registrados.
              </p>
              <p className="mb-4">
                <strong>IMPORTANTE:</strong> Los servicios médicos son prestados directamente por los médicos registrados. 
                La Plataforma NO presta servicios sanitarios, únicamente facilita el contacto 
                y coordinación entre las partes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Usuarios de la Plataforma</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Deben ser mayores de 18 años o contar con autorización parental</li>
                <li>Deben proporcionar información veraz y actualizada</li>
                <li>Son responsables de pagar directamente al médico por los servicios recibidos</li>
                <li>Pueden acceder al seguimiento de citas mediante código único</li>
                <li>Deben respetar los horarios profesionales y disponibilidad de los médicos</li>
                <li>Deben facilitar acceso seguro a su domicilio para las visitas médicas</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Deben estar colegiados y en ejercicio activo</li>
                <li>Son profesionales independientes que facturan directamente a los pacientes</li>
                <li>Deben completar sus datos fiscales para activar su perfil</li>
                <li>Son responsables de la prestación de servicios médicos</li>
                <li>Pagan una comisión a la Plataforma por cada servicio gestionado</li>
                <li>Deben mantener un seguro de responsabilidad civil profesional válido</li>
                <li>Deben cumplir con la deontología profesional y estándares médicos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Funcionamiento del Servicio</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Proceso de Reserva</h3>
              <ol className="list-decimal pl-6 mb-4">
                <li>El paciente solicita consulta médica a través de la Plataforma</li>
                <li>La Plataforma asigna un médico disponible en la zona</li>
                <li>El paciente realiza el pago a través de Revolut Pay</li>
                <li>Se generan automáticamente las facturas correspondientes</li>
                <li>El médico acude al domicilio del paciente</li>
                <li>Ambas partes confirman la finalización del servicio</li>
              </ol>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Sistema de Facturación</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>El médico emite factura al paciente (exenta de IVA según normativa sanitaria)</li>
                <li>La Plataforma emite factura al médico por comisión de intermediación (con IVA)</li>
                <li>Todas las facturas se generan y envían automáticamente</li>
                <li>Las facturas cumplen con la legislación fiscal española</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Precios y Pagos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Los precios son establecidos independientemente por cada médico</li>
                <li>El pago se realiza a través de Revolut Pay antes de la consulta</li>
                <li>Los honorarios se transfieren al médico tras descontar comisión de la Plataforma</li>
                <li>La comisión de la Plataforma es del 15% del importe total</li>
                <li>Todos los precios incluyen los impuestos aplicables</li>
                <li>Los precios pueden variar según especialidad, horario y ubicación</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Seguimiento y Trazabilidad</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Cada cita genera un código único de seguimiento</li>
                <li>Los pacientes pueden consultar el estado en tiempo real sin registro</li>
                <li>Geolocalización del médico proporcionada durante 15 minutos previos a llegada</li>
                <li>Sistema de chat directo entre médico y paciente</li>
                <li>Confirmación obligatoria de finalización por ambas partes</li>
                <li>Registro de auditoría completo para calidad y seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Responsabilidades</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 Responsabilidades de la Plataforma</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitar el contacto entre médicos y pacientes</li>
                <li>Procesar pagos de forma segura</li>
                <li>Gestionar reclamaciones relacionadas con el servicio de intermediación</li>
                <li>Mantener la confidencialidad de los datos</li>
                <li>Verificar credenciales y colegiación de médicos</li>
                <li>Proporcionar soporte técnico para la plataforma</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 Responsabilidades de los Médicos</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Prestar servicios médicos conforme a la deontología profesional</li>
                <li>Mantener seguro de responsabilidad civil profesional válido</li>
                <li>Cumplir horarios y compromisos adquiridos</li>
                <li>Facturar correctamente a los pacientes</li>
                <li>Respetar la privacidad del paciente y confidencialidad médica</li>
                <li>Mantener licencias y certificaciones profesionales vigentes</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.3 Responsabilidades de los Pacientes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Proporcionar información médica veraz</li>
                <li>Facilitar el acceso al domicilio</li>
                <li>Realizar el pago según lo acordado</li>
                <li>Confirmar la finalización del servicio</li>
                <li>Respetar el tiempo profesional del médico</li>
                <li>Seguir las recomendaciones y prescripciones médicas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cancelaciones y Reembolsos</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Cancelación gratuita hasta 2 horas antes de la cita</li>
                <li>Cancelaciones tardías: reembolso del 50%</li>
                <li>Incomparecencia del médico: reembolso completo</li>
                <li>Incomparecencia del paciente: sin reembolso</li>
                <li>Reembolsos procesados en 3-5 días laborables</li>
                <li>Cancelaciones por emergencia evaluadas caso por caso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Sistema de Quejas y Reclamaciones</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Formulario de queja disponible tras cada consulta</li>
                <li>Código único de seguimiento para cada reclamación</li>
                <li>Respuesta garantizada en 48 horas laborables</li>
                <li>Posibilidad de escalado a autoridades competentes</li>
                <li>Servicio de mediación para resolución de disputas</li>
                <li>Derecho a arbitraje externo si es necesario</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitación de Responsabilidad</h2>
              <p className="mb-4">
                La Plataforma NO se hace responsable de:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>La calidad o resultado de los servicios médicos prestados</li>
                <li>Las decisiones médicas tomadas por los profesionales</li>
                <li>Complicaciones derivadas del tratamiento</li>
                <li>Incumplimientos del médico en la relación directa con el paciente</li>
                <li>Eventos de fuerza mayor que impidan la prestación del servicio</li>
                <li>Fallos técnicos fuera de nuestro control razonable</li>
              </ul>
              <p className="mb-4">
                La responsabilidad máxima se limita al importe pagado por el servicio específico.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Propiedad Intelectual</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Todo el contenido de la plataforma está protegido por derechos de propiedad intelectual</li>
                <li>Los usuarios no pueden copiar, modificar o distribuir contenido de la plataforma</li>
                <li>El contenido generado por usuarios permanece como propiedad del usuario</li>
                <li>La plataforma tiene licencia para usar el contenido del usuario para la prestación del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Suspensión y Terminación de Cuentas</h2>
              <p className="mb-4">
                Nos reservamos el derecho de suspender o terminar cuentas por:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violación de estos términos</li>
                <li>Actividad fraudulenta</li>
                <li>Comportamiento inapropiado hacia otros usuarios</li>
                <li>Proporcionar información falsa</li>
                <li>Mala praxis profesional (para médicos)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Protección de Datos</h2>
              <p className="mb-4">
                El tratamiento de datos personales se rige por nuestra Política de Privacidad. 
                Todos los usuarios tienen derechos bajo el RGPD incluyendo acceso, rectificación y supresión.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Legislación Aplicable</h2>
              <p className="mb-4">
                Estos términos se rigen por la legislación española. Para cualquier disputa, 
                serán competentes los tribunales de Madrid, España.
              </p>
              <p className="mb-4">
                Este servicio cumple con:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Legislación Sanitaria Española</li>
                <li>RGPD Europeo</li>
                <li>Ley Española de Protección de Datos (LOPDGDD)</li>
                <li>Ley de Servicios de la Sociedad de la Información (LSSI-CE)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Actualizaciones de los Términos</h2>
              <p className="mb-4">
                Podemos actualizar estos términos ocasionalmente. Se notificará a los usuarios de cambios 
                materiales por email o notificación en la plataforma. El uso continuado constituye aceptación de los términos actualizados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">15. Contacto</h2>
              <p className="mb-4">
                Para consultas sobre estos términos: <strong>legal@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Para reclamaciones: <strong>complaints@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Atención al cliente: <strong>support@oncallclinic.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}