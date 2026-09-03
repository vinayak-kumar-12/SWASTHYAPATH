import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/common/Button';
import { CheckCircle2, XCircle, Clock, ShieldAlert, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('LOADING'); // 'LOADING' | 'SUCCESS' | 'EXPIRED' | 'INVALID' | 'ALREADY_VERIFIED'
  const [errorMessage, setErrorMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    if (!token) {
      setStatus('INVALID');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    const executeVerification = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        if (response?.success) {
          setStatus('SUCCESS');
        } else {
          setStatus('INVALID');
        }
      } catch (err) {
        const code = err.code || '';
        const msg = err.message || '';

        if (code === 'INVALID_TOKEN' || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          if (msg.toLowerCase().includes('expired')) {
            setStatus('EXPIRED');
            setErrorMessage('This verification link has expired (15-minute limit).');
          } else if (msg.toLowerCase().includes('already verified')) {
            setStatus('ALREADY_VERIFIED');
          } else {
            setStatus('INVALID');
            setErrorMessage(msg || 'Invalid verification link.');
          }
        } else {
          setStatus('INVALID');
          setErrorMessage(msg || 'Failed to verify email address.');
        }
      }
    };

    executeVerification();
  }, [token]);

  return (
    <AuthLayout>
      <div className="text-center space-y-6">
        {/* State 1: Loading */}
        {status === 'LOADING' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verifying your email...</h2>
            <p className="text-sm text-slate-500">Please wait while we confirm your account security details.</p>
          </div>
        )}

        {/* State 2: Success */}
        {status === 'SUCCESS' && (
          <div className="py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Email verified successfully!</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Your SWASTHYAPATH account is now fully verified. You can proceed to sign in.
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
        )}

        {/* State 3: Expired */}
        {status === 'EXPIRED' && (
          <div className="py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-sm">
              <Clock className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verification link expired</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'Verification links are valid for 15 minutes. Please request a new link.'}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="lg" icon={RefreshCw} className="w-full max-w-xs mx-auto">
                  Resend Verification Email
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Invalid */}
        {status === 'INVALID' && (
          <div className="py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Invalid verification link</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'This link is invalid or has already been used.'}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full max-w-xs mx-auto">
                  Request New Verification Link
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State 5: Already Verified */}
        {status === 'ALREADY_VERIFIED' && (
          <div className="py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your email is already verified</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                You can sign in directly to access your healthcare portal.
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
        )}
      </div>
    </AuthLayout>
  );
};
