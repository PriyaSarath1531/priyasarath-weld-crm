import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer: '', workDetails: '', estimatedCost: '' });

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
  };

  const handleConvert = async (id) => {
    await axios.post(`/api/quotations/${id}/convert`);
    fetchQuotations();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Quotations</h1>
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
          placeholder="Work Details"
          value={form.workDetails}
          onChange={(e) => setForm({ ...form, workDetails: e.target.value })}
          className="p-2 border"
          required
        />
        <input
          type="number"
          placeholder="Estimated Cost"
          value={form.estimatedCost}
          onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
          className="p-2 border"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Create Quotation</button>
      </form>
      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Customer</th>
            <th className="p-2">Work Details</th>
            <th className="p-2">Estimated Cost</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map(q => (
            <tr key={q._id}>
              <td className="p-2">{q.customer.name}</td>
              <td className="p-2">{q.workDetails}</td>
              <td className="p-2">${q.estimatedCost}</td>
              <td className="p-2">{q.status}</td>
              <td className="p-2">
                {q.status === 'Pending' && (
                  <button onClick={() => handleConvert(q._id)} className="bg-green-500 text-white p-1">Convert to Job</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Quotations;