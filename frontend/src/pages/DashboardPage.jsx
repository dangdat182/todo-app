import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import TodoModal from '../components/TodoModal';
import ShareModal from '../components/ShareModal';
import { format, isPast, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';

const PRIORITIES = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ priority: '', completed: '', search: '' });
  const [activeCategory, setActiveCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());

  // Modals
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [selectedTodos, setSelectedTodos] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (filters.priority) params.priority = filters.priority;
      if (filters.completed !== '') params.completed = filters.completed;
      if (filters.search) params.search = filters.search;
      if (activeCategory !== 'all') params.category = activeCategory;

      const [todosRes, statsRes, catsRes] = await Promise.all([
        api.get('/todos', { params }),
        api.get('/todos/meta/stats'),
        api.get('/todos/meta/categories'),
      ]);
      setTodos(todosRes.data.todos || []);
      setStats(statsRes.data);
      setCategories(catsRes.data.categories || []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [filters, activeCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarOpen]);

  const handleToggle = async (todo) => {
    try {
      const { data } = await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t._id === todo._id ? data.todo : t));
      if (!todo.completed) toast.success('✅ Hoàn thành!');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const animateRemove = (id, callback) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(async () => {
      await callback();
      setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 280);
  };

  const handleDelete = (id) => {
    if (!confirm('Xóa todo này?')) return;
    animateRemove(id, async () => {
      try {
        await api.delete(`/todos/${id}`);
        setTodos(prev => prev.filter(t => t._id !== id));
        toast.success('Đã xóa');
        fetchData();
      } catch {
        toast.error('Không thể xóa');
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedTodos.length || !confirm(`Xóa ${selectedTodos.length} todos?`)) return;
    try {
      await api.delete('/todos/bulk', { data: { ids: selectedTodos } });
      setTodos(prev => prev.filter(t => !selectedTodos.includes(t._id)));
      setSelectedTodos([]);
      toast.success(`Đã xóa ${selectedTodos.length} todos`);
      fetchData();
    } catch {
      toast.error('Không thể xóa');
    }
  };

  const handleSave = async (todoData) => {
    try {
      if (editTodo) {
        const { data } = await api.put(`/todos/${editTodo._id}`, todoData);
        setTodos(prev => prev.map(t => t._id === editTodo._id ? data.todo : t));
        toast.success('Đã cập nhật');
      } else {
        const { data } = await api.post('/todos', todoData);
        setTodos(prev => [data.todo, ...prev]);
        toast.success('Đã tạo task mới! 🎉');
        fetchData();
      }
      setShowTodoModal(false);
      setEditTodo(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể lưu');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSelect = (id) => {
    setSelectedTodos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const openNew = () => { setEditTodo(null); setShowTodoModal(true); setSidebarOpen(false); };

  const filteredTodos = todos.filter(t =>
    filters.search ? t.title.toLowerCase().includes(filters.search.toLowerCase()) : true
  );

  const priorityColor = (p) => ({ high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' }[p]);
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✅</div>
        <span>Todo App</span>
      </div>

      <p className="nav-section-title">Tổng quan</p>
      <button className={`nav-item ${activeCategory === 'all' && !filters.completed ? 'active' : ''}`}
        onClick={() => { setActiveCategory('all'); setFilters(f => ({ ...f, completed: '' })); setSidebarOpen(false); }}>
        📋 Tất cả <span className="nav-count">{stats.total}</span>
      </button>
      <button className={`nav-item ${filters.completed === 'false' ? 'active' : ''}`}
        onClick={() => { setFilters(f => ({ ...f, completed: f.completed === 'false' ? '' : 'false' })); setSidebarOpen(false); }}>
        ⏳ Đang làm <span className="nav-count">{stats.pending}</span>
      </button>
      <button className={`nav-item ${filters.completed === 'true' ? 'active' : ''}`}
        onClick={() => { setFilters(f => ({ ...f, completed: f.completed === 'true' ? '' : 'true' })); setSidebarOpen(false); }}>
        ✅ Hoàn thành <span className="nav-count">{stats.completed}</span>
      </button>
      {stats.overdue > 0 && (
        <button className="nav-item" style={{ color: 'var(--danger)' }}
          onClick={() => { setFilters(f => ({ ...f, completed: 'false' })); setSidebarOpen(false); }}>
          🚨 Quá hạn <span className="nav-count" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--danger)' }}>{stats.overdue}</span>
        </button>
      )}

      {categories.length > 0 && (
        <>
          <p className="nav-section-title">Categories</p>
          {categories.map(cat => (
            <button key={cat} className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(activeCategory === cat ? 'all' : cat); setSidebarOpen(false); }}>
              🏷️ {cat}
            </button>
          ))}
        </>
      )}

      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="user-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : userInitial}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ marginTop: '4px' }}>
          🚪 Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar (desktop always visible, mobile slide-in) ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {SidebarContent()}
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(s => !s)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sidebar-logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>✅</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Todo App</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Thêm</button>
        </div>

        {/* Desktop header */}
        <div className="page-header desktop-header">
          <div>
            <h1 className="page-title">
              {activeCategory === 'all' ? 'Tất cả Tasks' : `📁 ${activeCategory}`}
            </h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button id="btn-add-todo" className="btn btn-primary" onClick={openNew}>
            + Thêm Task
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📋', label: 'Tổng tasks', value: stats.total, color: 'var(--primary-light)' },
            { icon: '⏳', label: 'Đang làm', value: stats.pending, color: 'var(--warning)' },
            { icon: '✅', label: 'Hoàn thành', value: stats.completed, color: 'var(--success)' },
            { icon: '🚨', label: 'Quá hạn', value: stats.overdue, color: 'var(--danger)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="todo-filters">
          <div className="search-bar" style={{ flex: 1 }}>
            🔍
            <input
              id="todo-search"
              placeholder="Tìm kiếm tasks..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select className="filter-select" id="filter-priority"
            value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">Tất cả priority</option>
            <option value="high">🔴 Cao</option>
            <option value="medium">🟡 Trung bình</option>
            <option value="low">🟢 Thấp</option>
          </select>

          {selectedTodos.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              🗑️ Xóa {selectedTodos.length}
            </button>
          )}
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="flex-center" style={{ padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-state-icon">📭</div>
            <h3>Chưa có task nào</h3>
            <p>Nhấn "Thêm Task" để tạo công việc đầu tiên của bạn</p>
            <button className="btn btn-primary mt-2" onClick={openNew}>+ Tạo task</button>
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => {
              const isOverdue = todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate));
              const isSelected = selectedTodos.includes(todo._id);
              const isRemoving = removingIds.has(todo._id);
              return (
                <div
                  key={todo._id}
                  id={`todo-${todo._id}`}
                  className={`todo-card ${todo.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''} ${isRemoving ? 'removing' : ''}`}
                  style={isSelected ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.08)' } : {}}
                >
                  {/* Checkbox */}
                  <div
                    className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(todo)}
                    role="checkbox"
                    aria-checked={todo.completed}
                  >
                    {todo.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                  </div>

                  {/* Body */}
                  <div className="todo-body" onClick={() => {
                    if (selectedTodos.length > 0) {
                      toggleSelect(todo._id);
                    } else {
                      setEditTodo(todo); setShowTodoModal(true);
                    }
                  }}>
                    <div className="todo-title">{todo.title}</div>
                    {todo.description && <div className="todo-desc">{todo.description}</div>}
                    <div className="todo-meta">
                      <div className="priority-dot" style={{ background: priorityColor(todo.priority), boxShadow: `0 0 8px ${priorityColor(todo.priority)}` }} />
                      <span className="badge" style={{ fontSize: '10px', padding: '2px 8px',
                        background: `${priorityColor(todo.priority)}22`, color: priorityColor(todo.priority),
                        border: `1px solid ${priorityColor(todo.priority)}44` }}>
                        {PRIORITIES[todo.priority]}
                      </span>
                      {todo.category && <span className="category-chip">📁 {todo.category}</span>}
                      {todo.dueDate && (
                        <span className={`todo-date ${isOverdue ? 'overdue' : ''}`}>
                          📅 {format(new Date(todo.dueDate), 'dd/MM/yyyy', { locale: vi })}
                          {isOverdue && ' ⚠️'}
                        </span>
                      )}
                      {todo.tags && todo.tags.length > 0 && todo.tags.map(tag => (
                        <span key={tag} className="tag-chip">#{tag}</span>
                      ))}
                      {todo.shareEnabled && <span className="badge badge-primary">🔗 Shared</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="todo-actions">
                    <button
                      id={`btn-share-${todo._id}`}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Chia sẻ"
                      onClick={(e) => { e.stopPropagation(); setShareModal(todo); }}
                    >🔗</button>
                    <button
                      id={`btn-edit-${todo._id}`}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Chỉnh sửa"
                      onClick={(e) => { e.stopPropagation(); setEditTodo(todo); setShowTodoModal(true); }}
                    >✏️</button>
                    <button
                      id={`btn-delete-${todo._id}`}
                      className="btn btn-danger btn-icon btn-sm"
                      title="Xóa"
                      onClick={(e) => { e.stopPropagation(); handleDelete(todo._id); }}
                    >🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {showTodoModal && (
        <TodoModal
          todo={editTodo}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowTodoModal(false); setEditTodo(null); }}
        />
      )}
      {shareModal && (
        <ShareModal
          todo={shareModal}
          onClose={() => setShareModal(null)}
          onUpdate={(updated) => {
            setTodos(prev => prev.map(t => t._id === updated._id ? updated : t));
            setShareModal(updated);
          }}
        />
      )}
    </div>
  );
}
