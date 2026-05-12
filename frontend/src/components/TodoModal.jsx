import { useState, useEffect } from 'react';

const PRIORITIES = ['high', 'medium', 'low'];
const PRIORITY_LABELS = { high: '🔴 Cao', medium: '🟡 Trung bình', low: '🟢 Thấp' };

export default function TodoModal({ todo, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    category: 'General', dueDate: '', tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        category: todo.category || 'General',
        dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : '',
        tags: (todo.tags || []).join(', ')
      });
    }
  }, [todo]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category || 'General',
        dueDate: form.dueDate || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content fade-in">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            {todo ? '✏️ Chỉnh sửa Task' : '✨ Tạo Task mới'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Tiêu đề *</label>
              <input
                id="todo-title"
                className="input"
                name="title"
                placeholder="Nhập tiêu đề task..."
                value={form.title}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mô tả</label>
              <textarea
                id="todo-desc"
                className="input"
                name="description"
                placeholder="Mô tả chi tiết (tuỳ chọn)..."
                value={form.description}
                onChange={handleChange}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Ưu tiên</label>
                <select id="todo-priority" className="input filter-select" name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Hạn hoàn thành</label>
                <input
                  id="todo-due"
                  className="input"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <input
                id="todo-category"
                className="input"
                name="category"
                placeholder="Nhập hoặc chọn category..."
                value={form.category}
                onChange={handleChange}
                list="category-list"
              />
              <datalist id="category-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="input-group">
              <label className="input-label">Tags (phân cách bằng dấu phẩy)</label>
              <input
                id="todo-tags"
                className="input"
                name="tags"
                placeholder="work, urgent, meeting..."
                value={form.tags}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                Hủy
              </button>
              <button id="btn-save-todo" type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading || !form.title.trim()}>
                {loading ? 'Đang lưu...' : (todo ? 'Cập nhật' : '+ Tạo Task')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
