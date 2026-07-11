import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer: '', workType: '', materialDetails: '', totalCost: '', advancePaid: '', startDate: '', deliveryDate: '', status: 'Pending'
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get('http://localhost:5000/api/jobs');
    setJobs(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get('http://localhost:5000/api/customers');
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, totalCost: Number(form.totalCost), advancePaid: Number(form.advancePaid) };
    if (editing) {
      await axios.put(`http://localhost:5000/api/jobs/${editing}`, data);
    } else {
      await axios.post('http://localhost:5000/api/jobs', data);
    }
    setForm({
      customer: '', workType: '', materialDetails: '', totalCost: '', advancePaid: '', startDate: '', deliveryDate: '', status: 'Pending'
    });
    setEditing(null);
    fetchJobs();
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
    await axios.delete(`http://localhost:5000/api/jobs/${id}`);
    fetchJobs();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Jobs</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-4">
        <select
          value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })}
          className="p-2 border"
          required
        >
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Work Type"
          value={form.workType}
          onChange={(e) => setForm({ ...form, workType: e.target.value })}
          className="p-2 border"
          required
        />
        <input
          type="text"
          placeholder="Material Details"
          value={form.materialDetails}
          onChange={(e) => setForm({ ...form, materialDetails: e.target.value })}
          className="p-2 border"
        />
        <input
          type="number"
          placeholder="Total Cost"
          value={form.totalCost}
          onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
          className="p-2 border"
          required
        />
        <input
          type="number"
          placeholder="Advance Paid"
          value={form.advancePaid}
          onChange={(e) => setForm({ ...form, advancePaid: e.target.value })}
          className="p-2 border"
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="p-2 border"
          required
        />
        <input
          type="date"
          value={form.deliveryDate}
          onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
          className="p-2 border"
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="p-2 border"
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 col-span-2">{editing ? 'Update' : 'Add'} Job</button>
      </form>
      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Customer</th>
            <th className="p-2">Work Type</th>
            <th className="p-2">Total Cost</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job._id}>
              <td className="p-2">{job.customer.name}</td>
              <td className="p-2">{job.workType}</td>
              <td className="p-2">${job.totalCost}</td>
              <td className="p-2">${job.balanceAmount}</td>
              <td className="p-2">{job.status}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(job)} className="bg-yellow-500 text-white p-1 mr-2">Edit</button>
                <button onClick={() => handleDelete(job._id)} className="bg-red-500 text-white p-1">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Jobs;