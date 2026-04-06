import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [registerStep, setRegisterStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setRegisterStep('form');
    setName('');
    setEmail('');
    setPassword('');
    setOtp('');
    resetMessages();
  };

  const normalizedEmail = email.trim().toLowerCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!normalizedEmail || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: normalizedEmail,
        password: password.trim()
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim() || !normalizedEmail || !password.trim()) {
      setError('Name, email and password are required');
      return;
    }

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: normalizedEmail,
        password: password.trim()
      });
      setSuccess(res.data.message || `OTP sent to ${normalizedEmail}`);
      setRegisterStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    resetMessages();

    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-registration', {
        email: normalizedEmail,
        otp
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="w-full max-w-md animate-slide-up" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-10">
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: '0 8px 32px rgba(245,158,11,0.3)'
          }}>✓</div>
          <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 36, color: '#f5f5f5', lineHeight: 1.1 }}>
            Attend<span className="text-gradient">Ease</span>
          </h1>
          <p style={{ color: '#555', fontSize: 14, marginTop: 8 }}>
            Attendance Management System - Track and manage attendance with ease and efficiency.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                background: mode === 'login' ? '#f59e0b' : '#1a1a1a',
                color: mode === 'login' ? '#000' : '#888'
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                background: mode === 'register' ? '#f59e0b' : '#1a1a1a',
                color: mode === 'register' ? '#000' : '#888'
              }}
            >
              Register
            </button>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: '#f5f5f5' }}>
            {mode === 'login'
              ? 'Welcome back'
              : registerStep === 'otp'
                ? 'Verify your email'
                : 'Create your account'}
          </h2>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>
            {mode === 'login'
              ? 'Use your registered email and password to continue.'
              : registerStep === 'otp'
                ? `Enter the OTP sent to ${normalizedEmail || 'your email address'}.`
                : 'Register with your name, email, and password, then verify using OTP.'}
          </p>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
                <input
                  className="input-dark"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                <input
                  className="input-dark"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button className="btn-amber" type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', fontSize: 15 }}>
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>
          ) : registerStep === 'form' ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
                <input
                  className="input-dark"
                  placeholder="e.g. Prof. Ravi Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
                <input
                  className="input-dark"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                <input
                  className="input-dark"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button className="btn-amber" type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', fontSize: 15 }}>
                {loading ? 'Sending OTP...' : 'Register & Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyRegistration} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#22c55e' }}>
                  {success}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>6-Digit OTP</label>
                <input
                  className="input-dark"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center', fontFamily: 'JetBrains Mono' }}
                  autoFocus
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button className="btn-amber" type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', fontSize: 15, opacity: otp.length !== 6 ? 0.5 : 1 }}>
                {loading ? 'Verifying...' : 'Verify & Complete Registration →'}
              </button>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => { setRegisterStep('form'); setOtp(''); resetMessages(); }}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' }}
              >
                Back to registration details
              </button>
            </form>
          )}
        </div>

        <p style={{ color: '#333', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
          Made with ❤️ by <a href="https://github.com/RohitSiddha28" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', textDecoration: 'underline' }}>Rohit Siddha</a>
        </p>
      </div>
    </div>
  );
}
