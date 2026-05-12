const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  retryStrategy: (times) => Math.min(times * 50, 2000)
});
redis.on('connect', () => console.log('✅ Redis connected (todo-service)'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));
module.exports = redis;
