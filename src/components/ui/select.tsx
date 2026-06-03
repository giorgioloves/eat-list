import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-espresso-300">
            {label}
            {props.required && <span className="text-gold-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none bg-espresso-800 border rounded-lg px-3 py-2 pr-8 text-sm text-espresso-50',
              'focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors',
              error ? 'border-red-500' : 'border-espresso-600',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-espresso-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-espresso-800 text-espresso-50">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400 pointer-events-none" />
        </div>
        {hint && !error && <p className="text-xs text-espresso-400">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
