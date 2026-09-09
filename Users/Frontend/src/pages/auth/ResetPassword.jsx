import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Button } from '../../components/common/Button';
import { validatePassword } from '../../utils/validation';
import { CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const pwdErr = validatePassword(formData.newPassword);
    if (pwdErr) newErrors.newPassword = pwdErr;

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setServerError('Reset token is missing or invalid.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await authApi.resetPassword({
        token,
        newPassword: formData.newPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Set new password"
        subtitle="Your new password must be at least 8 characters long."
      />

      {isSuccess ? (
        <div className="text-center space-y-5 animate-fadeIn py-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Password reset successfully!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Your password has been updated. You can now log in with your new credentials.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/login')}
              className="w-full max-w-xs mx-auto"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <PasswordInput
            label="New Password"
            name="newPassword"
            placeholder="At least 8 characters"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            showStrengthMeter
            required
          />

          <PasswordInput
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
