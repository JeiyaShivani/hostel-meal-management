import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      {user.role === 'student' ? (
        <StudentDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StaffDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Dashboard;
