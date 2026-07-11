import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get('http://localhost:5000/api/customers');
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`http://localhost:5000/api/customers/${editing}`, form);
    } else {
      await axios.post('http://localhost:5000/api/customers', form);
    }
    setForm({ name: '', phone: '', address: '' });
    setEditing(null);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setForm(customer);
    setEditing(customer._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/customers/${id}`);
    fetchCustomers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Customers</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 border mr-2"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="p-2 border mr-2"
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="p-2 border mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">{editing ? 'Update' : 'Add'}</button>
      </form>
      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Address</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer._id}>
              <td className="p-2">{customer.name}</td>
              <td className="p-2">{customer.phone}</td>
              <td className="p-2">{customer.address}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(customer)} className="bg-yellow-500 text-white p-1 mr-2">Edit</button>
                <button onClick={() => handleDelete(customer._id)} className="bg-red-500 text-white p-1">Delete</button>
                <a href={`https://wa.me/${customer.phone}`} target="_blank" rel="noreferrer" className="bg-green-500 text-white p-1 ml-2">WhatsApp</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;