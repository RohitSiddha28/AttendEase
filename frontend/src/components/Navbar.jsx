import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.85)',
      borderBottom: '1px solid #1e1e1e',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 hover-line">
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 14 }}>✓</span>
          </div>
          <span style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: '#f5f5f5' }}>
            Attend<span className="text-gradient">Ease</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, color: '#f5f5f5', fontWeight: 500, lineHeight: 1.2 }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#555' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
