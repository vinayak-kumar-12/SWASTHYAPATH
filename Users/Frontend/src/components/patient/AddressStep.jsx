import React from 'react';
import { ProfileField } from './ProfileField';

export const AddressStep = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Residential Address</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Provide your primary mailing address for clinic records, prescription delivery, and billing.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <ProfileField
          id="address_line1"
          label="Address Line 1"
          placeholder="House/Flat No., Street, Building Name"
          value={formData.address_line1 || ''}
          error={errors.address_line1}
          onChange={(e) => onChange('address_line1', e.target.value)}
        />

        <ProfileField
          id="address_line2"
          label="Address Line 2 (Optional)"
          placeholder="Apartment, Suite, Landmark"
          value={formData.address_line2 || ''}
          error={errors.address_line2}
          onChange={(e) => onChange('address_line2', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProfileField
            id="city"
            label="City"
            placeholder="e.g. New Delhi"
            value={formData.city || ''}
            error={errors.city}
            onChange={(e) => onChange('city', e.target.value)}
          />

          <ProfileField
            id="state"
            label="State / Province"
            placeholder="e.g. Delhi"
            value={formData.state || ''}
            error={errors.state}
            onChange={(e) => onChange('state', e.target.value)}
          />

          <ProfileField
            id="country"
            label="Country"
            placeholder="e.g. India"
            value={formData.country || ''}
            error={errors.country}
            onChange={(e) => onChange('country', e.target.value)}
          />

          <ProfileField
            id="postal_code"
            label="Postal / Zip Code"
            placeholder="e.g. 110001"
            value={formData.postal_code || ''}
            error={errors.postal_code}
            onChange={(e) => onChange('postal_code', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
