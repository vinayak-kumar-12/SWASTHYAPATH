import React from 'react';
import { Check, User, Phone, MapPin, HeartPulse, ShieldCheck } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Contact', icon: Phone },
  { id: 3, name: 'Address', icon: MapPin },
  { id: 4, name: 'Emergency', icon: HeartPulse },
  { id: 5, name: 'Review', icon: ShieldCheck },
];

export const ProfileProgress = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet Step Progress Bar */}
      <div className="relative flex items-center justify-between">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 z-0">
          <div
            className="h-full bg-teal-600 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        {STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
                disabled={!isCompleted}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm cursor-pointer'
                    : isCurrent
                    ? 'bg-white border-2 border-teal-600 text-teal-700 ring-4 ring-teal-50 font-bold shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-400'
                }`}

                title={isCompleted ? `Click to jump back to ${step.name}` : step.name}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
              </button>

              <span
                className={`mt-2 text-[11px] sm:text-xs font-medium tracking-tight text-center hidden xs:block ${
                  isCurrent
                    ? 'text-teal-700 font-bold'
                    : isCompleted
                    ? 'text-slate-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Text Banner */}
      <div className="mt-3 text-center xs:hidden text-xs font-semibold text-teal-800 bg-teal-50 py-1.5 px-3 rounded-lg border border-teal-100/60">
        Step {currentStep} of {STEPS.length}: <span className="text-teal-900 font-bold">{STEPS[currentStep - 1].name}</span>
      </div>
    </div>
  );
};
