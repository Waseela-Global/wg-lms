/**
 * Frappe UI React Components
 * 
 * React implementations matching Frappe UI design system
 * Based on https://ui.frappe.io/ and https://www.npmjs.com/package/frappe-ui
 * 
 * These components follow Frappe's design principles:
 * - Clean, minimal design
 * - Consistent spacing and typography
 * - Accessible by default
 * - Dark mode support
 */

import React from 'react'

// Button Component - matches Frappe UI Button
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  icon,
  iconRight,
  as,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow active:bg-primary-800',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow active:bg-red-800',
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }
  
  const Component = as || 'button'
  const buttonProps = Component === 'button' ? { disabled: disabled || loading } : {}
  
  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...buttonProps}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </Component>
  )
}

// Input Component - matches Frappe UI Input
export function Input({ 
  label, 
  error, 
  hint,
  type = 'text',
  icon,
  iconRight,
  className = '', 
  ...props 
}) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full h-11 ${icon ? 'pl-10' : 'px-4'} ${iconRight ? 'pr-10' : 'px-4'} py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all ${
            error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {iconRight}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

// Textarea Component
export function Textarea({ 
  label, 
  error, 
  hint,
  rows = 4,
  className = '', 
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all resize-none ${
          error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

// Select Component
export function Select({ 
  label, 
  error, 
  hint,
  options = [],
  className = '', 
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full h-11 px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all appearance-none cursor-pointer ${
          error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

// Card Component - matches Frappe UI Card
export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Badge Component - matches Frappe UI Badge
export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// Loading Spinner - matches Frappe UI Spinner
export function Spinner({ size = 'md', className = '', color = 'primary' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }
  
  const colors = {
    primary: 'border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400',
    white: 'border-white/20 border-t-white',
    gray: 'border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400',
  }
  
  return (
    <div className={`inline-block ${sizes[size]} ${className}`}>
      <div className={`${sizes[size]} border-4 rounded-full animate-spin ${colors[color]}`}></div>
    </div>
  )
}

// Empty State Component - matches Frappe UI EmptyState
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

// Alert Component - matches Frappe UI Alert
export function Alert({ 
  children,
  variant = 'info',
  title,
  className = ''
}) {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  }
  
  return (
    <div className={`rounded-lg border p-4 ${variants[variant]} ${className}`}>
      {title && (
        <h4 className="font-semibold mb-2">{title}</h4>
      )}
      <div>{children}</div>
    </div>
  )
}

// Export all components
export default {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  Spinner,
  EmptyState,
  Alert,
}

