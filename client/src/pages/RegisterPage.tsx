import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nimi peab olema vähemalt 2 tähemärki').max(50, 'Nimi on liiga pikk'),
    email: z.string().min(1, 'E-post on kohustuslik').email('Vigane e-posti formaat'),
    password: z
      .string()
      .min(8, 'Parool peab olema vähemalt 8 tähemärki')
      .regex(/[A-Z]/, 'Parool peab sisaldama vähemalt ühe suurtähe')
      .regex(/[0-9]/, 'Parool peab sisaldama vähemalt ühe numbri'),
    confirmPassword: z.string().min(1, 'Parooli kinnitus on kohustuslik'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Paroolid ei kattu',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch {
      // Viga on juba salvestatud state'i ja kuvatakse kasutajale.
    }
  };

  const handleFieldChange = () => {
    if (error) {
      clearError();
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Loo konto</h1>
        <p className="auth-subtitle">Liitu IT tugisüsteemiga</p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Täisnimi" error={errors.name?.message as string | undefined} required>
            <input
              type="text"
              {...registerField('name')}
              placeholder="Mari Mets"
              className={`input ${errors.name ? 'error-input' : ''}`}
              autoComplete="name"
              autoFocus
              onChange={handleFieldChange}
            />
          </FormField>

          <FormField label="E-post" error={errors.email?.message as string | undefined} required>
            <input
              type="email"
              {...registerField('email')}
              placeholder="sinu@email.com"
              className={`input ${errors.email ? 'error-input' : ''}`}
              autoComplete="email"
              onChange={handleFieldChange}
            />
          </FormField>

          <FormField
            label="Parool"
            error={errors.password?.message as string | undefined}
            required
            hint="Vähemalt 8 tähemärki, üks suurtäht ja üks number"
          >
            <PasswordInput
              {...registerField('password')}
              autoComplete="new-password"
              className={`input ${errors.password ? 'error-input' : ''}`}
              onChange={handleFieldChange}
            />
          </FormField>

          <FormField label="Kinnita parool" error={errors.confirmPassword?.message as string | undefined} required>
            <PasswordInput
              {...registerField('confirmPassword')}
              autoComplete="new-password"
              className={`input ${errors.confirmPassword ? 'error-input' : ''}`}
              onChange={handleFieldChange}
            />
          </FormField>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registreerimine...' : 'Registreeru'}
          </button>
        </form>

        <p className="auth-footer">
          On juba konto? <Link to="/login">Logi sisse</Link>
        </p>
      </div>
    </div>
  );
};
