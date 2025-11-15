'use client'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

export default function Switch({ 
  checked, 
  onChange, 
  disabled = false,
  label,
  description 
}: SwitchProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex-1">
        {label && (
          <span className="text-sm font-medium text-gray-900">
            {label}
          </span>
        )}
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 transform rounded-full bg-white
            transition-transform duration-200 ease-in-out
            shadow-sm
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </label>
  )
}