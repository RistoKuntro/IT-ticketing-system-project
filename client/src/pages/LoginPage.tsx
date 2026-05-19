import { useForm } from 'react-form'; // stub
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../api/authApi';
import { setCredentials } from '../store/authSlice';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await login({ email: 'test@test.ee', password: 'password' });
    dispatch(setCredentials({ user: data.user, token: data.token }));
    navigate('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Logi sisse</h1>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Logi sisse (Test)</button>
      </form>
    </div>
  );
};
