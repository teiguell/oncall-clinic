import React from 'react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  useImage?: boolean;
  responsive?: boolean;
  layout?: 'horizontal' | 'vertical';
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  useImage = true, // Por defecto usamos la imagen del logo
  responsive = true,
  layout = 'horizontal',
  linkTo
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    xs: 'h-6',
    sm: responsive ? 'h-7 md:h-8' : 'h-8',
    md: responsive ? 'h-9 md:h-10' : 'h-10',
    lg: responsive ? 'h-12 md:h-16' : 'h-16',
    xl: responsive ? 'h-16 md:h-20' : 'h-20'
  };

  // Dependiendo de si es blanco o de color, usamos una imagen diferente o ajustamos filtros CSS
  const logoSrc = '/img/logo-oncallclinic.svg';
  const logoImageClasses = cn(
    sizeClasses[size],
    "w-auto",
    "transition-all",
    variant === 'white' && "brightness-0 invert"
  );

  const renderLogo = () => (
    <div className={cn(
      "flex items-center", 
      layout === 'vertical' && "flex-col", 
      className
    )}>
      {/* Logo (imagen o texto) */}
      {useImage ? (
        <img 
          src={logoSrc} 
          alt={t('common.brand')} 
          className={logoImageClasses}
        />
      ) : (
        <div className="flex flex-col leading-none font-bold tracking-tight text-2xl">
          <span className={variant === 'white' ? 'text-white' : 'text-primary-600'}>
            OnCall
          </span>
          <span className={variant === 'white' ? 'text-white' : 'text-primary-600'}>
            Clinic
          </span>
        </div>
      )}
    </div>
  );

  // Si se proporcionó un enlace, envolvemos el logo con un Link
  if (linkTo) {
    return (
      <Link href={linkTo}>
        <a className="no-underline">
          {renderLogo()}
        </a>
      </Link>
    );
  }

  return renderLogo();
};

export default Logo;