import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [healthInfo, setHealthInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setHealthInfo(response.data);
    } catch (err) {
      console.error('Error fetching health status:', err);
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '5rem', 
            height: '5rem', 
            background: 'var(--accent-glow)', 
            borderRadius: '1.25rem', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--card-border)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
              <path d="M7 2v20"></path>
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>Antigravity Mess</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Next-generation hostel meal management system</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-item">
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>API Backend</div>
            {loading ? (
              <span className="badge badge-pending">Testing...</span>
            ) : error ? (
              <span className="badge badge-error">Offline</span>
            ) : (
              <span className="badge badge-success">Active</span>
            )}
          </div>
          <div className="stat-item">
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Database</div>
            {loading ? (
              <span className="badge badge-pending">Testing...</span>
            ) : error ? (
              <span className="badge badge-error">N/A</span>
            ) : (
              <span className={`badge ${healthInfo?.database?.status === 'Connected' ? 'badge-success' : 'badge-error'}`}>
                {healthInfo?.database?.status || 'Unknown'}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}><strong>Connection Error:</strong> {error}</p>
            <button className="btn-primary" onClick={fetchHealth} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Retry System Check</button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex align-center justify-center gap-2" style={{ marginBottom: '1rem', color: 'var(--success)', fontSize: '0.875rem', fontWeight: '600' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px var(--success)' }}></span>
              SYSTEM OPERATIONAL
            </div>
            <button onClick={() => window.location.href='/login'} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
              Enter Platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
