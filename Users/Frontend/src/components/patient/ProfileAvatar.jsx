import React, { useState } from 'react';
import { User, Camera, Sparkles, Check } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
];

export const ProfileAvatar = ({ value, onChange, firstName = '', lastName = '' }) => {
  const [showPresets, setShowPresets] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'P';

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customUrl) {
      onChange(customUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar Display */}
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-teal-600/30 bg-teal-50 text-teal-700 font-bold text-xl sm:text-2xl flex items-center justify-center overflow-hidden shadow-xs">
            {value ? (
              <img
                src={value}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
            title="Choose profile avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info & Preset Toggle */}
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Profile Photo</h4>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Select a photo or medical portal avatar to help your care team identify you.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 py-1 px-2.5 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showPresets ? 'Close Avatar Picker' : 'Choose Avatar'}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-slate-500 hover:text-rose-600 py-1 px-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Use Initials
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Picker Dropdown / Drawer */}
      {showPresets && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="text-xs font-semibold text-slate-700">Preset Avatars</div>
          <div className="flex items-center gap-3">
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(url);
                  setShowPresets(false);
                }}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all relative ${
                  value === url ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                {value === url && (
                  <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Or paste direct Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
