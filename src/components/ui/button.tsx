import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 gap-2',
          size === 'lg' && 'text-base px-5 py-2.5 gap-2',
          variant === 'primary' &&
            'bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-espresso-900 font-semibold',
          variant === 'secondary' &&
            'bg-espresso-700 hover:bg-espresso-600 active:bg-espresso-800 text-espresso-50 border border-espresso-600',
          variant === 'ghost' &&
            'bg-transparent hover:bg-espresso-700 active:bg-espresso-800 text-espresso-200 hover:text-espresso-50',
          variant === 'danger' &&
            'bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/20',
          variant === 'outline' &&
            'bg-transparent hover:bg-espresso-700 border border-espresso-600 text-espresso-200 hover:text-espresso-50',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
