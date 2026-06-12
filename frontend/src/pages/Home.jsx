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
    <div className="home-container">
      <div className="status-card">
        <h1 className="title">Hostel Meal Management</h1>
        <p className="subtitle">System Initialization & Status Dashboard</p>
        
        <div className="divider" />

        <div className="status-group">
          <div className="status-item">
            <span className="status-label">Backend API Connection:</span>
            {loading ? (
              <span className="badge loading">Checking...</span>
            ) : error ? (
              <span className="badge disconnected">Disconnected</span>
            ) : (
              <span className="badge connected">{healthInfo?.message || 'Backend Connected'}</span>
            )}
          </div>

          <div className="status-item">
            <span className="status-label">Database Connection:</span>
            {loading ? (
              <span className="badge loading">Checking...</span>
            ) : error ? (
              <span className="badge disconnected">N/A</span>
            ) : (
              <span className={`badge ${healthInfo?.database?.status === 'Connected' ? 'connected' : 'disconnected'}`}>
                {healthInfo?.database?.status || 'Unknown'}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="error-panel">
            <p><strong>Error Details:</strong> {error}</p>
            <button className="retry-btn" onClick={fetchHealth}>Retry Connection</button>
          </div>
        )}

        {!loading && !error && healthInfo && (
          <div className="success-panel">
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              <span>System Operational</span>
            </div>
            <p className="success-message">Successfully connected to React, Express, and MongoDB.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
