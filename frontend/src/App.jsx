import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Jobs from './components/Jobs';
import Quotations from './components/Quotations';
import Finance from './components/Finance';
import Reports from './components/Reports';
import './App.css';

const ProtectedLayout = ({ onLogout, user }) => (
  <div className="flex min-h-screen bg-[#e7e7e7] text-slate-800">
    <Sidebar user={user} onLogout={onLogout} />
    <div className="flex-1 bg-[#f7f7f7] px-6 py-5">
      <Outlet />
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token || user?.email) return;

    axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }, [token, user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} setUser={setUser} initialMode="login" />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} initialMode="register" />} />
        <Route element={token ? <ProtectedLayout onLogout={logout} user={user} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
