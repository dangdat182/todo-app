require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

// Redis subscriber for event-driven notifications
const subscriber = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
subscriber.subscribe('notifications', (err) => {
  if (err) console.error('Redis subscribe error:', err);
  else console.log('✅ Subscribed to Redis notifications channel');
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

subscriber.on('message', async (channel, message) => {
  try {
    const payload = JSON.parse(message);
    if (payload.type === 'SEND_EMAIL') {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html
      });
      console.log(`✉️ Email sent to ${payload.to}`);
    }
  } catch (err) {
    console.error('Notification error:', err.message);
  }
});

// REST endpoint for direct notifications
app.post('/notify/email', async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    res.json({ message: 'Email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
