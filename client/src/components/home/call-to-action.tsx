import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <div className="bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">¿Listo para probar MediHome?</span>
          <span className="block text-primary-200">Regístrate hoy y recibe tu primera consulta con 15% de descuento.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="text-primary-600 bg-white hover:bg-neutral-50">
                Registrarse como paciente
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link href="/register">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-700">
                Soy médico
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
