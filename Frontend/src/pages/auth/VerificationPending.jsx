import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/common/Button';
import { authApi } from '../../services/authApi';
import { Toast } from '../../components/common/Toast';
import { MailCheck, RefreshCw, ExternalLink, ArrowLeft, Clock } from 'lucide-react';

export const VerificationPending = () => {
  const location = useLocation();
  const email = location.state?.email || 'your registered email';

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email || email === 'your registered email') return;

    setIsResending(true);
    try {
      const response = await authApi.resendVerification(email);
      setToast({
        type: 'success',
        text: response.message || 'New verification link sent to your email.',
      });
      setCooldown(45); // 45 second cooldown
    } catch (err) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to resend verification email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const getEmailProviderUrl = () => {
    if (email && email.includes('@')) {
      const domain = email.split('@')[1].toLowerCase();
      if (domain.includes('gmail')) return 'https://mail.google.com';
      if (domain.includes('outlook') || domain.includes('hotmail')) return 'https://outlook.live.com';
      if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
    }
    return 'https://mail.google.com';
  };

  return (
    <AuthLayout>
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 shadow-sm animate-pulse">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            We've sent a verification link to{' '}
            <span className="font-semibold text-slate-800 break-all">{email}</span>.
          </p>
        </div>

        {/* Expiration Note */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-center gap-2 max-w-xs mx-auto">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Verification link expires in <strong>15 minutes</strong>.</span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 max-w-xs mx-auto">
          <a
            href={getEmailProviderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
          >
            <span>Open Email Inbox</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={handleResend}
            isDisabled={cooldown > 0 || isResending}
            isLoading={isResending}
            className="w-full"
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
