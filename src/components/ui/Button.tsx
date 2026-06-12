import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-clara-rosa text-white hover:brightness-95 shadow-soft',
          variant === 'secondary' && 'bg-white border-2 border-clara-rosa text-clara-rosa hover:bg-clara-rosa/10',
          variant === 'ghost' && 'bg-transparent text-clara-texto hover:bg-black/5',
          size === 'sm' && 'text-sm px-4 py-2',
          size === 'md' && 'text-base px-6 py-3',
          size === 'lg' && 'text-lg px-8 py-4',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
