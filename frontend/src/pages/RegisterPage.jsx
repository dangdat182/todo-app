import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }
    if (form.password.length < 6) {
      return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Đăng ký thành công! Chào mừng bạn 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">✅</div>
          <span>Todo App</span>
        </div>

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Bắt đầu hành trình quản lý công việc của bạn</p>

        <a id="btn-google-register" href="/api/auth/google" className="btn-google">
          <GoogleIcon />
          Đăng ký với Google
        </a>

        <div className="divider">hoặc tạo tài khoản</div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Họ và tên</label>
              <input id="reg-name" className="input" type="text" name="name" placeholder="Nguyễn Văn A"
                value={form.name} onChange={handleChange} required autoComplete="name" />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input id="reg-email" className="input" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>

            <div className="input-group">
              <label className="input-label">Mật khẩu</label>
              <input id="reg-password" className="input" type="password" name="password" placeholder="Tối thiểu 6 ký tự"
                value={form.password} onChange={handleChange} required autoComplete="new-password" />
            </div>

            <div className="input-group">
              <label className="input-label">Xác nhận mật khẩu</label>
              <input id="reg-confirm" className="input" type="password" name="confirm" placeholder="Nhập lại mật khẩu"
                value={form.confirm} onChange={handleChange} required autoComplete="new-password" />
            </div>

            <button id="btn-register-submit" type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>

        <p className="text-center mt-3" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
