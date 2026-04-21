import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, name, ...props }, ref) => {
    // Ensure label+input are wired (WCAG 1.3.1, 4.1.2)
    const reactAutoId = React.useId()
    const inputId = id || name || `input-${reactAutoId}`
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            name={name}
            type={type}
            className={cn(
              // text-base (16px) on mobile avoids iOS auto-zoom; md:text-[14px] for desktop density.
              // Prototype tokens: h-12, rounded-xl, border-[1.5px], px-3.5, text-[14px]
              "flex h-12 w-full rounded-xl border-[1.5px] border-input bg-background px-3.5 py-2 text-base md:text-[14px] ring-offset-background transition-colors focus:border-primary",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "hover:border-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-destructive" role="alert" aria-live="polite">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
