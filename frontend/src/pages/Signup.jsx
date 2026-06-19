import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { getFriendlyErrorMessage } from '../utils/errorUtils';


const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    registerNo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Single static quote
  const activeQuote = "Efficiency is the backbone of operational excellence.";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (onLogin) {
        onLogin(response.data.user);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getFriendlyErrorMessage(err, 'Registration failed. Please check your details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Pane */}
      <div className="login-side-asset">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
            <div style={{ width: '2rem', height: '2rem', background: 'var(--primary)', borderRadius: '0.5rem' }}></div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'white' }}>DineFlow</span>
          </div>
          
          <h1 className="hero-text">
            Join the <span style={{ color: 'var(--primary)' }}>network.</span>
          </h1>
        </div>

        <div className="quote-container">
          <p className="quote-text">
            "{activeQuote}"
          </p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="login-form-pane">
        <div className="glass-card animate-fade-in login-card">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Register as a student to access the portal.</p>
          </div>
          
          {error && (
            <div style={{ 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              color: 'var(--error)', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              fontSize: '0.875rem',
              marginBottom: '2rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="name" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', height: '3.25rem' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="registerNo" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Register Number</label>
              <input
                type="text"
                id="registerNo"
                value={formData.registerNo}
                onChange={handleChange}
                placeholder="22CSR001"
                style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', height: '3.25rem' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Set Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', height: '3.25rem' }}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: '3.5rem', fontSize: '1rem', fontWeight: '700' }}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          background: #020617;
        }
        .login-side-asset {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem;
          background: radial-gradient(circle at top left, #1e293b, #020617);
          position: relative;
        }
        .hero-text {
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.05em;
          color: white;
          max-width: 600px;
          margin-bottom: 2rem;
        }
        .quote-container {
          max-width: 400px;
          margin-top: 2rem;
        }
        .quote-text {
          font-size: 1.125rem;
          color: white;
          opacity: 0.6;
          line-height: 1.6;
          fontWeight: 500;
          borderLeft: 2px solid var(--primary);
          paddingLeft: 1.5rem;
        }
        .login-form-pane {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          maxWidth: 420px;
          padding: 2.5rem;
          background: rgba(15, 23, 42, 0.4);
          backdropFilter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        @media (max-width: 900px) {
          .login-page-container {
            flex-direction: column;
          }
          .login-side-asset {
            padding: 3rem 2rem;
            flex: none;
            align-items: center;
            text-align: center;
          }
          .hero-text {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          .quote-container {
            margin-top: 1rem;
          }
          .quote-text {
            border-left: none;
            border-top: 2px solid var(--primary);
            padding-left: 0;
            padding-top: 1rem;
          }
          .login-form-pane {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
