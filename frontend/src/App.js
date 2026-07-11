import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Jobs from './components/Jobs';
import Quotations from './components/Quotations';
import Finance from './components/Finance';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <button onClick={logout} className="absolute top-4 right-4 bg-red-500 text-white p-2">Logout</button>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
