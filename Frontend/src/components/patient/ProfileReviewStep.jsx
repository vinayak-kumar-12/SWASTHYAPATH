import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { Edit3, CheckCircle2, User, Phone, MapPin, HeartPulse, ShieldCheck, Loader2 } from 'lucide-react';

export const ProfileReviewStep = ({
  formData,
  errors,
  onChange,
  onEditStep,
  onSubmit,
  isSubmitting,
  submitError,
  isExisting = false,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {isExisting ? 'Review & Update Profile' : 'Review & Complete Profile'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Please review your information below before saving your SWASTHYAPATH patient profile.
        </p>
      </div>

      {/* Avatar Selection Section */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <ProfileAvatar
          value={formData.profile_image_url || ''}
          onChange={(url) => onChange('profile_image_url', url)}
          firstName={formData.first_name || ''}
          lastName={formData.last_name || ''}
        />
      </div>

      {/* Server Error Alert Banner */}
      {submitError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Personal Information</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-800 space-y-1 pt-1">
            <div>
              <span className="text-slate-400">Name: </span>
              <span className="font-semibold">{formData.first_name} {formData.last_name}</span>
            </div>
            <div>
              <span className="text-slate-400">Date of Birth: </span>
              <span className="font-medium">{formData.date_of_birth || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400">Gender: </span>
              <span className="font-medium uppercase text-teal-700">{formData.gender || 'MALE'}</span>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Contact Information</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-800 space-y-1 pt-1">
            <div>
              <span className="text-slate-400">Phone: </span>
              <span className="font-semibold">{formData.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400">Email: </span>
              <span className="font-medium truncate block max-w-full">{formData.email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400">Language: </span>
              <span className="font-medium">{formData.preferred_language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Address</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-800 space-y-1 pt-1">
            <div>
              <span className="text-slate-400">Street: </span>
              <span className="font-medium">
                {formData.address_line1
                  ? `${formData.address_line1}${formData.address_line2 ? `, ${formData.address_line2}` : ''}`
                  : 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Location: </span>
              <span className="font-medium">
                {[formData.city, formData.state, formData.country, formData.postal_code].filter(Boolean).join(', ') || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>Emergency Contact</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-800 space-y-1 pt-1">
            <div>
              <span className="text-slate-400">Contact Person: </span>
              <span className="font-semibold">{formData.emergency_contact_name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400">Phone Number: </span>
              <span className="font-medium">{formData.emergency_contact_phone || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security and Privacy Reassurance Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
        <p>
          By saving your profile, you confirm that your health details are accurate and protected under SWASTHYAPATH medical data encryption standards.
        </p>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Patient Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{isExisting ? 'Save Profile & Access Dashboard' : 'Complete Profile & Access Dashboard'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
