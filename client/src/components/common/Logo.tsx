import React from 'react';
import { cn } from "@/lib/utils";
import { LogoIcon } from './LogoIcon';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  useImage?: boolean;
  iconVariant?: 'outline' | 'filled';
  responsive?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  useImage = true, // Cambiado a true por defecto para usar la imagen
  iconVariant = 'filled',
  responsive = true,
  layout = 'horizontal'
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    xs: 'h-6',
    sm: responsive ? 'h-7 md:h-8' : 'h-8',
    md: responsive ? 'h-9 md:h-10' : 'h-10',
    lg: responsive ? 'h-10 md:h-12' : 'h-12',
    xl: responsive ? 'h-12 md:h-16' : 'h-16'
  };

  const logoTextClasses = {
    xs: 'text-sm ml-1.5',
    sm: responsive ? 'text-base md:text-lg ml-2' : 'text-lg ml-2',
    md: responsive ? 'text-lg md:text-xl ml-2.5' : 'text-xl ml-2.5',
    lg: responsive ? 'text-xl md:text-2xl ml-3' : 'text-2xl ml-3',
    xl: responsive ? 'text-2xl md:text-3xl ml-3' : 'text-3xl ml-3'
  };

  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const logoColor = variant === 'white' ? '#FFFFFF' : '#0085FF';

  return (
    <div className={cn(
      "flex items-center", 
      layout === 'vertical' && "flex-col", 
      className
    )}>
      {/* Logo/Icon */}
      <div className={cn(sizeClasses[size], "aspect-auto")}>
        {useImage ? (
          // Usar la imagen del logo proporcionada
          showText ? (
            // Mostrar el logo completo con texto incluido
            <img 
              src="/images/oncall-clinic-logo.png" 
              alt={t('common.brand')}
              className={cn(
                "h-full w-auto object-contain", 
                variant === 'white' ? 'filter brightness-0 invert' : ''
              )}
            />
          ) : (
            // Mostrar solo el icono
            <img 
              src="/images/oncall-clinic-icon.png" 
              alt={t('common.brand')}
              className={cn(
                "h-full w-auto object-contain", 
                variant === 'white' ? 'filter brightness-0 invert' : ''
              )}
            />
          )
        ) : (
          // Usar el componente SVG
          <LogoIcon 
            color={logoColor} 
            variant={iconVariant} 
            inverted={variant === 'white'} 
          />
        )}
      </div>
      
      {/* Text (solo si useImage es false o si queremos texto adicional) */}
      {showText && !useImage && (
        <div className={cn(
          "font-bold tracking-tight",
          layout === 'vertical' ? 'text-center mt-2' : logoTextClasses[size],
          layout === 'vertical' && (
            size === 'xs' ? 'text-xs' :
            size === 'sm' ? 'text-sm' :
            size === 'md' ? 'text-base' :
            size === 'lg' ? 'text-lg' :
            'text-xl'
          ),
          textColor
        )}>
          {layout === 'horizontal' ? (
            <div className="flex flex-col leading-none">
              <span className="leading-tight">OnCall</span>
              <span className="leading-tight">Clinic</span>
            </div>
          ) : (
            <>
              <div>OnCall</div>
              <div>Clinic</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;