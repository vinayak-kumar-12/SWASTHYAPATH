import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Button } from '../../components/common/Button';
import { Toast } from '../../components/common/Toast';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Mail, ShieldAlert, MailCheck } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError(null);
    if (isEmailUnverified) setIsEmailUnverified(false);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) newErrors.password = passwordErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);
    setIsEmailUnverified(false);

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED' || err.statusCode === 403) {
        setIsEmailUnverified(true);
        setServerError('Please verify your email before logging in.');
      } else {
        setServerError(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;
    setIsResending(true);
    try {
      const res = await authApi.resendVerification(formData.email.trim());
      setToastMessage({
        type: 'success',
        text: res.message || 'Verification link sent to your email address.',
      });
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to resend verification email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your SWASTHYAPATH healthcare portal."
      />

      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>

          {isEmailUnverified && (
            <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
              <span className="text-[11px] text-rose-700">Didn't receive the email?</span>
              <Button
                variant="outline"
                size="sm"
                icon={MailCheck}
                onClick={handleResendVerification}
                isLoading={isResending}
                className="text-xs py-1 px-2.5 border-rose-300 hover:bg-rose-100/50 text-rose-800"
              >
                Resend Email
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        {/* Password */}
        <div>
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700 underline">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};
