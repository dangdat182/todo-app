const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
};

exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🎉 Chào mừng bạn đến với Todo App!',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">✅ Todo App</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #a5b4fc;">Xin chào, ${user.name}! 👋</h2>
          <p>Chào mừng bạn đã đăng ký tài khoản Todo App. Hãy bắt đầu quản lý công việc của bạn ngay hôm nay!</p>
          <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
            Bắt đầu ngay →
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2024 Todo App. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: '🔑 Đặt lại mật khẩu - Todo App',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">✅ Todo App</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #a5b4fc;">Đặt lại mật khẩu</h2>
          <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${user.email}</strong>.</p>
          <p>Nhấn vào nút bên dưới để tạo mật khẩu mới. Link có hiệu lực trong <strong>1 giờ</strong>.</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
            Đặt lại mật khẩu →
          </a>
          <p style="margin-top: 30px; color: #94a3b8; font-size: 14px;">
            Nếu bạn không yêu cầu điều này, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
          </p>
          <p style="color: #64748b; font-size: 12px; word-break: break-all;">Hoặc copy link: ${resetUrl}</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2024 Todo App. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

exports.sendShareNotificationEmail = async ({ toEmail, fromUser, todoTitle, shareUrl }) => {
  await sendEmail({
    to: toEmail,
    subject: `📋 ${fromUser} đã chia sẻ task với bạn`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">✅ Todo App</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #a5b4fc;">Bạn có task được chia sẻ! 🎉</h2>
          <p><strong>${fromUser}</strong> đã chia sẻ task <strong>"${todoTitle}"</strong> với bạn.</p>
          <a href="${shareUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #6366f1); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
            Xem task →
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2024 Todo App. All rights reserved.</p>
        </div>
      </div>
    `
  });
};
