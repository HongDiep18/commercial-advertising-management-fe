import { forwardRef } from 'react'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}


const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={`h-4 w-4 rounded border-border text-[--color-header-red-dark] focus:ring-2 focus:ring-[--color-header-red-dark] focus:ring-offset-2 cursor-pointer accent-[--color-header-red-dark] ${className || ''}`}
        style={{ accentColor: 'var(--color-header-red-dark)' }}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

export default Checkbox
