import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface LogoIconProps {
  className?: string;
  color?: string;
  variant?: 'outline' | 'filled';
  inverted?: boolean;
  useImage?: boolean;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ 
  className, 
  color = "#0085FF",
  variant = 'filled',
  inverted = false,
  useImage = true // Por defecto usar imagen
}) => {
  const { t } = useTranslation();
  
  // Use the provided color, or adjust based on inverted state
  const mainColor = inverted ? '#FFFFFF' : color;
  const crossColor = variant === 'filled' ? 'white' : mainColor;
  const circleFill = variant === 'filled' ? mainColor : 'none';
  const strokeColor = variant === 'outline' ? mainColor : 'none';
  const strokeWidth = variant === 'outline' ? 4 : 0;

  if (useImage) {
    return (
      <img 
        src="/images/oncall-clinic-icon.png" 
        alt={t('common.brand')}
        className={cn(
          "w-full h-full object-contain", 
          inverted ? 'filter brightness-0 invert' : '',
          className
        )}
      />
    );
  }

  // Fallback a SVG si useImage es false
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      aria-label="OnCall Clinic Logo"
    >
      {/* Main Pin Shape */}
      <path 
        d="M50 0C33.13 0 19.44 13.69 19.44 30.56C19.44 51.39 50 100 50 100S80.56 51.39 80.56 30.56C80.56 13.69 66.87 0 50 0ZM50 44.44C42.33 44.44 36.11 38.22 36.11 30.56C36.11 22.89 42.33 16.67 50 16.67C57.67 16.67 63.89 22.89 63.89 30.56C63.89 38.22 57.67 44.44 50 44.44Z" 
        fill={circleFill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Cross in the center */}
      <rect x="34" y="24" width="32" height="12" rx="2" fill={crossColor} />
      <rect x="44" y="15" width="12" height="32" rx="2" fill={crossColor} />
    </svg>
  );
};

export default LogoIcon;