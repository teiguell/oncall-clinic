import { Clock, Shield, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SearchSection from "@/components/home/search-section";
import DoctorList from "@/components/home/doctor-list";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Atención médica a domicilio
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Cuidado médico profesional cuando lo necesitas
              </p>
              <Link href="/doctors">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Encontrar un Médico
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Por qué elegir OnCall Clinic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Atención médica domiciliaria</h3>
                <p className="text-gray-600 text-sm">Médicos certificados que vienen a tu hogar</p>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Pago seguro online</h3>
                <p className="text-gray-600 text-sm">Transacciones protegidas y transparentes</p>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Médicos verificados</h3>
                <p className="text-gray-600 text-sm">Profesionales colegiados y licenciados</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Busca un Médico</h3>
                <p className="text-gray-600">Encuentra médicos disponibles por especialidad o ubicación.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Reserva una Cita</h3>
                <p className="text-gray-600">Selecciona un horario conveniente y proporciona tu dirección.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">El Médico te Visita</h3>
                <p className="text-gray-600">El médico llega a tu ubicación en el horario programado.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Recibe Tratamiento</h3>
                <p className="text-gray-600">Obtén atención médica profesional en la comodidad de tu hogar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Comodidad</h3>
                <p className="text-gray-600">
                  Recibe atención médica sin salir de casa. Nuestros médicos vienen a ti cuando los necesitas.
                </p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Atención de Calidad</h3>
                <p className="text-gray-600">
                  Todos nuestros médicos son profesionales certificados con amplia experiencia en visitas médicas domiciliarias.
                </p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Seguridad Primero</h3>
                <p className="text-gray-600">
                  Protocolos sanitarios estrictos y procesos de verificación para garantizar tu seguridad y tranquilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <SearchSection />

        {/* Featured Doctors */}
        <DoctorList />

        {/* CTA Section */}
        <section className="py-12 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Encuentra un médico cualificado cerca de ti y reserva tu cita hoy.
            </p>
            <div className="space-x-4">
              <Link href="/doctors">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Buscar Médico
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}