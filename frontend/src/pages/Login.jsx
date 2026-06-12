import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = ({ onLogin }) => {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        registerNo,
        password
      });

      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Trigger user update in App.jsx
      if (onLogin) {
        onLogin(response.data.user);
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check connection and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center justify-center min-h-screen animate-fade-in" style={{ padding: '1rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '4rem', 
            height: '4rem', 
            background: 'var(--accent-glow)', 
            borderRadius: '1rem', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--card-border)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>Account Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter credentials to access the hostel portal</p>
        </div>
        
        {error && (
          <div style={{ 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.2)', 
            color: 'var(--error)', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="registerNo">Register Number</label>
            <input
              type="text"
              id="registerNo"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              placeholder="e.g. 22CSR001"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Verifying Account...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
