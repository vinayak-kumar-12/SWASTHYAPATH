import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useHealthConcerns } from '../../hooks/useHealthConcerns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { HealthConcernSuccess } from './HealthConcernSuccess';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Edit2,
  FileCheck,
  Stethoscope,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Pain',
  'Fever',
  'Respiratory',
  'Digestive',
  'Skin',
  'Mental wellbeing',
  'Other',
];

const ONSET_OPTIONS = [
  'Today',
  'Yesterday',
  'Few days ago',
  'More than a week ago',
  'More than a month ago',
  "I'm not sure",
];

const FREQUENCY_OPTIONS = [
  'Constant',
  'Comes and goes',
  'Occasional',
  'Not sure',
];

const COMMON_SYMPTOMS = [
  'Fever',
  'Fatigue',
  'Nausea',
  'Vomiting',
  'Dizziness',
  'Cough',
  'Shortness of breath',
  'Headache',
  'None',
];

export const HealthConcernForm = () => {
  const { user, patientProfile } = useAuth();
  const { submitConcern, isSubmitting } = useHealthConcerns();
  const navigate = useNavigate();

  // Multi-step state: 1 = Problem, 2 = Details, 3 = Health Context, 4 = Review
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedConcern, setSubmittedConcern] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    concern: '',
    category: 'General',
    description: '',
    onset: '',
    severity: 5,
    frequency: 'Constant',
    location: '',
    triggers: '',
    relievingFactors: '',
    associatedSymptoms: [],
    customSymptom: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    previousTreatment: '',
    additionalInformation: '',
    confirmedAccurate: false,
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleSymptom = (symptom) => {
    setFormData((prev) => {
      let updated = [...prev.associatedSymptoms];
      if (symptom === 'None') {
        updated = ['None'];
      } else {
        updated = updated.filter((s) => s !== 'None');
        if (updated.includes(symptom)) {
          updated = updated.filter((s) => s !== symptom);
        } else {
          updated.push(symptom);
        }
      }
      return { ...prev, associatedSymptoms: updated };
    });
  };

  const handleAddCustomSymptom = () => {
    if (formData.customSymptom.trim()) {
      const val = formData.customSymptom.trim();
      setFormData((prev) => ({
        ...prev,
        associatedSymptoms: [...prev.associatedSymptoms.filter((s) => s !== 'None'), val],
        customSymptom: '',
      }));
    }
  };

  // Step Validation
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.concern.trim()) {
        errs.concern = 'Please provide a short title for your concern.';
      }
      if (!formData.description.trim()) {
        errs.description = 'Please describe what you are experiencing in your own words.';
      } else if (formData.description.trim().length < 10) {
        errs.description = 'Please provide a little more detail (at least 10 characters).';
      }
    } else if (step === 2) {
      if (!formData.onset) {
        errs.onset = 'Please select when your symptoms started.';
      }
      if (!formData.severity) {
        errs.severity = 'Please select a severity score between 1 and 10.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.confirmedAccurate) {
      setErrors({ confirmation: 'You must confirm that the information is accurate before submitting.' });
      return;
    }

    try {
      const created = await submitConcern({
        ...formData,
        patientId: patientProfile?.id || user?.id || 'patient-demo-01',
      });
      setSubmittedConcern(created);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  // If successfully submitted, render Success view
  if (submittedConcern) {
    return <HealthConcernSuccess concern={submittedConcern} />;
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            Health Intake Form
          </span>
        </div>

        {/* Progress Bar / Steps Indicator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Progress</span>
            <span className="text-teal-700">Step 0{currentStep} of 04</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Problem' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Context' },
              { num: 4, label: 'Review' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.num);
                  }}
                  disabled={!isCompleted && currentStep !== step.num}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    isActive
                      ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-2xs font-semibold'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800 cursor-pointer'
                      : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>0{step.num}</span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-xs font-bold mt-1 truncate">{step.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: YOUR CONCERN */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                Step 01 — Your Concern
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                What are you experiencing?
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Describe your health concern in your own words. You don't need to use medical terms.
              </p>
            </div>

            <div className="space-y-4">
              {/* Concern Title */}
              <Input
                label="Main Health Concern (Short Title)"
                placeholder="Example: Chest discomfort, Severe headache, Sore throat..."
                value={formData.concern}
                onChange={(e) => updateField('concern', e.target.value)}
                error={errors.concern}
                required
              />

              {/* Category Options */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Category (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateField('category', cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        formData.category === cat
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Describe what you are experiencing <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Example: I've been having a headache since yesterday. It gets worse in bright lighting and makes it hard to focus on work..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={`block w-full rounded-xl border text-sm transition-all p-3.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-100'
                  }`}
                ></textarea>
                {errors.description && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Non-Diagnostic Disclaimer Note */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs text-teal-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block text-teal-950">Patient Safety Information</span>
                  Selecting a category and describing your concern organizes your health record for upcoming clinical review. SWASTHYAPATH does not perform automatic medical diagnoses.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="md" onClick={handleNext}>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                Step 02 — Concern Details
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                Help us understand the timeline & severity
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Provide details about onset, intensity, and associated physical symptoms.
              </p>
            </div>

            <div className="space-y-6">
              {/* Onset / Timing */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  When did it start? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ONSET_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('onset', opt)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        formData.onset === opt
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.onset && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.onset}</span>
                  </p>
                )}
              </div>

              {/* Severity Scale 1-10 */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Severity Rating (1 to 10 Scale) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-sm font-bold text-teal-700 bg-teal-100/80 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    {formData.severity} / 10 — {formData.severity <= 3 ? 'Mild' : formData.severity <= 7 ? 'Moderate' : 'Severe'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                  <span>1 = Very mild</span>
                  <span>5 = Moderate</span>
                  <span>10 = Severe</span>
                </div>

                <div className="grid grid-cols-10 gap-1 sm:gap-2 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateField('severity', num)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                        formData.severity === num
                          ? num >= 8
                            ? 'bg-rose-600 text-white shadow-md scale-105'
                            : num >= 5
                            ? 'bg-amber-500 text-white shadow-md scale-105'
                            : 'bg-teal-600 text-white shadow-md scale-105'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => updateField('frequency', freq)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        formData.frequency === freq
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location, Triggers, Relieving Factors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g., Upper chest, Forehead, Left knee..."
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                />
                <Input
                  label="Triggers (What makes it worse?)"
                  placeholder="e.g., Physical exertion, Bright lighting..."
                  value={formData.triggers}
                  onChange={(e) => updateField('triggers', e.target.value)}
                />
              </div>

              <Input
                label="Relieving Factors (What makes it better?)"
                placeholder="e.g., Resting, Hydration, Pain relievers..."
                value={formData.relievingFactors}
                onChange={(e) => updateField('relievingFactors', e.target.value)}
              />

              {/* Associated Symptoms Multi-select */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Associated Symptoms (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((sym) => {
                    const isSelected = formData.associatedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? `✓ ${sym}` : `+ ${sym}`}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Symptom Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add another symptom..."
                    value={formData.customSymptom}
                    onChange={(e) => updateField('customSymptom', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSymptom();
                      }
                    }}
                    className="text-xs p-2 rounded-xl border border-slate-300 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSymptom}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              <Button variant="primary" onClick={handleNext}>
                <span>Continue to Health Context</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: HEALTH CONTEXT */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                Step 03 — Health Context
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                Medical background & medications
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Providing health context helps organize your clinical record for healthcare professionals.
              </p>
            </div>

            <div className="space-y-4">
              {/* Medical Conditions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Existing Medical Conditions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Diabetes, Hypertension, Asthma, None..."
                  value={formData.medicalConditions}
                  onChange={(e) => updateField('medicalConditions', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                ></textarea>
              </div>

              {/* Current Medications */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Current Medications
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Amlodipine 5mg daily, Metformin, Vitamins, None..."
                  value={formData.medications}
                  onChange={(e) => updateField('medications', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                ></textarea>
              </div>

              {/* Allergies */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Allergies (Medication or Food)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Penicillin, Sulfa drugs, Peanuts, None..."
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                ></textarea>
              </div>

              {/* Previous Treatment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Previous Treatment / Actions Taken
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Rested for 2 hours, took Over-The-Counter medication..."
                  value={formData.previousTreatment}
                  onChange={(e) => updateField('previousTreatment', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                ></textarea>
              </div>

              {/* Additional Info */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Additional Information
                </label>
                <textarea
                  rows={2}
                  placeholder="Anything else you think the doctor should know..."
                  value={formData.additionalInformation}
                  onChange={(e) => updateField('additionalInformation', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                ></textarea>
              </div>

              {/* Future AI Assistant Notice Placeholder */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI-assisted health intake & smart symptom breakdown will be available here.</span>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Upcoming Module
                </span>
              </div>
            </div>

            {/* Step 3 Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              <Button variant="primary" onClick={handleNext}>
                <span>Review Concern</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                Step 04 — Review & Confirm
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                Review your health concern
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Please verify all details before submitting for clinical review.
              </p>
            </div>

            <div className="space-y-4">
              {/* Section 1: Your Concern */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-teal-600" />
                    <span>Your Concern</span>
                  </h3>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="text-sm font-semibold text-slate-800">{formData.concern}</div>
                <div className="text-xs text-slate-600">Category: <span className="font-semibold text-teal-700">{formData.category}</span></div>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 mt-1">
                  {formData.description}
                </p>
              </div>

              {/* Section 2: Details & Symptoms */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Details & Symptoms</span>
                  </h3>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Started</span>
                    <span className="font-bold text-slate-800">{formData.onset || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Severity Rating</span>
                    <span className="font-bold text-teal-700">{formData.severity}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Frequency</span>
                    <span className="font-bold text-slate-800">{formData.frequency}</span>
                  </div>
                  {formData.location && (
                    <div>
                      <span className="text-slate-400 font-medium block">Location</span>
                      <span className="font-bold text-slate-800">{formData.location}</span>
                    </div>
                  )}
                  {formData.triggers && (
                    <div>
                      <span className="text-slate-400 font-medium block">Triggers</span>
                      <span className="font-bold text-slate-800">{formData.triggers}</span>
                    </div>
                  )}
                  {formData.relievingFactors && (
                    <div>
                      <span className="text-slate-400 font-medium block">Relieving Factors</span>
                      <span className="font-bold text-slate-800">{formData.relievingFactors}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Associated Symptoms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.associatedSymptoms.length > 0 ? (
                      formData.associatedSymptoms.map((sym) => (
                        <span key={sym} className="text-xs font-medium px-2.5 py-0.5 bg-white text-slate-700 rounded-lg border border-slate-200">
                          {sym}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Health Context */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-teal-600" />
                    <span>Health Context</span>
                  </h3>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Existing Conditions</span>
                    <span className="font-semibold text-slate-800">{formData.medicalConditions || 'None reported'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Current Medications</span>
                    <span className="font-semibold text-slate-800">{formData.medications || 'None reported'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Allergies</span>
                    <span className="font-semibold text-slate-800">{formData.allergies || 'None reported'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Previous Treatment</span>
                    <span className="font-semibold text-slate-800">{formData.previousTreatment || 'None reported'}</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.confirmedAccurate}
                    onChange={(e) => {
                      updateField('confirmedAccurate', e.target.checked);
                      if (errors.confirmation) {
                        setErrors((prev) => ({ ...prev, confirmation: null }));
                      }
                    }}
                    className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-800 font-medium leading-relaxed">
                    I have reviewed the information above and confirm that it is accurate to the best of my knowledge for my healthcare record.
                  </span>
                </label>
                {errors.confirmation && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1.5 ml-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.confirmation}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 4 Submit Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-3">
              <Button variant="outline" onClick={handleBack} isDisabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!formData.confirmedAccurate}
              >
                Submit Health Concern
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
