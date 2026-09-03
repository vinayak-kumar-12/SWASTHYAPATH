import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { getPasswordStrength } from '../../utils/validation';

export const PasswordInput = forwardRef(({
  label = 'Password',
  id = 'password',
  name = 'password',
  placeholder = '••••••••',
  error,
  showStrengthMeter = false,
  value,
  onChange,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = showStrengthMeter && value ? getPasswordStrength(value) : null;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all duration-150 py-2.5 pl-10 pr-10 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-100'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthMeter && value && strength && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Strength:</span>
            <span className="font-semibold text-slate-700">{strength.label}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`}></div>
            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`}></div>
            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`}></div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
