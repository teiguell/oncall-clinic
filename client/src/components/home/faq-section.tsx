import { useState } from "react";
import { FAQItem } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "¿Cómo funciona el servicio de médicos a domicilio?",
    answer: "MediHome conecta pacientes con médicos certificados disponibles para consultas a domicilio. Simplemente busca un médico por especialidad, ubicación y disponibilidad, reserva una cita y recibe atención médica profesional en la comodidad de tu hogar."
  },
  {
    id: 2,
    question: "¿Todos los médicos están certificados?",
    answer: "Sí, todos los médicos que forman parte de MediHome están debidamente certificados y colegiados. Verificamos cuidadosamente sus credenciales y experiencia antes de aceptarlos en nuestra plataforma."
  },
  {
    id: 3,
    question: "¿Cómo funciona el sistema de pagos?",
    answer: "Ofrecemos un sistema de pago seguro a través de nuestra plataforma. Puedes pagar con tarjeta de crédito/débito o mediante transferencia bancaria. El pago se realiza al confirmar la cita, y solo se procesa una vez completada la consulta."
  },
  {
    id: 4,
    question: "¿Qué pasa si necesito cancelar mi cita?",
    answer: "Puedes cancelar tu cita hasta 2 horas antes de la hora programada sin ningún cargo. Para cancelaciones con menos tiempo de antelación, se aplicará un cargo del 25% del costo de la consulta para compensar al médico por su tiempo reservado."
  },
  {
    id: 5,
    question: "¿MediHome cubre emergencias médicas?",
    answer: "MediHome no está diseñado para emergencias médicas. En caso de una emergencia, debes llamar inmediatamente al 112 o acudir al servicio de urgencias más cercano. Nuestro servicio está orientado a consultas médicas programadas y atención no urgente."
  }
];

export default function FAQSection() {
  const [openItemId, setOpenItemId] = useState<number>(1);

  const toggleItem = (id: number) => {
    setOpenItemId(openItemId === id ? -1 : id);
  };

  return (
    <div className="bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Preguntas frecuentes</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Resolvemos tus dudas
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            Todo lo que necesitas saber sobre MediHome
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          {faqItems.map((item) => (
            <div key={item.id} className={`${item.id > 1 ? 'mt-4' : ''} bg-white shadow overflow-hidden rounded-md`}>
              <div 
                className="px-6 py-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleItem(item.id)}
              >
                <h3 className="text-lg font-medium text-neutral-900">{item.question}</h3>
                {openItemId === item.id ? (
                  <ChevronUp className="h-5 w-5 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-500" />
                )}
              </div>
              <div className={`px-6 py-4 bg-neutral-50 border-t border-neutral-200 ${openItemId === item.id ? 'block' : 'hidden'}`}>
                <p className="text-neutral-700">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
