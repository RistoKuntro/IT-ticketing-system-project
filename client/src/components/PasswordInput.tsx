// PasswordInput komponent lisab parooli väljadele näita/peida nupu ja Ref-toetuse.
import React, { forwardRef, useState } from 'react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="password-wrapper" style={{ position: 'relative' }}>
        <input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          style={{ paddingRight: '40px', width: '100%' }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Peida parool' : 'Näita parooli'}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
