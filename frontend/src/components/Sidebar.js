import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl mb-6">WELD CRM</h2>
      <nav>
        <ul>
          <li className="mb-2"><Link to="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link></li>
          <li className="mb-2"><Link to="/customers" className="block p-2 hover:bg-gray-700">Customers</Link></li>
          <li className="mb-2"><Link to="/jobs" className="block p-2 hover:bg-gray-700">Jobs</Link></li>
          <li className="mb-2"><Link to="/quotations" className="block p-2 hover:bg-gray-700">Quotations</Link></li>
          <li className="mb-2"><Link to="/finance" className="block p-2 hover:bg-gray-700">Finance</Link></li>
          <li className="mb-2"><Link to="/reports" className="block p-2 hover:bg-gray-700">Reports</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;