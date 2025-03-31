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

/**
 * Componente Logo con opciones de personalización
 * @param variant Color del logo: default, white, blue, dark (determina si usa logo claro u oscuro)
 * @param size Tamaño del logo: sm, md, lg, xl
 * @param withText Mostrar texto junto al icono (solo para SVG inline, no para imagen)
 * @param className Clases CSS adicionales
 * @param href URL para enlace externo (usa <a>)
 * @param useImage Usar imagen SVG en lugar de componente inline
 * @param linkTo URL para enlaces internos (usa wouter <Link>)
 */
const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  withText = true,
  className,
  href,
  useImage = true,
  linkTo = '/'
}) => {
  // Configuración de tamaños
  const sizes = {
    sm: { icon: 'h-6 w-auto', text: 'text-sm' },
    md: { icon: 'h-8 w-auto', text: 'text-base' },
    lg: { icon: 'h-10 w-auto', text: 'text-lg' },
    xl: { icon: 'h-12 w-auto', text: 'text-xl' }
  };

  // Configuración de colores
  const colors = {
    default: { icon: 'text-blue-500', text: 'text-gray-800' },
    white: { icon: 'text-white', text: 'text-white' },
    blue: { icon: 'text-blue-500', text: 'text-blue-700' },
    dark: { icon: 'text-blue-400', text: 'text-gray-700' }
  };

  // Configuración de tamaños para la imagen del logo
  const imageSizes = {
    sm: { width: 80 },
    md: { width: 120 },
    lg: { width: 150 },
    xl: { width: 180 }
  };

  // Determinar qué logo SVG usar basado en la variante
  const logoSrc = variant === 'white' || variant === 'dark' 
    ? '/images/logo-dark.svg' 
    : '/images/logo-light.svg';

  // Componente SVG del logo (inline o imagen)
  const LogoIcon = useImage ? (
    <img 
      src={logoSrc}
      alt="OnCall Clinic Logo"
      className={sizes[size].icon}
      style={{ 
        objectFit: 'contain',
        width: imageSizes[size].width,
        height: 'auto'
      }}
    />
  ) : (
    <svg 
      className={cn(sizes[size].icon, colors[variant].icon, "fill-current")} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="65" fill="currentColor" />
      <path d="M100 60V140M60 100H140" stroke="white" strokeWidth="18" strokeLinecap="round" />
    </svg>
  );

  // Componente del texto del logo (solo se muestra si no se usa imagen y withText es true)
  const LogoText = (withText && !useImage) && (
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