import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react';

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
  useImage = false // No usar imagen
}) => {
  const { t } = useTranslation();
  
  // Use the provided color, or adjust based on inverted state
  const mainColor = inverted ? '#FFFFFF' : color;
  const crossColor = variant === 'filled' ? 'white' : mainColor;
  const circleFill = variant === 'filled' ? mainColor : 'none';
  const strokeColor = variant === 'outline' ? mainColor : 'none';
  const strokeWidth = variant === 'outline' ? 4 : 0;

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-600 text-white", 
        className
      )}
    >
      <Stethoscope className="w-2/3 h-2/3" />
    </div>
  );
};

export default LogoIcon;