const mongoose = require('mongoose');

const todoSchemaDefinition = new mongoose.Schema({
  title: { type: String, required: [true, 'Tiêu đề là bắt buộc'], trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, trim: true, default: 'General' },
  dueDate: { type: Date, default: null },
  tags: [{ type: String, trim: true }],
  shareToken: { type: String, unique: true, sparse: true },
  shareEnabled: { type: Boolean, default: false },
  sharedWithEmails: [{ type: String, lowercase: true }]
}, { timestamps: true });

todoSchemaDefinition.index({ createdAt: -1 });
todoSchemaDefinition.index({ completed: 1 });
todoSchemaDefinition.index({ category: 1 });

// Cache: userId -> { conn, Todo }
const connectionCache = new Map();
const MAX_CACHED_CONNECTIONS = 200;

const getMongoBaseUri = () =>
  process.env.MONGODB_BASE_URI || 'mongodb://mongo:27017';

// LRU-style: evict oldest entry when cache is full
const evictOldest = async () => {
  const firstKey = connectionCache.keys().next().value;
  if (firstKey) {
    const { conn } = connectionCache.get(firstKey);
    await conn.close().catch(() => {});
    connectionCache.delete(firstKey);
  }
};

const getTodoModel = async (userId) => {
  if (connectionCache.has(userId)) {
    const entry = connectionCache.get(userId);
    // Re-insert to keep it "recently used"
    connectionCache.delete(userId);
    connectionCache.set(userId, entry);
    return entry.Todo;
  }

  if (connectionCache.size >= MAX_CACHED_CONNECTIONS) {
    await evictOldest();
  }

  const dbName = `todo_user_${userId}`;
  const uri = `${getMongoBaseUri()}/${dbName}`;

  const conn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await conn.asPromise();

  const Todo = conn.model('Todo', todoSchemaDefinition.clone());
  connectionCache.set(userId, { conn, Todo });

  return Todo;
};

const closeAll = async () => {
  const closes = [...connectionCache.values()].map(({ conn }) => conn.close().catch(() => {}));
  await Promise.all(closes);
  connectionCache.clear();
};

module.exports = { getTodoModel, closeAll };
