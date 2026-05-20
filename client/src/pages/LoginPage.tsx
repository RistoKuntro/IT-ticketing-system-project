import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';

const loginSchema = z.object({
  email: z.string().min(1, 'E-post on kohustuslik').email('Vigane e-posti formaat'),
  password: z.string().min(1, 'Parool on kohustuslik'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
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
        <h1>Tere tulemast</h1>
        <p className="auth-subtitle">Logi sisse oma kontoga</p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="E-post" error={errors.email?.message as string | undefined} required>
            <input
              type="email"
              {...registerField('email')}
              placeholder="sinu@email.com"
              className={`input ${errors.email ? 'error-input' : ''}`}
              autoComplete="email"
              autoFocus
              onChange={handleFieldChange}
            />
          </FormField>

          <FormField label="Parool" error={errors.password?.message as string | undefined} required>
            <PasswordInput
              {...registerField('password')}
              autoComplete="current-password"
              className={`input ${errors.password ? 'error-input' : ''}`}
              onChange={handleFieldChange}
            />
          </FormField>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sisselogimine...' : 'Logi sisse'}
          </button>
        </form>

        <p className="auth-footer">
          Pole kontot? <Link to="/register">Registreeru</Link>
        </p>
      </div>
    </div>
  );
};
