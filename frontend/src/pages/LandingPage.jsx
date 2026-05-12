import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <section className="landing-hero fade-in">
        <div className="hero-badge">✨ Quản lý công việc thông minh</div>
        <h1 className="hero-title">
          Tổ chức cuộc sống của bạn<br />
          <span className="hero-gradient">một cách hoàn hảo</span>
        </h1>
        <p className="hero-subtitle">
          Todo App giúp bạn quản lý công việc, chia sẻ task với đồng nghiệp và bạn bè, 
          đồng bộ trên mọi thiết bị. Đơn giản, nhanh chóng, hiệu quả.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">
            Bắt đầu miễn phí →
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Đăng nhập
          </Link>
        </div>
      </section>

      <div className="features-grid">
        {[
          { icon: '✅', title: 'Quản lý Tasks', desc: 'Thêm, sửa, xóa và phân loại công việc theo priority, category và due date.' },
          { icon: '🔗', title: 'Chia sẻ Tasks', desc: 'Tạo link chia sẻ công việc với bạn bè và đồng nghiệp chỉ trong vài giây.' },
          { icon: '🔐', title: 'Bảo mật cao', desc: 'Mỗi người dùng có dữ liệu riêng biệt. Hỗ trợ đăng nhập Google và email.' },
          { icon: '⚡', title: 'Nhanh chóng', desc: 'Được xây dựng với Redis cache, đảm bảo tốc độ phản hồi cực nhanh.' },
          { icon: '📱', title: 'Đa thiết bị', desc: 'Responsive design, hoạt động mượt mà trên mobile, tablet và desktop.' },
          { icon: '🔔', title: 'Thông báo', desc: 'Nhận email nhắc nhở khi được chia sẻ task hay reset mật khẩu.' },
        ].map((f, i) => (
          <div key={i} className="feature-card glass-card slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '40px 24px 80px', color: 'var(--text-muted)', fontSize: '13px' }}>
        © 2024 Todo App. Built with ❤️ using React, Node.js, MongoDB & Redis.
      </div>
    </div>
  );
}
