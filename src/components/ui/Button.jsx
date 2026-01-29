import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  rightIcon,
  leftIcon,
  children,
  ...props 
}, ref) => {
  const baseClasses = "btn"
  
  const variantClasses = {
    default: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    secondary: "btn-secondary",
    accent: "btn-accent",
    success: "btn-success",
    warning: "btn-warning",
    error: "btn-error",
  }
  
  const sizeClasses = {
    sm: "btn-sm",
    default: "",
    lg: "btn-lg",
    icon: "btn-square",
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
})
Button.displayName = "Button"

export { Button }
export default Button
