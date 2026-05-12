import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ShareModal({ todo, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = todo.shareEnabled && todo.shareToken
    ? `${window.location.origin}/shared/${todo.shareToken}`
    : null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/todos/${todo._id}/share`);
      onUpdate(data.todo);
      if (data.todo.shareEnabled) {
        toast.success('🔗 Đã bật chia sẻ!');
      } else {
        toast.success('🔒 Đã tắt chia sẻ');
      }
    } catch {
      toast.error('Không thể thay đổi trạng thái chia sẻ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('✅ Đã copy link!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể copy');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content fade-in" style={{ maxWidth: '480px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>🔗 Chia sẻ Task</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
          border: '1px solid var(--border)', marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>{todo.title}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {todo.shareEnabled ? '🟢 Đang được chia sẻ công khai' : '🔒 Chưa chia sẻ'}
          </p>
        </div>

        {todo.shareEnabled && shareUrl ? (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Bất kỳ ai có link này đều có thể xem task của bạn:
            </p>
            <div className="share-link-box">
              <input
                id="share-link-input"
                className="share-link-input"
                readOnly
                value={shareUrl}
              />
              <button
                id="btn-copy-share"
                className="btn btn-primary btn-sm"
                onClick={handleCopy}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                👁️ Xem trước
              </a>
            </div>
          </>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
            Bật chia sẻ để tạo link công khai. Bạn bè có thể xem task này mà không cần đăng nhập.
          </p>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Đóng</button>
          <button
            id="btn-toggle-share"
            className={`btn ${todo.shareEnabled ? 'btn-danger' : 'btn-primary'}`}
            style={{ flex: 2 }}
            onClick={handleToggle}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (todo.shareEnabled ? '🔒 Tắt chia sẻ' : '🔗 Bật chia sẻ')}
          </button>
        </div>
      </div>
    </div>
  );
}
