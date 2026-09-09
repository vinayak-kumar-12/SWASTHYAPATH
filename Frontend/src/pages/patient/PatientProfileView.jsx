import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageContainer } from '../../components/layout/PageContainer';
import { ProfileField } from '../../components/patient/ProfileField';
import { ProfileAvatar } from '../../components/patient/ProfileAvatar';
import {
  User,
  Phone,
  MapPin,
  HeartPulse,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Calendar,
  Globe,
} from 'lucide-react';

export const PatientProfileView = () => {
  const { patientProfile, updatePatientProfile, fetchPatientProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'MALE',
    phone: '',
    email: '',
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
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Populate form with existing patient profile data
  useEffect(() => {
    if (patientProfile) {
      setFormData({
        first_name: patientProfile.firstName || patientProfile.first_name || '',
        last_name: patientProfile.lastName || patientProfile.last_name || '',
        date_of_birth: patientProfile.dateOfBirth
          ? new Date(patientProfile.dateOfBirth).toISOString().split('T')[0]
          : patientProfile.date_of_birth || '',
        gender: patientProfile.gender || 'MALE',
        phone: patientProfile.phone || '',
        email: patientProfile.email || '',
        preferred_language: patientProfile.preferredLanguage || patientProfile.preferred_language || 'English',
        address_line1: patientProfile.addressLine1 || patientProfile.address_line1 || '',
        address_line2: patientProfile.addressLine2 || patientProfile.address_line2 || '',
        city: patientProfile.city || '',
        state: patientProfile.state || '',
        country: patientProfile.country || 'India',
        postal_code: patientProfile.postalCode || patientProfile.postal_code || '',
        emergency_contact_name: patientProfile.emergencyContactName || patientProfile.emergency_contact_name || '',
        emergency_contact_phone: patientProfile.emergencyContactPhone || patientProfile.emergency_contact_phone || '',
        profile_image_url: patientProfile.profileImageUrl || patientProfile.profile_image_url || '',
      });
    } else {
      fetchPatientProfile();
    }
  }, [patientProfile, fetchPatientProfile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.first_name || formData.first_name.trim().length < 2) {
      errs.first_name = 'First name must be at least 2 characters';
    }
    if (formData.phone && !/^[+0-9\s\-()]{10,20}$/.test(formData.phone)) {
      errs.phone = 'Invalid phone number format';
    }
    if (
      formData.emergency_contact_phone &&
      !/^[+0-9\s\-()]{10,20}$/.test(formData.emergency_contact_phone)
    ) {
      errs.emergency_contact_phone = 'Invalid emergency contact phone format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMsg('');

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name ? formData.last_name.trim() : null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender,
      phone: formData.phone ? formData.phone.trim() : null,
      email: formData.email ? formData.email.trim() : null,
      preferred_language: formData.preferred_language,
      address_line1: formData.address_line1 ? formData.address_line1.trim() : null,
      address_line2: formData.address_line2 ? formData.address_line2.trim() : null,
      city: formData.city ? formData.city.trim() : null,
      state: formData.state ? formData.state.trim() : null,
      country: formData.country ? formData.country.trim() : null,
      postal_code: formData.postal_code ? formData.postal_code.trim() : null,
      emergency_contact_name: formData.emergency_contact_name ? formData.emergency_contact_name.trim() : null,
      emergency_contact_phone: formData.emergency_contact_phone ? formData.emergency_contact_phone.trim() : null,
      profile_image_url: formData.profile_image_url || null,
    };

    try {
      const response = await updatePatientProfile(payload);
      if (response?.success) {
        setSuccessMsg('Patient profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setServerError(response?.message || 'Failed to update profile');
      }
    } catch (err) {
      setServerError(err?.message || 'Error updating patient profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/30 bg-teal-500/20 flex items-center justify-center overflow-hidden shrink-0">
              {formData.profile_image_url ? (
                <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {formData.first_name ? formData.first_name.charAt(0).toUpperCase() : 'P'}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-400/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Patient Profile
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {formData.first_name} {formData.last_name}
              </h1>
              <p className="text-teal-100/80 text-xs sm:text-sm mt-0.5">
                {formData.email || 'No email registered'} • {formData.phone || 'No phone registered'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shrink-0 transition-colors cursor-pointer self-start md:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Notifications Banners */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form or View Mode */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-600" />
              <span>Update Profile Details</span>
            </h2>

            <ProfileAvatar
              value={formData.profile_image_url}
              onChange={(url) => handleChange('profile_image_url', url)}
              firstName={formData.first_name}
              lastName={formData.last_name}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField
                id="first_name"
                label="First Name"
                required
                value={formData.first_name}
                error={errors.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
              <ProfileField
                id="last_name"
                label="Last Name"
                value={formData.last_name}
                error={errors.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
              <ProfileField
                id="date_of_birth"
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth}
                error={errors.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
              />
              <ProfileField
                id="gender"
                type="select"
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </ProfileField>
              <ProfileField
                id="phone"
                type="tel"
                label="Phone Number"
                value={formData.phone}
                error={errors.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <ProfileField
                id="email"
                type="email"
                label="Email Address"
                value={formData.email}
                error={errors.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <ProfileField
                id="preferred_language"
                label="Preferred Language"
                value={formData.preferred_language}
                onChange={(e) => handleChange('preferred_language', e.target.value)}
              />
              <ProfileField
                id="emergency_contact_name"
                label="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
              />
              <ProfileField
                id="emergency_contact_phone"
                type="tel"
                label="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                error={errors.emergency_contact_phone}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Address Details</h3>
              <ProfileField
                id="address_line1"
                label="Address Line 1"
                value={formData.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
              />
              <ProfileField
                id="address_line2"
                label="Address Line 2"
                value={formData.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ProfileField
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                <ProfileField
                  id="state"
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
                <ProfileField
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
                <ProfileField
                  id="postal_code"
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" /> Personal Overview
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">First Name</span>
                  <span className="font-semibold text-slate-800">{formData.first_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Last Name</span>
                  <span className="font-semibold text-slate-800">{formData.last_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{formData.date_of_birth || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold text-teal-700 uppercase">{formData.gender || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" /> Contact Details
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-semibold text-slate-800">{formData.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{formData.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Language</span>
                  <span className="font-semibold text-slate-800">{formData.preferred_language || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Address Information
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Street</span>
                  <span className="font-semibold text-slate-800">{formData.address_line1 || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">City / State</span>
                  <span className="font-semibold text-slate-800">
                    {[formData.city, formData.state].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Country & Zip</span>
                  <span className="font-semibold text-slate-800">
                    {[formData.country, formData.postal_code].filter(Boolean).join(' - ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-600" /> Emergency Contact
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-800">{formData.emergency_contact_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-800">{formData.emergency_contact_phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
