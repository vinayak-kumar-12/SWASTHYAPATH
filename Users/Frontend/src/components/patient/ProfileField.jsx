import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ProfileField = ({
  id,
  label,
  required = false,
  error,
  type = 'text',
  options,
  children,
  helperText,
  className = '',
  ...props
}) => {
  const isSelect = type === 'select';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs sm:text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {isSelect ? (
          <select
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all ${
              error ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all ${
              error ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
            {...props}
          />
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-[11px] text-slate-500 mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
