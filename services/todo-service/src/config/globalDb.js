const mongoose = require('mongoose');

let globalConn = null;
let SharedIndex = null;

const sharedIndexSchema = new mongoose.Schema({
  shareToken: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true },
  todoId: { type: String, required: true }
}, { timestamps: true });

const connect = async () => {
  const baseUri = process.env.MONGODB_BASE_URI || 'mongodb://mongo:27017';
  globalConn = mongoose.createConnection(`${baseUri}/todo_global`, {
    serverSelectionTimeoutMS: 5000,
  });
  await globalConn.asPromise();
  SharedIndex = globalConn.model('SharedIndex', sharedIndexSchema);
  console.log('✅ Global DB connected (todo_global)');
};

const getSharedIndex = () => {
  if (!SharedIndex) throw new Error('Global DB not initialized');
  return SharedIndex;
};

module.exports = { connect, getSharedIndex };
