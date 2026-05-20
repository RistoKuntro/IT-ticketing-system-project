// FormField komponent pakub vormiväljadele ühtse struktuuri, kirjelduse ja vea kuvamise.
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}

export const FormField = ({
  label,
  error,
  children,
  required,
  hint,
}: FormFieldProps) => {
  return (
    <div className="form-field">
      <label>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {hint && <span className="form-hint">{hint}</span>}
      {children}
      {error && (
        <span className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
