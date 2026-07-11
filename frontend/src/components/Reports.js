import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const Reports = () => {
  const [summary, setSummary] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchSummary = useCallback(async () => {
    const res = await axios.get(`/api/finance/summary/${year}/${month}`);
    setSummary(res.data);
  }, [year, month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleDownload = () => {
    window.print(); // Simple print for PDF
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Reports</h1>
      <div className="mb-4">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border mr-2">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border"
        />
      </div>
      <div className="bg-white p-6 shadow">
        <h2 className="text-2xl mb-4">Monthly Report</h2>
        <p>Total Income: ${summary.totalIncome}</p>
        <p>Total Expenses: ${summary.totalExpenses}</p>
        <p>Profit/Loss: ${summary.profit}</p>
        <h3 className="text-xl mt-4">Expenses</h3>
        <ul>
          {summary.expenses?.map(exp => (
            <li key={exp._id}>{exp.description}: ${exp.amount}</li>
          ))}
        </ul>
        <h3 className="text-xl mt-4">Jobs</h3>
        <ul>
          {summary.jobs?.map(job => (
            <li key={job._id}>{job.customer.name} - {job.workType}: ${job.totalCost}</li>
          ))}
        </ul>
        <button onClick={handleDownload} className="bg-blue-500 text-white p-2 mt-4">Download PDF</button>
      </div>
    </div>
  );
};

export default Reports;