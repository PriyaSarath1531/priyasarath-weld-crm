import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Finance = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Other' });
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('/api/finance/expenses');
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const now = new Date();
    const res = await axios.get(`/api/finance/summary/${now.getFullYear()}/${now.getMonth() + 1}`);
    setSummary(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/finance/expenses', { ...form, amount: Number(form.amount) });
    setForm({ description: '', amount: '', category: 'Other' });
    fetchExpenses();
    fetchSummary();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Finance</h1>
      <div className="mb-6">
        <h2 className="text-2xl mb-4">Monthly Summary</h2>
        <p>Income: ${summary.totalIncome}</p>
        <p>Expenses: ${summary.totalExpenses}</p>
        <p>Profit: ${summary.profit}</p>
      </div>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="p-2 border"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="p-2 border"
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="p-2 border"
        >
          <option>Material</option>
          <option>Transport</option>
          <option>Labor</option>
          <option>Other</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2">Add Expense</button>
      </form>
      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Description</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Category</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp._id}>
              <td className="p-2">{exp.description}</td>
              <td className="p-2">${exp.amount}</td>
              <td className="p-2">{exp.category}</td>
              <td className="p-2">{new Date(exp.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Finance;