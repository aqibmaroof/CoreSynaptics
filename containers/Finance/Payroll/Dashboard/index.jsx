"use client";
import { useState, useEffect } from "react";
import { getPayrollDashboardStats, getPayrollRuns } from "@/services/Payroll";
import { formatCurrency, formatHours } from "@/Utils/payrollCalculations";
import Link from "next/link";

const PERIOD_OPTIONS = ["This Month", "Last Month", "This Quarter", "This Year"];

const STATUS_BADGE = {
  DRAFT: "badge-warning",
  APPROVED: "badge-info",
  PAID: "badge-success",
  VOID: "badge-error",
};

export default function PayrollDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [period, setPeriod] = useState("This Month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [period]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [statsRes, runsRes] = await Promise.all([
        getPayrollDashboardStats({ period }),
        getPayrollRuns({ limit: 6, sort: "created_at:desc" }),
      ]);
      setStats(statsRes?.data || null);
      setRecentRuns(runsRes?.data?.items || runsRes?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const kpiCards = [
    {
      label: "Total Payroll Cost",
      value: formatCurrency(stats?.total_cost ?? 0),
      sub: `${period}`,
      color: "text-primary",
    },
    {
      label: "Active Employees",
      value: stats?.active_employees ?? "—",
      sub: "On payroll",
      color: "text-success",
    },
    {
      label: "Total Hours Logged",
      value: formatHours(stats?.total_hours ?? 0),
      sub: `${period}`,
      color: "text-info",
    },
    {
      label: "Pending Payments",
      value: formatCurrency(stats?.pending_amount ?? 0),
      sub: `${stats?.pending_count ?? 0} run(s) pending`,
      color: "text-warning",
    },
    {
      label: "Avg. Cost / Employee",
      value: formatCurrency(stats?.avg_cost_per_employee ?? 0),
      sub: `${period}`,
      color: "text-secondary",
    },
    {
      label: "Overtime Hours",
      value: formatHours(stats?.overtime_hours ?? 0),
      sub: "This period",
      color: "text-error",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-gray-200 font-bold">Payroll Dashboard</h1>
          <p className="text-sm text-gray-300 opacity-60 mt-0.5">
            Overview of payroll costs, hours, and run history
          </p>
        </div>
        <div className="flex items-center gap-3 ">
          <select
            className="select select-sm select-bordered text-gray-100"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Link
            href="/Finance/Payroll/PayrollProcessing"
            className="btn btn-sm btn-primary"
          >
            + New Payroll Run
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 animate-pulse h-24" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpiCards.map((card) => (
            <div key={card.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-100 opacity-50 uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-100 opacity-40 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Employees", href: "/Finance/Payroll/Employees", emoji: "👥" },
          { label: "Timesheets", href: "/Finance/Payroll/Timesheets", emoji: "🕐" },
          { label: "Payroll Runs", href: "/Finance/Payroll/PayrollProcessing", emoji: "💳" },
          { label: "Finance Overview", href: "/Finance/Dashboard", emoji: "📊" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 flex items-center gap-3 hover:opacity-80 transition-opacity shadow-sm"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium text-gray-300 text-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Payroll Runs */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <h2 className="font-semibold text-gray-300">Recent Payroll Runs</h2>
          <Link
            href="/Finance/Payroll/PayrollProcessing"
            className="text-xs text-info hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-100 ">Loading...</div>
        ) : recentRuns.length === 0 ? (
          <div className="p-10 text-center text-gray-100">
            <p className="text-4xl mb-3">💳</p>
            <p>No payroll runs yet.</p>
            <Link
              href="/Finance/Payroll/PayrollProcessing"
              className="btn btn-sm btn-info rounded-xl mt-4"
            >
              Generate First Run
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-100 opacity-60 text-xs">
                  <th>Period</th>
                  <th>Frequency</th>
                  <th>Employees</th>
                  <th>Gross Pay</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Generated</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-700">
                    <td className="text-gray-300 font-medium">
                      {run.period_label || `${run.period_start} – ${run.period_end}`}
                    </td>
                    <td className="text-gray-300 capitalize">{run.frequency}</td>
                    <td className="text-gray-300">{run.employee_count}</td>
                    <td className="text-gray-300 font-medium">{formatCurrency(run.total_gross)}</td>
                    <td className="text-gray-300 font-medium text-success">
                      {formatCurrency(run.total_net)}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${STATUS_BADGE[run.status] || "badge-ghost"}`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="text-gray-100 opacity-60 text-xs">
                      {run.created_at
                        ? new Date(run.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employment Type Breakdown */}
      {stats?.by_type && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Permanent Employees",
              data: stats.by_type.permanent,
              color: "bg-primary",
              emoji: "🏢",
            },
            {
              label: "Hourly Workers",
              data: stats.by_type.hourly,
              color: "bg-secondary",
              emoji: "⏱️",
            },
          ].map((t) => (
            <div key={t.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{t.emoji}</span>
                <h3 className="font-semibold text-gray-100">{t.label}</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-100">
                <div className="flex justify-between">
                  <span className="opacity-60">Count</span>
                  <span className="font-medium">{t.data?.count ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Total Cost</span>
                  <span className="font-medium">{formatCurrency(t.data?.total_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Avg. Pay</span>
                  <span className="font-medium">{formatCurrency(t.data?.avg_pay)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
