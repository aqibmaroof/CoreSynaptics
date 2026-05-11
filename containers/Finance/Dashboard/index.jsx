"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getProjectFinancialList, getProjectFinancialSummary } from "@/services/Finance";
import { formatCurrency } from "@/Utils/payrollCalculations";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const QUICK_LINKS = [
  { label: "Contracts & Budget", href: "/Finance/Contracts", emoji: "📋" },
  { label: "Vendor Quotes", href: "/Finance/VendorQuotes", emoji: "🏷️" },
  { label: "Finance & Billing", href: "/Finance/Billing", emoji: "🧾" },
  { label: "Payments", href: "/Finance/BillingChain", emoji: "💳" },
  { label: "Procurement", href: "/Finance/Procurement", emoji: "📦" },
  { label: "Payroll", href: "/Finance/Payroll/Dashboard", emoji: "💰" },
];

const PROCUREMENT_STATUS_BADGE = {
  PLANNED: "badge-ghost",
  ORDERED: "badge-info",
  DELAYED: "badge-error",
  DELIVERED: "badge-success",
};

const INVOICE_STATUS_BADGE = {
  draft: "badge-ghost",
  pending: "badge-warning",
  paid: "badge-success",
  overdue: "badge-error",
};

function getTheme() {
  if (typeof document !== "undefined") {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
  return "dark";
}

export default function FinanceDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Detail drill-down
  const [detailProject, setDetailProject] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await getProjectFinancialList();
      setProjects(res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(project) {
    setDetailProject(project);
    setDetailData(null);
    setLoadingDetail(true);
    try {
      const res = await getProjectFinancialSummary(project.projectId);
      setDetailData(res?.data || null);
    } catch (e) { setDetailData(null); }
    finally { setLoadingDetail(false); }
  }

  function closeDetail() {
    setDetailProject(null);
    setDetailData(null);
  }

  // Aggregate KPIs across all projects
  const kpiTotals = projects.reduce(
    (acc, p) => ({
      contractValue: acc.contractValue + (p.totalContractValue || 0),
      invoiced: acc.invoiced + (p.totalInvoicedAmount || 0),
      paid: acc.paid + (p.totalPaidAmount || 0),
      outstanding: acc.outstanding + (p.outstandingAmount || 0),
      procurement: acc.procurement + (p.totalProcurementCost || 0),
      profit: acc.profit + (p.profitEstimate || 0),
    }),
    { contractValue: 0, invoiced: 0, paid: 0, outstanding: 0, procurement: 0, profit: 0 }
  );

  const kpis = [
    { label: "Total Contract Value", value: formatCurrency(kpiTotals.contractValue), color: "text-info", icon: "📋" },
    { label: "Total Invoiced", value: formatCurrency(kpiTotals.invoiced), color: "text-warning", icon: "🧾" },
    { label: "Total Paid", value: formatCurrency(kpiTotals.paid), color: "text-success", icon: "💳" },
    { label: "Outstanding", value: formatCurrency(kpiTotals.outstanding), color: "text-error", icon: "⏳" },
    { label: "Procurement Cost", value: formatCurrency(kpiTotals.procurement), color: "text-secondary", icon: "📦" },
    { label: "Est. Profit", value: formatCurrency(kpiTotals.profit), color: kpiTotals.profit >= 0 ? "text-success" : "text-error", icon: "📈" },
  ];

  // Bar chart: per-project Contract Value vs Procurement Cost vs Paid
  const isLight = theme === "light";
  const chartLabelColor = isLight ? "#3a5070" : "#94a3b8";
  const chartGridColor  = isLight ? "#c5d2ea" : "#334155";

  const chartLabels = projects.map((p) => p.projectId?.slice(0, 8) + "…" || "—");
  const chartOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "65%" } },
    colors: ["#6366f1", "#f59e0b", "#22d3ee"],
    xaxis: {
      categories: chartLabels,
      labels: { style: { colors: chartLabelColor, fontSize: "10px" }, rotate: -30 },
    },
    yaxis: {
      labels: {
        style: { colors: chartLabelColor },
        formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    legend: { labels: { colors: chartLabelColor } },
    grid: { borderColor: chartGridColor },
    tooltip: { theme: isLight ? "light" : "dark" },
    dataLabels: { enabled: false },
  };
  const chartSeries = [
    { name: "Contract Value", data: projects.map((p) => p.totalContractValue || 0) },
    { name: "Procurement Cost", data: projects.map((p) => p.totalProcurementCost || 0) },
    { name: "Paid", data: projects.map((p) => p.totalPaidAmount || 0) },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finance Dashboard</h1>
          <p className="text-sm text-gray-300 opacity-70 mt-0.5">
            Live financial summaries across all projects
          </p>
        </div>
        <Link href="/Finance/Billing" className="btn btn-sm btn-info">
          + New Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label}
            className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
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

      {/* Chart: Contract Value vs Procurement Cost vs Paid per project */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-100 mb-4">
          Contract Value vs Procurement vs Paid — By Project
        </h2>
        {!loading && projects.length > 0 ? (
          <Chart options={chartOptions} series={chartSeries} type="bar" height={240} />
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-500 text-sm">
            {loading ? "Loading chart..." : "No project data available."}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map((item) => (
          <Link key={item.label} href={item.href}
            className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity shadow-sm text-center">
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium text-gray-300 text-xs leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Project Financial Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-gray-100">Project Financial Overview</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-3xl mb-2">📊</p>
            <p>No financial data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Project ID</th>
                  <th>Contract Value</th>
                  <th>Invoiced</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Procurement</th>
                  <th>Est. Profit</th>
                  <th>Computed At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const profitNegative = p.profitEstimate != null && p.profitEstimate < 0;
                  return (
                    <tr key={p.projectId} className="hover:bg-slate-700">
                      <td className="text-gray-100 text-xs font-mono">{p.projectId}</td>
                      <td className="text-gray-100 font-medium">{formatCurrency(p.totalContractValue)}</td>
                      <td className="text-gray-300">{formatCurrency(p.totalInvoicedAmount)}</td>
                      <td className="text-success">{formatCurrency(p.totalPaidAmount)}</td>
                      <td className={p.outstandingAmount > 0 ? "text-warning" : "text-gray-400"}>
                        {formatCurrency(p.outstandingAmount)}
                      </td>
                      <td className="text-gray-300">{formatCurrency(p.totalProcurementCost)}</td>
                      <td className={profitNegative ? "text-error font-medium" : "text-success font-medium"}>
                        {p.profitEstimate != null ? formatCurrency(p.profitEstimate) : "—"}
                      </td>
                      <td className="text-gray-500 text-xs">
                        {p.computedAt ? new Date(p.computedAt).toLocaleString() : "—"}
                      </td>
                      <td>
                        <button className="btn btn-xs btn-ghost text-info"
                          onClick={() => openDetail(p)}>
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailProject && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-2xl">
            <h3 className="font-bold text-lg text-gray-100 mb-1">Project Financial Summary</h3>
            <p className="text-xs text-gray-400 font-mono mb-5">{detailProject.projectId}</p>

            {loadingDetail ? (
              <div className="p-6 text-center text-gray-400">Loading summary...</div>
            ) : !detailData ? (
              <div className="p-6 text-center text-gray-500">No data available.</div>
            ) : (
              <div className="space-y-5">
                {/* Top-line numbers */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Contract Value", value: formatCurrency(detailData.totalContractValue), sub: `${detailData.activeContractCount} active contract(s)`, color: "text-info" },
                    { label: "Approved Quotes", value: formatCurrency(detailData.totalApprovedQuoteAmount), sub: `${detailData.approvedQuoteCount} approved quote(s)`, color: "text-secondary" },
                    { label: "Total Paid", value: formatCurrency(detailData.totalPaidAmount), sub: "SUCCESS payments", color: "text-success" },
                    { label: "Outstanding", value: formatCurrency(detailData.outstandingAmount), sub: "Receivables owed", color: detailData.outstandingAmount > 0 ? "text-warning" : "text-gray-400" },
                    { label: "Procurement Cost", value: formatCurrency(detailData.totalProcurementCost), sub: "All items", color: "text-gray-300" },
                    { label: "Est. Profit", value: detailData.profitEstimate != null ? formatCurrency(detailData.profitEstimate) : "—", sub: "Contract − Procurement − Invoices", color: detailData.profitEstimate >= 0 ? "text-success" : "text-error" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Invoice breakdown */}
                {detailData.invoices && (
                  <div className="bg-slate-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Invoice Breakdown</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { label: "Total", value: detailData.invoices.total },
                        { label: "Draft", value: detailData.invoices.draft },
                        { label: "Pending", value: detailData.invoices.pending },
                        { label: "Paid", value: detailData.invoices.paid },
                        { label: "Overdue", value: detailData.invoices.overdue },
                      ].map((iv) => (
                        <div key={iv.label} className="text-center">
                          <span className={`badge badge-sm mb-1 ${INVOICE_STATUS_BADGE[iv.label.toLowerCase()] || "badge-ghost"}`}>
                            {iv.label}
                          </span>
                          <p className="text-gray-100 text-sm font-medium">{formatCurrency(iv.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Procurement by status */}
                {detailData.procurementByStatus && (
                  <div className="bg-slate-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Procurement by Status</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(detailData.procurementByStatus).map(([status, amount]) => (
                        <div key={status} className="text-center">
                          <span className={`badge badge-sm mb-1 ${PROCUREMENT_STATUS_BADGE[status] || "badge-ghost"}`}>
                            {status}
                          </span>
                          <p className="text-gray-100 text-sm font-medium">{formatCurrency(amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-right">
                  Computed at: {detailData.computedAt ? new Date(detailData.computedAt).toLocaleString() : "—"}
                </p>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={closeDetail}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeDetail} />
        </div>
      )}
    </div>
  );
}
