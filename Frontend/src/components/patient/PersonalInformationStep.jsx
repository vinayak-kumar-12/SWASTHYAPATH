import React from 'react';
import { ProfileField } from './ProfileField';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export const PersonalInformationStep = ({ formData, errors, onChange }) => {
  // Max date allowed is today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Personal Information</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Please provide your legal name, birth date, and gender for medical identity verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <ProfileField
          id="first_name"
          label="First Name"
          required
          placeholder="e.g. Rahul"
          value={formData.first_name || ''}
          error={errors.first_name}
          onChange={(e) => onChange('first_name', e.target.value)}
        />

        <ProfileField
          id="last_name"
          label="Last Name"
          placeholder="e.g. Sharma"
          value={formData.last_name || ''}
          error={errors.last_name}
          onChange={(e) => onChange('last_name', e.target.value)}
        />

        <ProfileField
          id="date_of_birth"
          type="date"
          label="Date of Birth"
          required
          max={todayDate}
          value={formData.date_of_birth || ''}
          error={errors.date_of_birth}
          helperText="Format: MM/DD/YYYY"
          onChange={(e) => onChange('date_of_birth', e.target.value)}
        />

        <ProfileField
          id="gender"
          type="select"
          label="Gender"
          required
          value={formData.gender || 'MALE'}
          error={errors.gender}
          onChange={(e) => onChange('gender', e.target.value)}
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ProfileField>
      </div>
    </div>
  );
};
