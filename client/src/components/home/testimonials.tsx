import { Testimonial } from "@/types";
import { Star, StarHalf } from "lucide-react";

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "María López",
    rating: 5,
    comment: "El servicio fue excelente. El Dr. García llegó puntual, fue muy profesional y amable con mis hijos. Definitivamente volveré a usar MediHome para nuestras consultas pediátricas.",
    image: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    rating: 4,
    comment: "La comodidad de recibir atención médica en casa es incomparable. La Dra. Martínez fue muy detallista en su diagnóstico y me dio un seguimiento excelente después de la consulta.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Laura Fernández",
    rating: 4.5,
    comment: "Increíble servicio para personas mayores como mi madre. La app es fácil de usar y el médico fue muy paciente y cuidadoso. El proceso de pago también fue muy sencillo.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  }
];

// Component to render star ratings
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 text-yellow-400 fill-current" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-neutral-300" />
      ))}
    </div>
  );
};

export default function Testimonials() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Testimonios</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Lo que dicen nuestros pacientes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            Miles de pacientes satisfechos con nuestra atención médica
          </p>
        </div>

        <div className="mt-10 space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img className="h-12 w-12 rounded-full" src={testimonial.image} alt={testimonial.name} />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-neutral-900">{testimonial.name}</h4>
                  <div className="flex items-center">
                    <RatingStars rating={testimonial.rating} />
                  </div>
                </div>
              </div>
              <p className="text-neutral-700">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
