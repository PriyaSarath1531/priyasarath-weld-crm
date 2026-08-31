import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer: '', workType: '', materialDetails: '', totalCost: '', advancePaid: '', startDate: '', deliveryDate: '', status: 'Pending'
  });
  const [editing, setEditing] = useState(null);

  const notifyDashboardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm:data-updated'));
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get('/api/jobs');
    setJobs(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get('/api/customers');
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, totalCost: Number(form.totalCost), advancePaid: Number(form.advancePaid) };
    if (editing) {
      await axios.put(`/api/jobs/${editing}`, data);
    } else {
      await axios.post('/api/jobs', data);
    }
    setForm({
      customer: '', workType: '', materialDetails: '', totalCost: '', advancePaid: '', startDate: '', deliveryDate: '', status: 'Pending'
    });
    setEditing(null);
    fetchJobs();
    notifyDashboardRefresh();
  };

  const handleEdit = (job) => {
    setForm({
      customer: job.customer._id,
      workType: job.workType,
      materialDetails: job.materialDetails,
      totalCost: job.totalCost,
      advancePaid: job.advancePaid,
      startDate: job.startDate.split('T')[0],
      deliveryDate: job.deliveryDate ? job.deliveryDate.split('T')[0] : '',
      status: job.status
    });
    setEditing(job._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/jobs/${id}`);
    fetchJobs();
    notifyDashboardRefresh();
  };

  const getStatusClass = (status) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'In Progress') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-200 text-slate-700';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Operations</p>
          <h1 className="text-3xl font-bold text-slate-800">Jobs</h1>
        </div>
        <div className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
          {jobs.length} active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            placeholder="Work Type"
            value={form.workType}
            onChange={(e) => setForm({ ...form, workType: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <input
            type="number"
            placeholder="Total Cost"
            value={form.totalCost}
            onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <input
            type="number"
            placeholder="Advance Paid"
            value={form.advancePaid}
            onChange={(e) => setForm({ ...form, advancePaid: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
          />
          <input
            type="text"
            placeholder="Material Details"
            value={form.materialDetails}
            onChange={(e) => setForm({ ...form, materialDetails: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white md:col-span-2"
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
            required
          />
          <input
            type="date"
            value={form.deliveryDate}
            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700">
            {editing ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{job.customer?.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{job.workType}</td>
                <td className="px-4 py-3 text-sm text-slate-600">${job.totalCost}</td>
                <td className="px-4 py-3 text-sm text-slate-600">${job.balanceAmount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleEdit(job)} className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200">Edit</button>
                    <button onClick={() => handleDelete(job._id)} className="rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Jobs;