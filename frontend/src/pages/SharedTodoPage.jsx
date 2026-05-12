import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PRIORITIES = { high: { label: 'Cao', color: 'var(--danger)' }, medium: { label: 'Trung bình', color: 'var(--warning)' }, low: { label: 'Thấp', color: 'var(--success)' } };

export default function SharedTodoPage() {
  const { token } = useParams();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/todos/shared/${token}`)
      .then(({ data }) => setTodo(data.todo))
      .catch(() => setError('Link chia sẻ không hợp lệ hoặc đã bị vô hiệu hóa'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Đang tải...</p>
    </div>
  );

  if (error) return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '64px' }}>❌</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Không tìm thấy</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <a href="/" className="btn btn-primary">Về trang chủ</a>
    </div>
  );

  const p = PRIORITIES[todo.priority];

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '999px', fontSize: '13px', color: 'var(--primary-light)', marginBottom: '16px' }}>
            🔗 Task được chia sẻ
          </div>
        </div>

        <div className="glass-card fade-in" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className={`todo-checkbox ${todo.completed ? 'checked' : ''}`} style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '8px' }}>
              {todo.completed && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
              {todo.title}
            </h1>
          </div>

          {todo.description && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px', fontSize: '15px' }}>
              {todo.description}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            <span className="badge" style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44`, padding: '5px 12px' }}>
              Ưu tiên: {p.label}
            </span>
            {todo.category && <span className="category-chip" style={{ padding: '5px 12px' }}>📁 {todo.category}</span>}
            {todo.dueDate && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: '999px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                📅 {format(new Date(todo.dueDate), 'dd MMMM yyyy', { locale: vi })}
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
              background: todo.completed ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${todo.completed ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: '999px', fontSize: '12px', color: todo.completed ? 'var(--success)' : 'var(--warning)' }}>
              {todo.completed ? '✅ Đã hoàn thành' : '⏳ Đang thực hiện'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px',
            fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Tạo lúc: {format(new Date(todo.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
            <a href="/" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>
              ✅ Tạo tài khoản miễn phí →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
