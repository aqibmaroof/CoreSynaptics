"use client";
import { useState, useEffect } from "react";
import TailwindDialog from "../../components/common/Modals/SearchModal";
import { getUser } from "../../services/instance/tokenService";
import PhaseGateIndicator from "../../components/Cards/PhaseGateIndicator";
import MetricsCard from "../../components/Cards/MetricsCard";
import ChecklistStatusCard from "../../components/Cards/ChecklistStatusCard";
import PhaseDistributionCard from "../../components/Cards/PhaseDistributionCard";
import TradeItemsCard from "../../components/Cards/TradeItemsCard";
import PriorityTasksCard from "../../components/Cards/PriorityTasksCard";
import {
  getDashboardConfig,
  getChecklistData,
  getPhaseDistributionData,
  getTradeItemsData,
  getPriorityTasksData,
} from "../../Utils/dashboardConfig.js";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const HomePage = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);
  const [checklistData, setChecklistData] = useState(null);
  const [phaseDistData, setPhaseDistData] = useState(null);
  const [tradeItemsData, setTradeItemsData] = useState(null);
  const [priorityTasksData, setPriorityTasksData] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      if (t) setTheme(t);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const userRole = parsedUser?.role?.toLowerCase() || "default";
      setTimeout(() => setDashboardConfig(getDashboardConfig(userRole)), 1000);
      setChecklistData(getChecklistData(userRole));
      setPhaseDistData(getPhaseDistributionData(userRole));
      setTradeItemsData(getTradeItemsData(userRole));
      setPriorityTasksData(getPriorityTasksData(userRole));
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDark = theme === "dark";

  if (!dashboardConfig) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--rf-bg)" }}
      >
        <div
          className="flex items-center gap-3 text-sm font-medium"
          style={{ color: "var(--rf-txt2)" }}
        >
          <span
            className={`w-4 h-4 rounded-full border-2 animate-spin ${
              isDark
                ? "border-cyan-500 border-t-transparent"
                : "border-sky-600 border-t-transparent"
            }`}
          />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--rf-bg)", color: "var(--rf-txt)" }}
    >
      {/* Subtle background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl ${
            isDark ? "bg-cyan-900/20" : "bg-sky-200/40"
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${
            isDark ? "bg-blue-900/20" : "bg-blue-100/50"
          }`}
        />
      </div>

      <div className="px-8 py-8 mx-auto relative z-10">
        {/* ── Welcome Header ─────────────────────────────────────────── */}
        <div
          className="mb-8 pb-6 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--rf-border)" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--rf-txt3)" }}
            >
              {getGreeting()}
            </p>
            <h1
              className={`text-3xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {user?.firstName || "Guest"}{" "}
              <span
                className={isDark ? "text-cyan-400" : "text-sky-600"}
              >
                {user?.lastName || ""}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                  isDark
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {user?.activeRole?.name?.replace(/_/g, " ") ||
                  user?.role?.replace(/_/g, " ") ||
                  "User"}
              </span>
              {user?.organizationName && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isDark
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {user.organizationName}
                </span>
              )}
            </div>
          </div>

          {/* System Status */}
          <div
            className={`hidden md:flex flex-col items-end gap-1 px-5 py-3 rounded-xl border ${
              isDark
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--rf-txt3)" }}
            >
              System Status
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">
                All Systems Operational
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--rf-txt3)" }}>
              Last synced: Just now
            </span>
          </div>
        </div>

        {/* ── Phase Gate ─────────────────────────────────────────────── */}
        {/* <PhaseGateIndicator
          currentPhase={dashboardConfig.currentPhase}
          phases={dashboardConfig.phaseGates}
          alert={dashboardConfig.alert}
        /> */}

        {/* ── Metrics Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardConfig.metrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              color={metric.color}
            />
          ))}
        </div>

        {/* ── Charts & Status Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {dashboardConfig.showChecklist && checklistData && (
            <ChecklistStatusCard data={checklistData} />
          )}
          {dashboardConfig.showPhaseDistribution && phaseDistData && (
            <PhaseDistributionCard data={phaseDistData} />
          )}
          {dashboardConfig.showTradeItems && tradeItemsData && (
            <TradeItemsCard data={tradeItemsData} />
          )}
        </div>

        {/* ── Priority Tasks ─────────────────────────────────────────── */}
        {dashboardConfig.showPriorityTasks && priorityTasksData && (
          <PriorityTasksCard data={priorityTasksData} />
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          className="mt-10 pt-6"
          style={{ borderTop: "1px solid var(--rf-border)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Quick Actions */}
            <div
              className={`rounded-xl p-5 transition-all ${
                isDark
                  ? "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                style={{ color: "var(--rf-txt3)" }}
              >
                <span>⚡</span> Quick Actions
              </p>
              <div className="space-y-2">
                {[
                  { icon: "📊", label: "View Reports" },
                  { icon: "⚙️", label: "Settings" },
                  { icon: "✓", label: "Complete Tasks" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div
              className={`rounded-xl p-5 transition-all ${
                isDark
                  ? "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                style={{ color: "var(--rf-txt3)" }}
              >
                <span>🎯</span> System Status
              </p>
              <div className="space-y-3">
                {[
                  { label: "API Status", status: "Operational", ok: true },
                  { label: "Database", status: "Healthy", ok: true },
                  { label: "Last Update", status: "30s ago", ok: null },
                ].map(({ label, status, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--rf-txt2)" }}>{label}</span>
                    {ok !== null ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {status}
                      </span>
                    ) : (
                      <span
                        className="font-semibold"
                        style={{ color: "var(--rf-accent)" }}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Help & Support */}
            <div
              className={`rounded-xl p-5 transition-all ${
                isDark
                  ? "bg-slate-900 border border-slate-800 hover:border-slate-700"
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                style={{ color: "var(--rf-txt3)" }}
              >
                <span>💡</span> Help & Support
              </p>
              <div className="space-y-2">
                {[
                  { icon: "📖", label: "Documentation" },
                  { icon: "💬", label: "Contact Support" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom info bar */}
          <div
            className={`px-5 py-3 rounded-xl flex items-center justify-between text-xs ${
              isDark
                ? "bg-slate-900 border border-slate-800"
                : "bg-white border border-slate-200 shadow-sm"
            }`}
          >
            <div
              className="flex items-center gap-4"
              style={{ color: "var(--rf-txt2)" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                New updates available
              </span>
              <span style={{ color: "var(--rf-txt3)" }}>·</span>
              <span>Last synced: Just now</span>
            </div>
            <button
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isDark
                  ? "bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60 border border-cyan-800"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200"
              }`}
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {open && <TailwindDialog open={open} setOpen={(v) => setOpen(v)} />}
    </div>
  );
};

export default HomePage;
