
import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  instructions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, required, instructions, children, className = 'mb-6' }) => {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
        {required && <span style={{ color: 'var(--color-status-error-text)' }} className="font-bold">* </span>}
        {label}
      </label>
      {instructions && <div className="mt-1 text-xs prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>{instructions}</div>}
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

export default FormField;