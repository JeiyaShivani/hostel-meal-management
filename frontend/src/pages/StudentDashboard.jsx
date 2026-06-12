import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { QRCodeSVG } from 'qrcode.react';

const StudentDashboard = ({ user, onLogout }) => {
  const [mealConfigs, setMealConfigs] = useState([]);
  const [myPasses, setMyPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const [configRes, passesRes] = await Promise.all([
        api.get('/schedule', { headers }),
        api.get('/passes/my-passes', { headers })
      ]);

      setMealConfigs(configRes.data);
      setMyPasses(passesRes.data);

    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to load dashboard details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookPass = async (session) => {
    setError('');
    setMessage('');

    try {
      await api.post(
        '/passes',
        {
          date: todayStr,
          mealSession: session
        },
        { headers }
      );
      setMessage(`Successfully booked ${session} pass!`);
      fetchData(); // Refresh pass details
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book meal pass');
    }
  };

  // Check if student has already booked pass for session today
  const getTodayPassForSession = (session) => {
    return myPasses.find(p => p.date.startsWith(todayStr) && p.mealSession === session);
  };

  return (
    <div className="container animate-fade-in">
      <header className="flex justify-between align-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>Student Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.name}</span></p>
        </div>
        <button onClick={onLogout} className="btn-danger flex align-center gap-2" style={{ fontWeight: '600' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </header>

      {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.2)', marginBottom: '2rem' }}>{error}</div>}
      {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '2rem' }}>{message}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem' }}></div>
          Loading your meal sessions...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2.5rem' }}>
          {/* Active Booking Section */}
          <section className="glass-card">
            <div className="flex align-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Today's Meal Availability</h3>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>{todayStr}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {['Breakfast', 'Lunch', 'Dinner'].map(sessionName => {
                const config = mealConfigs.find(c => c.mealSession === sessionName) || { startTime: '--:--', endTime: '--:--', choiceEnabled: true };
                const pass = getTodayPassForSession(sessionName);

                return (
                  <div key={sessionName} style={{ 
                    background: 'rgba(15, 23, 42, 0.5)', 
                    padding: '1.5rem', 
                    borderRadius: '1rem', 
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{sessionName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--accent-glow)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                        {config.startTime} - {config.endTime}
                      </span>
                    </div>

                    {!config.choiceEnabled ? (
                      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '1rem', border: '1px dashed var(--success)' }}>
                          <p style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.25rem' }}>Veg Only</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No QR Required</p>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Proceed directly to the mess counter.</p>
                      </div>
                    ) : pass ? (
                      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="qr-container" style={{ margin: '0.5rem auto' }}>
                          <QRCodeSVG value={pass._id} size={140} level="H" />
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '0.5rem 0' }}>PASS_ID: {pass._id}</p>
                        <div style={{ marginTop: '0.5rem' }}>
                          {pass.isServed ? (
                            <span className="badge badge-success">✓ SERVED AT {new Date(pass.servedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          ) : (
                            <span className="badge badge-pending">PENDING VERIFICATION</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Generate your digital token for this session. Your default meal preference will be applied automatically.
                          </p>
                        </div>
                        <button 
                          onClick={() => handleBookPass(sessionName)}
                          className="btn-primary"
                          style={{ width: '100%', fontSize: '0.875rem' }}
                        >
                          Generate {sessionName} Pass
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* History Section */}
          <section className="glass-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Booking History</h3>
            {myPasses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No previous meal records found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr className="header-row">
                      <th>Date</th>
                      <th>Session</th>
                      <th>Preference</th>
                      <th>Verification Status</th>
                      <th>Scan Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPasses.map(pass => (
                      <tr key={pass._id}>
                        <td style={{ fontWeight: '500' }}>{new Date(pass.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td><span style={{ textTransform: 'capitalize' }}>{pass.mealSession}</span></td>
                        <td>
                          <span style={{ color: pass.mealOption === 'Veg' ? 'var(--success)' : '#f87171' }}>{pass.mealOption}</span>
                        </td>
                        <td>
                          {pass.isServed ? <span className="badge badge-success">Served</span> : <span className="badge badge-pending">Expired/Unused</span>}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {pass.isServed ? new Date(pass.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
