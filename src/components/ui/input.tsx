import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-espresso-300">
            {label}
            {props.required && <span className="text-gold-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-espresso-800 border rounded-lg px-3 py-2 text-sm text-espresso-50 placeholder-espresso-400',
            'focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors',
            error ? 'border-red-500' : 'border-espresso-600',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-espresso-400">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-espresso-300">
            {label}
            {props.required && <span className="text-gold-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-espresso-800 border rounded-lg px-3 py-2 text-sm text-espresso-50 placeholder-espresso-400 resize-none',
            'focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors',
            error ? 'border-red-500' : 'border-espresso-600',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-espresso-400">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
