import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const [customersRes, jobsRes, financeRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/jobs'),
        axios.get(`/api/finance/summary/${new Date().getFullYear()}/${new Date().getMonth() + 1}`)
      ]);
      setStats({
        totalCustomers: customersRes.data.length,
        totalJobs: jobsRes.data.length,
        monthlyIncome: financeRes.data.totalIncome,
        monthlyExpenses: financeRes.data.totalExpenses,
        profit: financeRes.data.profit
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setRecentJobs(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Total Customers: {stats.totalCustomers}</div>
        <div className="bg-white p-4 rounded shadow">Total Jobs: {stats.totalJobs}</div>
        <div className="bg-white p-4 rounded shadow">Monthly Income: ${stats.monthlyIncome}</div>
        <div className="bg-white p-4 rounded shadow">Monthly Expenses: ${stats.monthlyExpenses}</div>
        <div className="bg-white p-4 rounded shadow">Profit/Loss: ${stats.profit}</div>
      </div>
      <h2 className="text-2xl mb-4">Recent Jobs</h2>
      <ul>
        {recentJobs.map(job => (
          <li key={job._id} className="bg-white p-4 mb-2 rounded shadow">
            {job.customer.name} - {job.workType} - {job.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;