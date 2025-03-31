import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white' | 'blue' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
  href?: string;
  useImage?: boolean;
  linkTo?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  withText = true,
  className,
  href,
  useImage = false,
  linkTo = '/'
}) => {
  // Configuración de tamaños
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-sm' },
    md: { icon: 'h-8 w-8', text: 'text-base' },
    lg: { icon: 'h-10 w-10', text: 'text-lg' },
    xl: { icon: 'h-12 w-12', text: 'text-xl' }
  };

  // Configuración de colores
  const colors = {
    default: { icon: 'text-blue-500', text: 'text-gray-800' },
    white: { icon: 'text-white', text: 'text-white' },
    blue: { icon: 'text-blue-500', text: 'text-blue-700' },
    dark: { icon: 'text-blue-400', text: 'text-gray-700' }
  };

  // Componente SVG del logo (inline o imagen)
  const LogoIcon = useImage ? (
    <img 
      src="/images/logo.svg" 
      alt="OnCall Clinic Logo"
      className={sizes[size].icon}
    />
  ) : (
    <svg 
      className={cn(sizes[size].icon, colors[variant].icon, "fill-current")} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M100 0C60.8 0 29.2 31.6 29.2 70.8C29.2 117.7 100 200 100 200C100 200 170.8 117.7 170.8 70.8C170.8 31.6 139.2 0 100 0ZM100 46.2C104.8 46.2 109.2 47.7 113.1 50.8L100 63.8L86.9 50.8C90.8 47.7 95.2 46.2 100 46.2ZM70 67.7L83.1 80.8L70 93.8C66.9 89.9 65.4 85.5 65.4 80.8C65.4 76 66.9 71.5 70 67.7ZM100 115.4C95.2 115.4 90.8 113.8 86.9 110.8L100 97.7L113.1 110.8C109.2 113.8 104.8 115.4 100 115.4ZM130 93.8L116.9 80.8L130 67.7C133.1 71.5 134.6 76 134.6 80.8C134.6 85.5 133.1 89.9 130 93.8Z" />
    </svg>
  );

  // Componente del texto del logo
  const LogoText = withText && (
    <div className={cn("flex flex-col ml-2", sizes[size].text, colors[variant].text, "font-bold leading-none")}>
      <span>OnCall</span>
      <span>Clinic</span>
    </div>
  );

  // Renderizado con o sin enlace
  const logoContent = (
    <div className={cn("flex items-center", className)}>
      {LogoIcon}
      {LogoText}
    </div>
  );

  // Decidir qué tipo de enlace usar (href o linkTo)
  const targetHref = href || linkTo;

  // Si se proporciona un enlace, usamos el componente Link de wouter
  // Nota: En versiones recientes de wouter, <Link> envuelve automáticamente el contenido
  // sin necesidad de un elemento <a> explícito que puede causar problemas de anidamiento
  return targetHref ? (
    <Link href={targetHref} className="inline-flex">
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
};

export default Logo;