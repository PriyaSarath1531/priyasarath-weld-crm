import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DATA_REFRESH_EVENT = 'crm:data-updated';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalJobs: 0,
    activeQuotes: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    profit: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, jobsRes, quotationsRes, financeRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/jobs'),
          axios.get('/api/quotations'),
          axios.get(`/api/finance/summary/${new Date().getFullYear()}/${new Date().getMonth() + 1}`),
        ]);

        setStats({
          totalCustomers: customersRes.data.length || 0,
          totalJobs: jobsRes.data.length || 0,
          activeQuotes: quotationsRes.data.length || 0,
          monthlyIncome: financeRes.data.totalIncome || 0,
          monthlyExpenses: financeRes.data.totalExpenses || 0,
          profit: financeRes.data.profit || 0,
        });
      } catch (error) {
        console.error('Dashboard summary fetch failed:', error);
      }
    };

    fetchStats();

    const handleRefresh = () => {
      fetchStats();
    };

    window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: 'Customers', value: stats.totalCustomers, tone: 'bg-blue-100 text-blue-700' },
      { label: 'Jobs', value: stats.totalJobs, tone: 'bg-violet-100 text-violet-700' },
      { label: 'Quotations', value: stats.activeQuotes, tone: 'bg-cyan-100 text-cyan-700' },
      { label: 'Monthly Profit', value: formatCurrency(stats.profit), tone: 'bg-emerald-100 text-emerald-700' },
    ],
    [stats],
  );

  return (
    <div className="bg-[#dfe0e0] p-4 sm:p-6">
      <div className="mx-auto max-w-[1360px] rounded-[30px] border border-slate-200 bg-[#f2f2f1] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <header className="mb-6 flex items-center justify-center py-2">
          <h2 className="text-center text-[80px] font-semibold tracking-tight text-slate-800 md:text-[30px]">
            Sri Vinayaga Engineering Works
          </h2>
        </header>

        <main className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className={`rounded-2xl border border-slate-200 p-5 shadow-sm ${card.tone}`}>
                <div className="text-sm font-medium uppercase tracking-[0.12em]">{card.label}</div>
                <div className="mt-3 text-3xl font-bold">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">Monthly Income</div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyIncome)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">Monthly Expenses</div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyExpenses)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">Net Profit</div>
              <div className="mt-3 text-2xl font-bold text-emerald-700">{formatCurrency(stats.profit)}</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;