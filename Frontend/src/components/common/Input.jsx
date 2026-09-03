import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all duration-150 py-2.5 px-3.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
