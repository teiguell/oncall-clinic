import { Link } from "wouter";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Heart 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-medical-kit">
                  <path d="M7.2 22H4a2 2 0 0 1-2-2v-4.76a2 2 0 0 1 .51-1.33L12 4l9.49 9.91a2 2 0 0 1 .51 1.33V20a2 2 0 0 1-2 2h-3.2"/>
                  <path d="M12 10v12"/>
                  <path d="M15 13h-6"/>
                </svg>
              </span>
              <span className="font-bold text-2xl text-white">MediHome</span>
            </div>
            <p className="mt-4 text-neutral-300">Conectamos pacientes con médicos certificados para consultas a domicilio. Atención médica profesional, cuando la necesites y donde la necesites.</p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook size={24} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram size={24} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter size={24} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">Servicios</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/doctors">
                  <a className="text-base text-neutral-400 hover:text-white">Consultas médicas</a>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <a className="text-base text-neutral-400 hover:text-white">Especialidades</a>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <a className="text-base text-neutral-400 hover:text-white">Médicos certificados</a>
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-base text-neutral-400 hover:text-white">Cómo funciona</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">Empresa</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-neutral-400 hover:text-white">Sobre nosotros</a>
              </li>
              <li>
                <a href="#" className="text-base text-neutral-400 hover:text-white">Contacto</a>
              </li>
              <li>
                <a href="#" className="text-base text-neutral-400 hover:text-white">Blog</a>
              </li>
              <li>
                <a href="#" className="text-base text-neutral-400 hover:text-white">Trabaja con nosotros</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-700 pt-8">
          <p className="text-base text-neutral-400 text-center">&copy; {new Date().getFullYear()} MediHome. Todos los derechos reservados.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-sm text-neutral-400 hover:text-white">Política de privacidad</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-white">Términos de servicio</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-white">Aviso legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
