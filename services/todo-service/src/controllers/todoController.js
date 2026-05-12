const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');
const { getTodoModel } = require('../config/dbManager');
const { getSharedIndex } = require('../config/globalDb');

const invalidateCache = async (userId) => {
  const keys = await redis.keys(`todos:${userId}*`);
  if (keys.length > 0) await redis.del(...keys);
};

// ── Get all todos ────────────────────────────────────────────────
exports.getTodos = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { category, priority, completed, search, page = 1, limit = 50 } = req.query;

  try {
    const Todo = await getTodoModel(userId);
    const filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.completed = completed === 'true';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [todos, total] = await Promise.all([
      Todo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Todo.countDocuments(filter)
    ]);

    res.json({
      todos,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách todos' });
  }
};

// ── Create todo ──────────────────────────────────────────────────
exports.createTodo = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { title, description, priority, category, dueDate, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tiêu đề là bắt buộc' });
  }

  try {
    const Todo = await getTodoModel(userId);
    const todo = await Todo.create({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      tags: tags || []
    });

    await invalidateCache(userId);
    res.status(201).json({ todo });
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ error: 'Không thể tạo todo' });
  }
};

// ── Update todo ──────────────────────────────────────────────────
exports.updateTodo = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;
  const updates = req.body;

  try {
    const Todo = await getTodoModel(userId);
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ error: 'Todo không tồn tại' });

    const allowedFields = ['title', 'description', 'completed', 'priority', 'category', 'dueDate', 'tags'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) todo[field] = updates[field];
    });

    await todo.save();
    await invalidateCache(userId);

    res.json({ todo });
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Không thể cập nhật todo' });
  }
};

// ── Delete todo ──────────────────────────────────────────────────
exports.deleteTodo = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;

  try {
    const Todo = await getTodoModel(userId);
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) return res.status(404).json({ error: 'Todo không tồn tại' });

    // Remove from global shared index if it was shared
    if (todo.shareToken) {
      const SharedIndex = getSharedIndex();
      await SharedIndex.deleteOne({ shareToken: todo.shareToken }).catch(() => {});
    }

    await invalidateCache(userId);
    res.json({ message: 'Đã xóa todo thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa todo' });
  }
};

// ── Bulk delete ──────────────────────────────────────────────────
exports.bulkDelete = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids phải là một mảng' });
  }

  try {
    const Todo = await getTodoModel(userId);

    // Remove shared tokens from global index for todos being deleted
    const todosToDelete = await Todo.find({ _id: { $in: ids }, shareEnabled: true }).select('shareToken');
    if (todosToDelete.length > 0) {
      const SharedIndex = getSharedIndex();
      const tokens = todosToDelete.map(t => t.shareToken).filter(Boolean);
      if (tokens.length > 0) {
        await SharedIndex.deleteMany({ shareToken: { $in: tokens } }).catch(() => {});
      }
    }

    const result = await Todo.deleteMany({ _id: { $in: ids } });
    await invalidateCache(userId);
    res.json({ message: `Đã xóa ${result.deletedCount} todos` });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa todos' });
  }
};

// ── Toggle share ─────────────────────────────────────────────────
exports.toggleShare = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;
  const { emails } = req.body;

  try {
    const Todo = await getTodoModel(userId);
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ error: 'Todo không tồn tại' });

    const SharedIndex = getSharedIndex();

    if (!todo.shareEnabled) {
      // Enable sharing
      const newToken = uuidv4();
      todo.shareToken = newToken;
      todo.shareEnabled = true;
      todo.sharedWithEmails = emails || [];
      await todo.save();

      // Register in global index
      await SharedIndex.create({ shareToken: newToken, userId, todoId: todo._id.toString() });
    } else {
      // Disable sharing — remove from global index first
      if (todo.shareToken) {
        await SharedIndex.deleteOne({ shareToken: todo.shareToken }).catch(() => {});
      }
      todo.shareToken = undefined;
      todo.shareEnabled = false;
      todo.sharedWithEmails = [];
      await todo.save();
    }

    const shareUrl = todo.shareEnabled
      ? `${process.env.FRONTEND_URL}/shared/${todo.shareToken}`
      : null;

    res.json({ todo, shareUrl });
  } catch (err) {
    console.error('Toggle share error:', err);
    res.status(500).json({ error: 'Không thể thay đổi trạng thái chia sẻ' });
  }
};

// ── Get shared todo (public) ─────────────────────────────────────
exports.getSharedTodo = async (req, res) => {
  const { token } = req.params;

  try {
    const SharedIndex = getSharedIndex();
    const indexEntry = await SharedIndex.findOne({ shareToken: token });
    if (!indexEntry) {
      return res.status(404).json({ error: 'Link chia sẻ không hợp lệ hoặc đã bị vô hiệu hóa' });
    }

    const Todo = await getTodoModel(indexEntry.userId);
    const todo = await Todo.findOne({ _id: indexEntry.todoId, shareEnabled: true });
    if (!todo) {
      // Clean up stale index entry
      await SharedIndex.deleteOne({ shareToken: token }).catch(() => {});
      return res.status(404).json({ error: 'Link chia sẻ không hợp lệ hoặc đã bị vô hiệu hóa' });
    }

    res.json({ todo });
  } catch (err) {
    console.error('Get shared todo error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ── Get categories ───────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  const userId = req.headers['x-user-id'];

  try {
    const Todo = await getTodoModel(userId);
    const categories = await Todo.distinct('category');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy categories' });
  }
};

// ── Get stats ────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const userId = req.headers['x-user-id'];

  try {
    const Todo = await getTodoModel(userId);

    const [total, completed, overdue, byPriority] = await Promise.all([
      Todo.countDocuments({}),
      Todo.countDocuments({ completed: true }),
      Todo.countDocuments({ completed: false, dueDate: { $lt: new Date() } }),
      Todo.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      total,
      completed,
      pending: total - completed,
      overdue,
      byPriority: byPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy thống kê' });
  }
};
