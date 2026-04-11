"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  getFinanceDashboardStats,
  getMonthlySpend,
  getBudgetVsActual,
  getRecentTransactions,
} from "@/services/Finance/Procurement";
import { formatCurrency } from "@/Utils/payrollCalculations";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const STATUS_BADGE = {
  Paid: "badge-success",
  Pending: "badge-warning",
  Overdue: "badge-error",
  Draft: "badge-ghost",
};

const QUICK_LINKS = [
  { label: "Contracts & Budget", href: "/Finance/Contracts", emoji: "📋" },
  { label: "Vendor Quotes", href: "/Finance/VendorQuotes", emoji: "🏷️" },
  { label: "Finance & Billing", href: "/Finance/Billing", emoji: "🧾" },
  { label: "Billing Chain", href: "/Finance/BillingChain", emoji: "🔗" },
  { label: "Procurement", href: "/Finance/Procurement", emoji: "📦" },
  { label: "Payroll", href: "/Finance/Payroll/Dashboard", emoji: "💰" },
];

export default function FinanceDashboard() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [bva, setBva] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("This Month");

  useEffect(() => {
    fetchAll();
  }, [period]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, m, b, t] = await Promise.all([
        getFinanceDashboardStats({ period }),
        getMonthlySpend({ period }),
        getBudgetVsActual({ period }),
        getRecentTransactions({ limit: 8 }),
      ]);
      setStats(s?.data || null);
      setMonthly(m?.data || []);
      setBva(b?.data || []);
      setTransactions(t?.data?.items || t?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Chart: Monthly spend
  const monthlyChartOptions = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    colors: ["#22d3ee"],
    xaxis: {
      categories: monthly.map((m) => m.month || m.label || ""),
      labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8" },
        formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    grid: { borderColor: "#334155" },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false },
  };
  const monthlyChartSeries = [
    { name: "Spend", data: monthly.map((m) => m.amount || 0) },
  ];

  // Chart: Budget vs Actual (bar)
  const bvaChartOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: ["#6366f1", "#22d3ee"],
    xaxis: {
      categories: bva.map((b) => b.project || b.label || ""),
      labels: { style: { colors: "#94a3b8", fontSize: "11px" }, rotate: -30 },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8" },
        formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    legend: { labels: { colors: "#94a3b8" } },
    grid: { borderColor: "#334155" },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false },
  };
  const bvaChartSeries = [
    { name: "Budget", data: bva.map((b) => b.budget || 0) },
    { name: "Actual", data: bva.map((b) => b.actual || 0) },
  ];

  const kpis = [
    {
      label: "Total Budget",
      value: formatCurrency(stats?.total_budget ?? 0),
      color: "text-info",
      icon: "📋",
    },
    {
      label: "Spent Amount",
      value: formatCurrency(stats?.spent_amount ?? 0),
      color: "text-warning",
      icon: "💸",
    },
    {
      label: "Remaining Budget",
      value: formatCurrency(stats?.remaining_budget ?? 0),
      color: "text-success",
      icon: "💰",
    },
    {
      label: "Pending Invoices",
      value: stats?.pending_invoices ?? "—",
      color: "text-error",
      icon: "🧾",
    },
    {
      label: "Active Contracts",
      value: stats?.active_contracts ?? "—",
      color: "text-secondary",
      icon: "📝",
    },
    {
      label: "Open Procurements",
      value: stats?.open_procurements ?? "—",
      color: "text-primary",
      icon: "📦",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finance Dashboard</h1>
          <p className="text-sm text-gray-300 opacity-70 mt-0.5">
            Budgets, billing, procurement, and payroll at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select select-sm select-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {["This Month", "Last Month", "This Quarter", "This Year"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Link href="/Finance/Billing" className="btn btn-sm btn-info">
            + New Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider">{k.label}</p>
              <span className="text-xl">{k.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>
              {loading ? "..." : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-100 mb-4">Monthly Spend</h2>
          {monthly.length > 0 ? (
            <Chart
              options={monthlyChartOptions}
              series={monthlyChartSeries}
              type="area"
              height={220}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Loading chart..." : "No spend data available."}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-100 mb-4">Budget vs Actual</h2>
          {bva.length > 0 ? (
            <Chart
              options={bvaChartOptions}
              series={bvaChartSeries}
              type="bar"
              height={220}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Loading chart..." : "No project data available."}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity shadow-sm text-center"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium text-gray-300 text-xs leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-gray-100">Recent Transactions</h2>
          <Link href="/Finance/Billing" className="text-xs text-info hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-3xl mb-2">🧾</p>
            <p>No recent transactions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Invoice #</th>
                  <th>Project</th>
                  <th>Vendor / Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700">
                    <td className="text-gray-100 font-mono text-xs">{t.invoice_number}</td>
                    <td className="text-gray-300 text-xs">{t.project_name || "—"}</td>
                    <td className="text-gray-300 text-xs">{t.party_name || "—"}</td>
                    <td className="text-gray-100 font-medium">{formatCurrency(t.amount)}</td>
                    <td className="text-gray-400 text-xs">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <span className={`badge badge-xs ${STATUS_BADGE[t.status] || "badge-ghost"}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
