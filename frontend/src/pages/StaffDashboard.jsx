import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const StaffDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vegCount: 0, nonVegCount: 0, servedCount: 0, pendingCount: 0 });
  const [configForm, setConfigForm] = useState({ mealSession: 'Lunch', startTime: '12:00', endTime: '14:00', choiceEnabled: true });
  const [passIdInput, setPassIdInput] = useState('');
  const [scannedPass, setScannedPass] = useState(null);
  const [selectedMealOption, setSelectedMealOption] = useState('Veg');
  const [scanStatus, setScanStatus] = useState(null); // { status, message }
  const [loadingStats, setLoadingStats] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Student Preference Management State
  const [searchRegNo, setSearchRegNo] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [prefMessage, setPrefMessage] = useState('');
  const [prefError, setPrefError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  useEffect(() => {
    fetchStats();
    fetchCurrentConfig();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get(`/stats/daily?date=${todayStr}`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCurrentConfig = async () => {
    try {
      const res = await api.get('/schedule', { headers });
      const current = res.data.find(c => c.mealSession === configForm.mealSession);
      if (current) {
        setConfigForm({
          mealSession: current.mealSession,
          startTime: current.startTime,
          endTime: current.endTime,
          choiceEnabled: current.choiceEnabled
        });
      }
    } catch (err) {
      console.error('Fetch config error:', err);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
  }, [configForm.mealSession]);

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/schedule', configForm, { headers });
      setMessage('Meal timing configuration updated successfully!');
    } catch (err) {
      console.error('Config update error:', err);
      setError(err.response?.data?.message || 'Failed to update configuration');
    }
  };

  const handleFetchPassDetails = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setScanStatus(null);
    setScannedPass(null);

    if (!passIdInput.trim()) return;

    try {
      const res = await api.get(`/passes/${passIdInput.trim()}`, { headers });
      setScannedPass(res.data);
      setSelectedMealOption(res.data.mealOption);
    } catch (err) {
      console.error('Fetch pass details error:', err);
      setError(err.response?.data?.message || 'Pass ID not found / Invalid ID');
    }
  };

  const handleServeMeal = async () => {
    setError('');
    setScanStatus(null);

    try {
      const res = await api.post(
        `/passes/${scannedPass._id}/serve`,
        {},
        { headers }
      );

      setScanStatus({
        status: res.data.status,
        message: res.data.message
      });

      // Refresh statistics
      fetchStats();

      // Clear input and scanned pass only if served successfully
      if (res.data.status === 'VALID') {
        setScannedPass(null);
        setPassIdInput('');
      }
    } catch (err) {
      console.error('Serve meal error:', err);
      setError(err.response?.data?.message || 'Failed to serve meal');
    }
  };

  const handleSearchStudent = async (e) => {
    e.preventDefault();
    setPrefError('');
    setPrefMessage('');
    setFoundStudent(null);
    setSearchLoading(true);

    try {
      const res = await api.get(`/users/search/${searchRegNo.trim()}`, { headers });
      setFoundStudent(res.data);
    } catch (err) {
      setPrefError(err.response?.data?.message || 'Student not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpdateStudentPreference = async (newPref) => {
    setPrefError('');
    setPrefMessage('');
    try {
      const res = await api.put(`/users/${foundStudent._id}/preference`, { defaultMealPreference: newPref }, { headers });
      setFoundStudent(prev => ({ ...prev, defaultMealPreference: res.data.defaultMealPreference }));
      setPrefMessage('Preference updated successfully.');
    } catch (err) {
      setPrefError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="container animate-fade-in">
      <header className="flex justify-between align-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>Mess & Meal Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Operations Dashboard • <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.name}</span></p>
        </div>
        <button onClick={onLogout} className="btn-danger flex align-center gap-2" style={{ fontWeight: '600' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </header>

      {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.2)', marginBottom: '2rem' }}>{error}</div>}
      {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '2rem' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        <div>
          {/* Daily Stats Card */}
          <section className="glass-card" style={{ marginBottom: '2rem' }}>
            <div className="flex align-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Daily Statistics</h3>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>{todayStr}</span>
            </div>

            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Refreshing metrics...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.vegCount}</div>
                  <div className="stat-label">Veg</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#fb7185' }}>{stats.nonVegCount}</div>
                  <div className="stat-label">Non-Veg</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.servedCount}</div>
                  <div className="stat-label">Served</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.pendingCount}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            )}
          </section>

          {/* Scanner Card */}
          <section className="glass-card">
            <div className="flex align-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Meal Verification</h3>
            </div>

            <button 
              onClick={() => navigate('/scan')}
              className="btn-primary flex align-center justify-center gap-2"
              style={{ width: '100%', padding: '1rem', marginBottom: '2rem', fontSize: '1rem' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z"></path><path d="M12 9v4"></path><path d="M16 7l-4 4-4-4"></path></svg>
              Open Mobile QR Scanner
            </button>

            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '0 0.5rem', position: 'relative', top: '0.6rem' }}>OR MANUAL ENTRY</span>
            </div>

            <form onSubmit={handleFetchPassDetails} style={{ marginBottom: '2rem' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={passIdInput}
                  onChange={(e) => setPassIdInput(e.target.value)}
                  placeholder="Paste ID or use scanner..."
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}>Fetch</button>
              </div>
            </form>

            {scanStatus && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                marginBottom: '1.5rem',
                textAlign: 'center',
                background: scanStatus.status === 'VALID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${scanStatus.status === 'VALID' ? 'var(--success)' : 'var(--error)'}`
              }}>
                <div style={{ fontWeight: '700', color: scanStatus.status === 'VALID' ? 'var(--success)' : 'var(--error)' }}>{scanStatus.message}</div>
                {scanStatus.status === 'VALID' && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>The student can now proceed to take their meal.</p>}
              </div>
            )}

            {scannedPass && (
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student & Pass Details</span>
                  <span className="badge badge-success">{scannedPass.mealSession}</span>
                </div>
                
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{scannedPass.student?.name}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Reg No: {scannedPass.student?.registerNo}</p>
                
                {scannedPass.isServed ? (
                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.5rem', textAlign: 'center', border: '1px dashed var(--success)' }}>
                    <p style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.875rem' }}>MEAL SERVED: {scannedPass.mealOption}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Verified at {new Date(scannedPass.servedAt).toLocaleTimeString()}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MEAL OPTION</p>
                      <p style={{ fontSize: '1rem', fontWeight: '700', color: scannedPass.mealOption === 'Veg' ? 'var(--success)' : '#fb7185' }}>
                        {scannedPass.mealOption}
                      </p>
                    </div>

                    <button
                      onClick={handleServeMeal}
                      className="btn-primary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Serve Meal
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Preferences & Configuration */}
        <div style={{ height: 'fit-content' }}>
          {/* Student Preference Management Card */}
          <section className="glass-card" style={{ marginBottom: '2rem' }}>
            <div className="flex align-center gap-2" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Student Preference Management</h3>
            </div>

            <form onSubmit={handleSearchStudent} className="flex gap-2" style={{ marginBottom: foundStudent ? '1.5rem' : '0' }}>
              <input
                type="text"
                placeholder="Register Number (e.g. 22CSR001)"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={searchLoading}>
                {searchLoading ? '...' : 'Search'}
              </button>
            </form>

            {prefError && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{prefError}</p>}
            {prefMessage && <p style={{ color: 'var(--success)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{prefMessage}</p>}

            {foundStudent && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Name</p>
                  <p style={{ fontWeight: '600' }}>{foundStudent.name}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Register Number</p>
                  <p style={{ fontWeight: '600' }}>{foundStudent.registerNo}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Preference</p>
                  <div className="flex gap-2">
                    {['Veg', 'Non-Veg'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleUpdateStudentPreference(opt)}
                        style={{ 
                          flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: '600',
                          background: foundStudent.defaultMealPreference === opt ? 'var(--primary)' : 'transparent',
                          color: foundStudent.defaultMealPreference === opt ? '#0f172a' : 'var(--text-main)',
                          border: `1px solid ${foundStudent.defaultMealPreference === opt ? 'var(--primary)' : 'var(--card-border)'}`
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Global Configuration Card */}
          <section className="glass-card">
            <div className="flex align-center gap-2" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Session Setup</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Define operational windows for hostel mess. These settings are applied daily.</p>
            
            <form onSubmit={handleUpdateConfig}>
              <div className="form-group">
                <label>Select Session</label>
                <select
                  value={configForm.mealSession}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, mealSession: e.target.value }))}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="07:00"
                    value={configForm.startTime}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00"
                    value={configForm.endTime}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex align-center gap-2" style={{ marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <input
                  type="checkbox"
                  id="choiceEnabled"
                  checked={configForm.choiceEnabled}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, choiceEnabled: e.target.checked }))}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <label htmlFor="choiceEnabled" style={{ marginBottom: 0, cursor: 'pointer', color: 'var(--text-main)' }}>Enable Veg/Non-Veg Menu Choice</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Save {configForm.mealSession} Configuration
              </button>
            </form>
          </section>
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
