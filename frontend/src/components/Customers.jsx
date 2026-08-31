import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const emptyForm = { name: '', phone: '', email: '', company: '', address: '', status: 'Active', notes: '' };
const pageSize = 10;
const dateLabel = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const isNew = (customer) => customer.createdAt && Date.now() - new Date(customer.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
const whatsapp = (customer) => `https://wa.me/${(customer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${customer.name}, this is WELD CRM. How can we help you today?`)}`;
const statusClass = { Active: 'bg-emerald-50 text-emerald-700', Inactive: 'bg-slate-100 text-slate-600', 'Follow-up': 'bg-amber-50 text-amber-700' };

const Modal = ({ title, children, onClose }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={title}><div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-100">&times;</button></div>{children}</div></div>;
const Input = ({ label, required, ...props }) => <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}{required && <span className="ml-1 text-red-500">*</span>}</span><input {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white" /></label>;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Customers');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);
  const notifyDashboardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm:data-updated'));
    }
  };

  const fetchCustomers = async () => {
    setLoading(true); setError('');
    try { const response = await axios.get('/api/customers'); setCustomers(Array.isArray(response.data) ? response.data : []); }
    catch (requestError) { setError('Unable to load customers. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { setPage(1); setSelected([]); }, [search, filter, sort]);
  useEffect(() => { if (!notice) return undefined; const timeout = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timeout); }, [notice]);
  useEffect(() => {
    const closeMenu = (event) => event.key === 'Escape' && setMenuOpen(null);
    document.addEventListener('keydown', closeMenu);
    return () => document.removeEventListener('keydown', closeMenu);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const searchable = [customer.name, customer.phone, customer.email, customer.address, customer.company].filter(Boolean).join(' ').toLowerCase();
      const status = customer.status || 'Active';
      return (!query || searchable.includes(query)) && (filter === 'All Customers' || (filter === 'New' && isNew(customer)) || filter === status);
    }).sort((first, second) => {
      if (sort === 'nameAsc') return (first.name || '').localeCompare(second.name || '');
      if (sort === 'nameDesc') return (second.name || '').localeCompare(first.name || '');
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return sort === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [customers, filter, search, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const visibleIds = visible.map((customer) => customer._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const activeCount = customers.filter((customer) => customer.status === 'Active' || !customer.status).length;
  const hasStatusData = customers.some((customer) => customer.status);
  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (customer) => { setEditing(customer._id); setForm({ ...emptyForm, ...customer }); setViewing(null); setMenuOpen(null); setError(''); setModalOpen(true); };
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError('');
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() };
      if (editing) { await axios.put(`/api/customers/${editing}`, payload); setNotice('Customer updated successfully.'); }
      else { await axios.post('/api/customers', payload); setNotice('Customer added successfully.'); }
      setForm(emptyForm); setEditing(null); setModalOpen(false); await fetchCustomers();
      notifyDashboardRefresh();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save customer. Please try again.'); }
    finally { setSaving(false); }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingCustomer(true);
    try { await axios.delete(`/api/customers/${deleting._id}`); setNotice('Customer deleted successfully.'); setSelected((current) => current.filter((id) => id !== deleting._id)); setDeleting(null); await fetchCustomers(); notifyDashboardRefresh(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete customer. Please try again.'); }
    finally { setDeletingCustomer(false); }
  };
  const exportCsv = () => {
    const rows = [['Name', 'Phone', 'Address', 'Created'], ...filtered.map((customer) => [customer.name, customer.phone, customer.address || '', dateLabel(customer.createdAt)])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'weld-crm-customers.csv'; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="mx-auto max-w-7xl p-4 sm:p-6">
    {notice && <div role="status" className="fixed right-5 top-5 z-[60] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{notice}</div>}
    <header className="mb-7 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">CRM <span className="px-1 text-slate-300">/</span> Customers</div><h1 className="text-3xl font-bold text-slate-900">Customers</h1><p className="mt-1 text-sm text-slate-500">Manage your customers and track customer relationships.</p></div><div className="flex flex-wrap items-center gap-3"><div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600"><b className="text-slate-900">{customers.length}</b> total customers</div><button type="button" onClick={openAdd} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Add Customer</button></div></header>
    <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Total Customers', customers.length, 'All customer records'], ['Active Customers', activeCount, hasStatusData ? 'Current status' : 'Status not stored by API'], ['New Customers', customers.filter(isNew).length, 'Added in the last 30 days'], ['Customers Requiring Follow-up', customers.filter((customer) => customer.status === 'Follow-up').length, hasStatusData ? 'Current status' : 'Status not stored by API']].map(([label, value, detail]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm font-medium text-slate-500">{label}</div><div className="mt-3 text-3xl font-bold text-slate-900">{value}</div><div className="mt-2 text-xs text-slate-400">{detail}</div></div>)}</section>
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="relative min-w-0 flex-1 xl:max-w-md"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input aria-label="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, email, address or company" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-400 focus:bg-white" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-slate-400">&times;</button>}</div><div className="flex flex-wrap items-center gap-2">{['All Customers', 'Active', 'Inactive', 'New', 'Follow-up'].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}<select aria-label="Sort customers" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"><option value="recent">Recently Added</option><option value="oldest">Oldest Added</option><option value="nameAsc">Name A-Z</option><option value="nameDesc">Name Z-A</option></select></div></div>{selected.length > 0 && <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">{selected.length} customer{selected.length === 1 ? '' : 's'} selected <button type="button" onClick={() => setSelected([])} className="ml-2 underline">Clear</button></div>}</section>
    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[850px] w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="w-12 px-4 py-3"><input type="checkbox" aria-label="Select all visible customers" checked={allSelected} onChange={() => setSelected((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])} /></th>{['Customer', 'Phone', 'Address', 'Created', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading ? Array.from({ length: 5 }).map((_, row) => <tr key={row}>{Array.from({ length: 7 }).map((__, cell) => <td key={cell} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>) : visible.map((customer) => <tr key={customer._id} className="transition hover:bg-slate-50"><td className="px-4 py-4"><input type="checkbox" aria-label={`Select ${customer.name}`} checked={selected.includes(customer._id)} onChange={() => setSelected((current) => current.includes(customer._id) ? current.filter((id) => id !== customer._id) : [...current, customer._id])} /></td><td className="px-4 py-4"><button type="button" onClick={() => setViewing(customer)} className="flex items-center gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials(customer.name)}</span><span><b className="block text-sm text-slate-800">{customer.name}</b><small className="block text-xs text-slate-400">{customer.email || 'Email not provided'}</small></span></button></td><td className="px-4 py-4 text-sm text-slate-600">{customer.phone}</td><td className="max-w-[220px] truncate px-4 py-4 text-sm text-slate-500">{customer.address || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">{dateLabel(customer.createdAt)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[customer.status || 'Active'] || statusClass.Active}`}>{customer.status || 'Active'}</span></td><td className="relative px-4 py-4"><button type="button" aria-label={`Actions for ${customer.name}`} aria-expanded={menuOpen === customer._id} aria-haspopup="menu" onClick={() => setMenuOpen(menuOpen === customer._id ? null : customer._id)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400">Actions</button>{menuOpen === customer._id && <div role="menu" className="absolute right-4 top-12 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button role="menuitem" type="button" onClick={() => { setViewing(customer); setMenuOpen(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">View</button><button role="menuitem" type="button" onClick={() => openEdit(customer)} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">Edit</button><a role="menuitem" href={whatsapp(customer)} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(null)} className="block rounded-lg px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50">WhatsApp</a><button role="menuitem" type="button" onClick={() => { setDeleting(customer); setMenuOpen(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50">Delete</button></div>}</td></tr>)}</tbody></table></div>{!loading && !filtered.length && <div className="px-6 py-16 text-center"><b className="text-slate-700">{search ? 'No customers match your search.' : 'No customers found'}</b><p className="mt-1 text-sm text-slate-400">{search ? 'Try a different search term.' : 'Add your first customer to get started.'}</p><button type="button" onClick={openAdd} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add Customer</button></div>}{error && <div className="flex items-center justify-between border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchCustomers} className="font-semibold underline">Try again</button></div>}{!loading && filtered.length > 0 && <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} customers <div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}</section>
    {modalOpen && <CustomerModal title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => !saving && setModalOpen(false)}><form onSubmit={handleSubmit} className="space-y-5 p-6"><div className="grid gap-4 sm:grid-cols-2"><Input label="Name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Customer name" /><Input label="Phone" required value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="Phone number" /></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="Email address" /><Input label="Company" value={form.company} onChange={(event) => updateForm('company', event.target.value)} placeholder="Company name" /></div><label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Address</span><textarea value={form.address} onChange={(event) => updateForm('address', event.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Status</span><select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option>Active</option><option>Inactive</option><option>Follow-up</option></select></label><Input label="Notes" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Optional notes" /></div><p className="text-xs text-slate-400">Only name, phone, and address are saved by the existing API. Additional fields are ready for future API support.</p>{error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update Customer' : 'Add Customer'}</button></div></form></CustomerModal>}
    {viewing && <CustomerModal title="Customer Details" onClose={() => setViewing(null)}><div className="p-6"><div className="flex items-center gap-4 border-b pb-5"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{initials(viewing.name)}</span><div><h2 className="text-xl font-bold text-slate-900">{viewing.name}</h2><p className="text-sm text-slate-500">{viewing.email || 'Email not provided'}</p></div></div><dl className="grid gap-4 py-5 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-slate-400">Phone</dt><dd>{viewing.phone}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Status</dt><dd>{viewing.status || 'Active'}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-400">Address</dt><dd>{viewing.address || 'Address not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Company</dt><dd>{viewing.company || 'Company not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Created</dt><dd>{dateLabel(viewing.createdAt)}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-400">Notes</dt><dd>{viewing.notes || 'No notes available'}</dd></div></dl><div className="flex justify-end gap-3 border-t pt-4"><a href={whatsapp(viewing)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">WhatsApp</a><button type="button" onClick={() => openEdit(viewing)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Edit Customer</button></div></div></CustomerModal>}
    {deleting && <CustomerModal title="Delete Customer?" onClose={() => !deletingCustomer && setDeleting(null)}><div className="p-6"><p className="text-sm text-slate-600">Are you sure you want to delete this customer? This action cannot be undone.</p><p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold">{deleting.name}</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deletingCustomer} onClick={() => setDeleting(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button type="button" disabled={deletingCustomer} onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{deletingCustomer ? 'Deleting...' : 'Delete Customer'}</button></div></div></CustomerModal>}
  </main>;
};

export default Customers;
