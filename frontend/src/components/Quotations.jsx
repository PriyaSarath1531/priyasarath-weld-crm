import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer: '', workDetails: '', estimatedCost: '' });

  const notifyDashboardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm:data-updated'));
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
  }, []);

  const fetchQuotations = async () => {
    const res = await axios.get('/api/quotations');
    setQuotations(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get('/api/customers');
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/quotations', { ...form, estimatedCost: Number(form.estimatedCost) });
    setForm({ customer: '', workDetails: '', estimatedCost: '' });
    fetchQuotations();
    notifyDashboardRefresh();
  };

  const handleConvert = async (id) => {
    await axios.post(`/api/quotations/${id}/convert`);
    fetchQuotations();
    notifyDashboardRefresh();
  };

  const getStatusClass = (status) => {
    if (status === 'Accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Sales</p>
          <h1 className="text-3xl font-bold text-slate-800">Quotations</h1>
        </div>
        <div className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700">
          {quotations.length} quotes
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <select
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Work Details"
            value={form.workDetails}
            onChange={(e) => setForm({ ...form, workDetails: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <input
            type="number"
            placeholder="Estimated Cost"
            value={form.estimatedCost}
            onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700">
            Create Quotation
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cost</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotations.map((q) => (
              <tr key={q._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{q.customer?.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{q.workDetails}</td>
                <td className="px-4 py-3 text-sm text-slate-600">${q.estimatedCost}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(q.status)}`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {q.status === 'Pending' && (
                    <button onClick={() => handleConvert(q._id)} className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200">
                      Convert to Job
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quotations;