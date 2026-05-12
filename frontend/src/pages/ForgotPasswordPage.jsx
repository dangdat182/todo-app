import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Email đã được gửi!');
    } catch {
      toast.error('Không thể gửi email, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔑</div>
          <span>Todo App</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
            <h1 className="auth-title">Kiểm tra email!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">← Quay lại đăng nhập</Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Quên mật khẩu?</h1>
            <p className="auth-subtitle">Nhập email để nhận link đặt lại mật khẩu</p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    id="forgot-email"
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button id="btn-forgot-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
                </button>
              </div>
            </form>

            <p className="text-center mt-3" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>← Quay lại đăng nhập</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
