import React from 'react';
import { cn } from "@/lib/utils";
import { LogoIcon } from './LogoIcon';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  useImage?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  useImage = false
}) => {
  const sizeClasses = {
    sm: 'h-6 md:h-8',
    md: 'h-8 md:h-10',
    lg: 'h-10 md:h-12'
  };

  const logoTextClasses = {
    sm: 'text-lg md:text-xl ml-2',
    md: 'text-xl md:text-2xl ml-3',
    lg: 'text-2xl md:text-3xl ml-3'
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn(sizeClasses[size])}>
        {useImage ? (
          <img 
            src="/images/oncall-clinic-logo.png" 
            alt="OnCall Clinic" 
            className={cn(
              "h-full w-auto object-contain", 
              variant === 'white' ? 'filter brightness-0 invert' : ''
            )}
          />
        ) : (
          <LogoIcon color={variant === 'white' ? '#FFFFFF' : '#0085FF'} />
        )}
      </div>
      
      {showText && (
        <div className={cn(
          "font-bold flex flex-col", 
          logoTextClasses[size],
          variant === 'white' ? 'text-white' : 'text-gray-800'
        )}>
          <span className="leading-tight">OnCall</span>
          <span className="leading-tight">Clinic</span>
        </div>
      )}
    </div>
  );
};

export default Logo;