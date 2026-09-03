import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Button } from '../../components/common/Button';
import { validateEmail, validatePassword, validateName, validatePhone } from '../../utils/validation';
import { User, Mail, Phone, UserCheck, ShieldAlert } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) newErrors.password = passwordErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (response?.success) {
        // Navigate to verification pending page without logging in
        navigate('/verification-pending', { state: { email: formData.email.trim() } });
      }
    } catch (err) {
      setServerError(err.message || 'Failed to create account. Please try again.');
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors = {};
        err.details.forEach((item) => {
          if (item.field) fieldErrors[item.field] = item.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Create your account"
        subtitle="Start your secure healthcare journey with SWASTHYAPATH."
      />

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="e.g. Dr. Alex Morgan / Sarah Jenkins"
          icon={User}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        {/* Email Address */}
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        {/* Phone Number */}
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          icon={Phone}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        {/* Account Role Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Account Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'PATIENT' }))}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                formData.role === 'PATIENT'
                  ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'DOCTOR' }))}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                formData.role === 'DOCTOR'
                  ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Healthcare Provider</span>
            </button>
          </div>
        </div>

        {/* Password */}
        <PasswordInput
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          showStrengthMeter
          required
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
