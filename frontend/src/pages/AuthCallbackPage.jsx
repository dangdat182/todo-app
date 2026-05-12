import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    const error = params.get('error');

    if (error) {
      toast.error('Đăng nhập Google thất bại');
      navigate('/login');
      return;
    }

    if (token && refresh) {
      loginWithToken(token, refresh);
      toast.success('Đăng nhập Google thành công! 🎉');
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Đang xử lý đăng nhập...</p>
    </div>
  );
}
