import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Finance = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Other' });
  const [summary, setSummary] = useState({});

  const notifyDashboardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm:data-updated'));
    }
  };

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
    notifyDashboardRefresh();
  };

  const summaryCards = [
    { label: 'Income', value: `$${summary.totalIncome || 0}` , tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Expenses', value: `$${summary.totalExpenses || 0}` , tone: 'bg-rose-100 text-rose-700' },
    { label: 'Profit', value: `$${summary.profit || 0}`, tone: 'bg-violet-100 text-violet-700' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Accounting</p>
          <h1 className="text-3xl font-bold text-slate-800">Finance</h1>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${card.tone}`}>
            <div className="text-sm font-medium">{card.label}</div>
            <div className="mt-2 text-2xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
          >
            <option>Material</option>
            <option>Transport</option>
            <option>Labor</option>
            <option>Other</option>
          </select>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700">
            Add Expense
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{exp.description}</td>
                <td className="px-4 py-3 text-sm text-slate-600">${exp.amount}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{exp.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finance;