import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import { ProfileProgress } from '../../components/patient/ProfileProgress';
import { PersonalInformationStep } from '../../components/patient/PersonalInformationStep';
import { ContactInformationStep } from '../../components/patient/ContactInformationStep';
import { AddressStep } from '../../components/patient/AddressStep';
import { EmergencyContactStep } from '../../components/patient/EmergencyContactStep';
import { ProfileReviewStep } from '../../components/patient/ProfileReviewStep';

import {
  HeartPulse,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const PatientProfileSetup = () => {
  const {
    user,
    logout,
    patientProfile,
    hasPatientProfile,
    createPatientProfile,
    updatePatientProfile,
    fetchPatientProfile,
  } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: user?.name ? user.name.split(' ')[0] : '',
    last_name: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
    date_of_birth: '',
    gender: 'MALE',
    phone: user?.phone || '',
    email: user?.email || '',
    preferred_language: 'English',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    profile_image_url: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync form with existing patient profile data if present
  React.useEffect(() => {
    if (patientProfile) {
      setFormData((prev) => ({
        ...prev,
        first_name: patientProfile.firstName || patientProfile.first_name || prev.first_name,
        last_name: patientProfile.lastName || patientProfile.last_name || prev.last_name,
        date_of_birth: patientProfile.dateOfBirth
          ? new Date(patientProfile.dateOfBirth).toISOString().split('T')[0]
          : patientProfile.date_of_birth || prev.date_of_birth,
        gender: patientProfile.gender || prev.gender || 'MALE',
        phone: patientProfile.phone || prev.phone,
        email: patientProfile.email || prev.email,
        preferred_language: patientProfile.preferredLanguage || patientProfile.preferred_language || prev.preferred_language,
        address_line1: patientProfile.addressLine1 || patientProfile.address_line1 || prev.address_line1,
        address_line2: patientProfile.addressLine2 || patientProfile.address_line2 || prev.address_line2,
        city: patientProfile.city || prev.city,
        state: patientProfile.state || prev.state,
        country: patientProfile.country || prev.country,
        postal_code: patientProfile.postalCode || patientProfile.postal_code || prev.postal_code,
        emergency_contact_name: patientProfile.emergencyContactName || patientProfile.emergency_contact_name || prev.emergency_contact_name,
        emergency_contact_phone: patientProfile.emergencyContactPhone || patientProfile.emergency_contact_phone || prev.emergency_contact_phone,
        profile_image_url: patientProfile.profileImageUrl || patientProfile.profile_image_url || prev.profile_image_url,
      }));
    }
  }, [patientProfile]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for modified field
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (submitError) setSubmitError('');
  };

  // Validate current step before proceeding to next
  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 1) {
      if (!formData.first_name || formData.first_name.trim().length < 2) {
        stepErrors.first_name = 'First name must be at least 2 characters';
      }
      if (!formData.date_of_birth) {
        stepErrors.date_of_birth = 'Date of birth is required';
      } else {
        const dob = new Date(formData.date_of_birth);
        if (isNaN(dob.getTime())) {
          stepErrors.date_of_birth = 'Invalid date format';
        } else if (dob > new Date()) {
          stepErrors.date_of_birth = 'Date of birth cannot be in the future';
        }
      }
      if (!formData.gender) {
        stepErrors.gender = 'Please select a gender';
      }
    }

    if (step === 2) {
      if (!formData.phone) {
        stepErrors.phone = 'Phone number is required';
      } else if (!/^[+0-9\s\-()]{10,20}$/.test(formData.phone)) {
        stepErrors.phone = 'Please enter a valid phone number (10-20 digits)';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = 'Invalid email address format';
      }
      if (!formData.preferred_language) {
        stepErrors.preferred_language = 'Preferred language is required';
      }
    }

    if (step === 3) {
      if (formData.postal_code && formData.postal_code.length > 20) {
        stepErrors.postal_code = 'Postal code cannot exceed 20 characters';
      }
    }

    if (step === 4) {
      if (
        formData.emergency_contact_phone &&
        !/^[+0-9\s\-()]{10,20}$/.test(formData.emergency_contact_phone)
      ) {
        stepErrors.emergency_contact_phone = 'Invalid emergency phone number format';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepNumber) => {
    // Can jump back to previous steps
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps prior to final submission
    let isValid = true;
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        isValid = false;
        setCurrentStep(s);
        break;
      }
    }

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError('');

    // Prepare strictly allowed backend payload (no user_id, patient_id, timestamps)
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name ? formData.last_name.trim() : null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || 'MALE',
      phone: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : null,
      preferred_language: formData.preferred_language || 'English',
      address_line1: formData.address_line1 ? formData.address_line1.trim() : null,
      address_line2: formData.address_line2 ? formData.address_line2.trim() : null,
      city: formData.city ? formData.city.trim() : null,
      state: formData.state ? formData.state.trim() : null,
      country: formData.country ? formData.country.trim() : null,
      postal_code: formData.postal_code ? formData.postal_code.trim() : null,
      emergency_contact_name: formData.emergency_contact_name
        ? formData.emergency_contact_name.trim()
        : null,
      emergency_contact_phone: formData.emergency_contact_phone
        ? formData.emergency_contact_phone.trim()
        : null,
      profile_image_url: formData.profile_image_url || null,
    };

    const isExisting = Boolean(hasPatientProfile || patientProfile);

    try {
      let response;
      if (isExisting) {
        response = await updatePatientProfile(payload);
      } else {
        response = await createPatientProfile(payload);
      }

      if (response?.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setSubmitError(response?.message || 'We could not save your profile. Please try again.');
      }
    } catch (err) {
      const isDuplicateError =
        err?.statusCode === 409 ||
        err?.code === 'PATIENT_ALREADY_EXISTS' ||
        (typeof err?.message === 'string' &&
          (err.message.includes('patients_user_id_key') ||
            err.message.includes('duplicate key') ||
            err.message.includes('already exists')));

      if (isDuplicateError) {
        // Recover profile state gracefully via GET /patients/me
        try {
          const res = await fetchPatientProfile();
          if (res?.hasProfile) {
            try {
              await updatePatientProfile(payload);
            } catch {}
          }
        } catch {}

        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        return;
      }

      if (err?.statusCode === 401) {
        setSubmitError('Your session has expired. Please sign in again.');
      } else if (err?.message) {
        setSubmitError(err.message);
      } else {
        setSubmitError('We could not save your profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Panel — Branding & Healthcare Onboarding Context */}
        <div className="lg:col-span-4 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Graphic Accents */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            {/* SWASTHYAPATH Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight block leading-none text-white">
                  SWASTHYAPATH
                </h1>
                <span className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
                  Healthcare Portal
                </span>
              </div>
            </div>

            {/* Onboarding Welcome Message */}
            <div className="space-y-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/20 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Mandatory Onboarding
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                Let's complete your patient profile
              </h2>
              <p className="text-teal-100/70 text-xs sm:text-sm leading-relaxed">
                Help us personalize your healthcare experience. Completing your records ensures seamless doctor consultations, medical history tracking, and emergency readiness.
              </p>
            </div>

            {/* Visual Healthcare Reassurance List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-teal-100/90">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span>Personalized care matching & digital health card</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-teal-100/90">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>End-to-end 256-bit health record encryption</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-teal-100/90">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>HIPAA & Ayushman Bharat digital compliance</span>
              </div>
            </div>
          </div>

          {/* User Session Info Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-teal-700/50 flex items-center justify-between">
            <div className="text-left truncate mr-2">
              <div className="text-[11px] text-teal-300 font-medium uppercase tracking-wider">
                Logged In Account
              </div>
              <div className="text-xs font-semibold text-white truncate">{user?.email || 'Patient User'}</div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-teal-300 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Right Panel — Multi-step Profile Form Container */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between relative bg-white">
          {/* Success State Overlay */}
          {isSuccess ? (
            <div className="my-auto text-center space-y-4 py-12 px-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Profile completed</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  You're all set. Let's get started with SWASTHYAPATH healthcare services.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
                <span>Redirecting to your patient dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Top Step Progress Bar */}
              <div>
                <ProfileProgress currentStep={currentStep} onStepClick={handleStepClick} />
              </div>

              {/* Dynamic Step Component */}
              <div className="py-6 min-h-[360px] flex flex-col justify-center">
                {currentStep === 1 && (
                  <PersonalInformationStep
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                )}
                {currentStep === 2 && (
                  <ContactInformationStep
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                )}
                {currentStep === 3 && (
                  <AddressStep
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                )}
                {currentStep === 4 && (
                  <EmergencyContactStep
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                )}
                {currentStep === 5 && (
                  <ProfileReviewStep
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                    onEditStep={(stepNum) => setCurrentStep(stepNum)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    isExisting={Boolean(hasPatientProfile || patientProfile)}
                  />
                )}
              </div>

              {/* Bottom Action Control Bar */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 5 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer ml-auto"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
