require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const globalDb = require('./config/globalDb');
const { closeAll } = require('./config/dbManager');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/todos', require('./routes/todos'));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'todo-service' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const shutdown = async () => {
  console.log('Shutting down todo-service...');
  await closeAll();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

globalDb.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Todo Service running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Global DB connection failed:', err.message);
    process.exit(1);
  });
