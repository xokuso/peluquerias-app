import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "salon" | "gold" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
          {
            "bg-black text-white hover:bg-black/90": variant === "default",
            "bg-gradient-salon text-white hover:bg-gradient-salon-hover shadow-salon hover:shadow-salon-lg transform hover:scale-105":
              variant === "salon",
            "bg-gold-500 text-white hover:bg-gold-600 shadow-gold hover:shadow-gold-lg transform hover:scale-105":
              variant === "gold",
            "border border-salon-300 text-salon-600 hover:bg-salon-50":
              variant === "outline",
            "text-salon-600 hover:bg-salon-50": variant === "ghost",
          },
          {
            "min-h-[44px] h-11 px-4 py-2 text-sm": size === "default",
            "min-h-[44px] h-11 px-3 py-2 text-sm": size === "sm",
            "min-h-[48px] h-12 px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }