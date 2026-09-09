import React from 'react';
import { ProfileField } from './ProfileField';

const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Marathi',
  'Telugu',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Arabic',
  'Other',
];

export const ContactInformationStep = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Contact Information</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          How can your healthcare providers send appointment reminders and critical health alerts?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <ProfileField
          id="phone"
          type="tel"
          label="Phone Number"
          required
          placeholder="+91 98765 43210"
          value={formData.phone || ''}
          error={errors.phone}
          helperText="Includes country code e.g. +91 or standard phone format"
          onChange={(e) => onChange('phone', e.target.value)}
        />

        <ProfileField
          id="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          value={formData.email || ''}
          error={errors.email}
          helperText="Used for portal notifications and medical summaries"
          onChange={(e) => onChange('email', e.target.value)}
        />

        <ProfileField
          id="preferred_language"
          type="select"
          label="Preferred Language"
          required
          value={formData.preferred_language || 'English'}
          error={errors.preferred_language}
          onChange={(e) => onChange('preferred_language', e.target.value)}
          className="sm:col-span-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </ProfileField>
      </div>
    </div>
  );
};
