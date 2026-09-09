import React from 'react';
import { ProfileField } from './ProfileField';
import { ShieldAlert } from 'lucide-react';

export const EmergencyContactStep = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Emergency Contact</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Who should we reach out to in case of a medical emergency or urgent care update?
        </p>
      </div>

      <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold block mb-0.5">Emergency Safety Notice</span>
          Your emergency contact will only be contacted during critical medical situations or when authorized by clinic staff.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <ProfileField
          id="emergency_contact_name"
          label="Emergency Contact Name"
          placeholder="Full name of spouse, parent, or trusted contact"
          value={formData.emergency_contact_name || ''}
          error={errors.emergency_contact_name}
          onChange={(e) => onChange('emergency_contact_name', e.target.value)}
        />

        <ProfileField
          id="emergency_contact_phone"
          type="tel"
          label="Emergency Contact Phone"
          placeholder="+91 98765 00000"
          value={formData.emergency_contact_phone || ''}
          error={errors.emergency_contact_phone}
          helperText="Format: +91 98765 43210 or 10-digit number"
          onChange={(e) => onChange('emergency_contact_phone', e.target.value)}
        />
      </div>
    </div>
  );
};
