import React, { useState } from 'react';
import { loginUser, signupUser } from '../services/api';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        await signupUser(email, password);
        setSuccessMsg('Account created successfully! Please sign in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-dim)', background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)' }}>
        
        {/* Toggle tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-dim)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: isLogin ? 'var(--accent-color, #a855f7)' : 'var(--text-muted, #9ca3af)', 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              paddingBottom: '0.5rem',
              borderBottom: isLogin ? '2px solid var(--accent-color, #a855f7)' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: !isLogin ? 'var(--accent-color, #a855f7)' : 'var(--text-muted, #9ca3af)', 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              paddingBottom: '0.5rem',
              borderBottom: !isLogin ? '2px solid var(--accent-color, #a855f7)' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Register
          </button>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {isLogin ? 'Sign in to access the AI Feasibility Diagnostics panel.' : 'Register corporate credentials to run concept audits.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#a7f3d0', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #9ca3af)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Corporate Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid var(--border-dim, #374151)', borderRadius: '8px', color: '#ffffff', outline: 'none', transition: 'border-color 0.2s ease' }}
            />
          </div>

          <div style={{ marginBottom: isLogin ? '2rem' : '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #9ca3af)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid var(--border-dim, #374151)', borderRadius: '8px', color: '#ffffff', outline: 'none', transition: 'border-color 0.2s ease' }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #9ca3af)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm Password
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(31, 41, 55, 0.5)', border: '1px solid var(--border-dim, #374151)', borderRadius: '8px', color: '#ffffff', outline: 'none', transition: 'border-color 0.2s ease' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', background: 'var(--accent-color, #a855f7)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
