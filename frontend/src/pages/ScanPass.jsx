import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../api/api';
import { getFriendlyErrorMessage } from '../utils/errorUtils';


const ScanPass = ({ user }) => {
  const [passIdInput, setPassIdInput] = useState('');
  const [scannedPass, setScannedPass] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user || user.role !== 'staff') {
      navigate('/login');
      return;
    }

    // Initialize scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);

    const onScanSuccess = (decodedText) => {
      console.log(`Scan success: ${decodedText}`);
      setPassIdInput(decodedText);
      fetchPassDetails(decodedText);

      // Stop scanner after success
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      setScanning(false);
    };

    const onScanFailure = (error) => {
      // Ignore failure to find QR in frame
    };

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner on unmount", error));
      }
    };
  }, [user, navigate]);

  const fetchPassDetails = async (id) => {
    setError('');
    setScanStatus(null);
    setScannedPass(null);

    const passId = id || passIdInput.trim();
    if (!passId) return;

    try {
      const res = await api.get(`/passes/${passId}`, { headers });
      setScannedPass(res.data);
    } catch (err) {
      console.error('Fetch pass details error:', err);
      setError(getFriendlyErrorMessage(err, 'Invalid Pass ID'));
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

      if (res.data.status === 'VALID') {
        // Keep the record visible for a moment then maybe resettability
      }
    } catch (err) {
      console.error('Serve meal error:', err);
      setError(getFriendlyErrorMessage(err, 'Failed to serve meal'));
    }
  };

  const resetScanner = () => {
    window.location.reload(); // Simplest way to re-init camera
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1rem' }}>
      <header className="flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn-danger" style={{ padding: '0.5rem 0.75rem', background: 'transparent' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800' }}>QR Pass Scanner</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

      {!scannedPass && (
        <div className="glass-card" style={{ 
          padding: '1rem', 
          textAlign: 'center', 
          maxWidth: '100vw', 
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center' 
        }}>
          <div id="reader" style={{ 
            width: '100%', 
            overflow: 'hidden', 
            borderRadius: '1.25rem', 
            border: 'none', 
            maxWidth: '480px',
            margin: '0 auto' 
          }}></div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>OR ENTER MANUALLY</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Pass ID..."
                value={passIdInput}
                onChange={(e) => setPassIdInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button onClick={() => fetchPassDetails()} className="btn-primary" style={{ padding: '0 1rem' }}>Fetch</button>
            </div>
          </div>
        </div>
      )}

      {scannedPass && (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Status Header */}
          <div style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            background: scannedPass.isServed ? 'rgba(244, 63, 94, 0.1)' : 
                       (scanStatus?.status === 'VALID' ? 'rgba(16, 185, 129, 0.1)' : 
                       (scanStatus?.status === 'EXPIRED' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(15, 23, 42, 0.3)')),
            borderBottom: `1px solid ${scannedPass.isServed ? 'var(--error)' : 
                                      (scanStatus?.status === 'VALID' ? 'var(--success)' : 
                                      (scanStatus?.status === 'EXPIRED' ? 'var(--warning)' : 'var(--card-border)'))}`
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              color: scannedPass.isServed ? 'var(--error)' : 
                     (scanStatus?.status === 'VALID' ? 'var(--success)' : 
                     (scanStatus?.status === 'EXPIRED' ? 'var(--warning)' : 'white')) 
            }}>
              {scannedPass.isServed ? 'ALREADY SERVED' : (scanStatus?.message || 'PASS DETECTED')}
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Verification Result</p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Student Info */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{scannedPass.student?.name}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{scannedPass.student?.registerNo}</p>
            </div>

            {/* Pass Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session</p>
                <p style={{ fontWeight: '700' }}>{scannedPass.mealSession}</p>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meal Type</p>
                <p style={{ fontWeight: '700', color: scannedPass.mealOption === 'Veg' ? 'var(--success)' : '#fb7185' }}>{scannedPass.mealOption}</p>
              </div>
            </div>

            {/* Served Time if exists */}
            {scannedPass.isServed && (
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(15, 23, 42, 0.4)', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--card-border)',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Previously Served At</p>
                <p style={{ fontWeight: '700' }}>{new Date(scannedPass.servedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
              </div>
            )}

            {/* Action Buttons */}
            {!scannedPass.isServed && !scanStatus && (
              <button
                onClick={handleServeMeal}
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Confirm & Serve
              </button>
            )}

            <button
              onClick={resetScanner}
              className="btn-danger"
              style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.875rem' }}
            >
              {scanStatus || scannedPass.isServed ? 'Scan Next Pass' : 'Cancel & Re-scan'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Tip: Ensure the QR is well-lit and centered.
        </p>
      </div>
    </div>
  );
};

export default ScanPass;
