import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu không khớp');
    if (form.password.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự');

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Link không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔒</div>
          <span>Todo App</span>
        </div>
        <h1 className="auth-title">Tạo mật khẩu mới</h1>
        <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Mật khẩu mới</label>
              <input id="reset-password" className="input" type="password" placeholder="Tối thiểu 6 ký tự"
                value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Xác nhận mật khẩu</label>
              <input id="reset-confirm" className="input" type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirm} onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button id="btn-reset-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </form>
        <p className="text-center mt-2" style={{ fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--primary-light)' }}>← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
