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

const HomePage = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);
  const [checklistData, setChecklistData] = useState(null);
  const [phaseDistData, setPhaseDistData] = useState(null);
  const [tradeItemsData, setTradeItemsData] = useState(null);
  const [priorityTasksData, setPriorityTasksData] = useState(null);

  // Initialize dashboard based on user role
  useEffect(() => {
    const userData = getUser();
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Get user role - could be from user.role, user.userType, or organization
      const userRole = parsedUser?.role?.toLowerCase() || "default";

      // Load all dashboard data based on role
      setTimeout(() => {
        setDashboardConfig(getDashboardConfig(userRole));
      }, 1000); // Simulate loading delay
      setChecklistData(getChecklistData(userRole));
      setPhaseDistData(getPhaseDistributionData(userRole));
      setTradeItemsData(getTradeItemsData(userRole));
      setPriorityTasksData(getPriorityTasksData(userRole));
    }
  }, []);

  // CTRL + K listener
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

  const handleClose = (val) => setOpen(val);

  if (!dashboardConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 justify- enter text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000" />
      </div>

      <div className="px-8 py-10 max-w-7xl mx-auto relative z-10">
        {/* Welcome Section */}
        <div className="mb-10 pb-8 border-b border-gradient-to-r from-slate-700 via-slate-600 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">👋</div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome, {user?.firstName || "Guest"}{" "}
                    {user?.lastName || "User"}
                  </h1>
                  <p className="text-gray-400 text-sm mt-2">
                    <span className="inline-block px-3 py-1 capitalize rounded-full bg-slate-800/50 border border-slate-700/50 mr-3">
                      🔹{" "}
                      {user?.role ||
                        user?.activeRole?.name.replace("_", " ") ||
                        "User"}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
                      🏢 {user?.organizationName || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-gray-400">System Status</div>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-400">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Gate Indicator */}
        <PhaseGateIndicator
          currentPhase={dashboardConfig.currentPhase}
          phases={dashboardConfig.phaseGates}
          alert={dashboardConfig.alert}
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Charts & Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Checklist Status */}
          {dashboardConfig.showChecklist && checklistData && (
            <ChecklistStatusCard data={checklistData} />
          )}

          {/* Phase Distribution */}
          {dashboardConfig.showPhaseDistribution && phaseDistData && (
            <PhaseDistributionCard data={phaseDistData} />
          )}

          {/* Trade Items */}
          {dashboardConfig.showTradeItems && tradeItemsData && (
            <TradeItemsCard data={tradeItemsData} />
          )}
        </div>

        {/* Priority Tasks */}
        {dashboardConfig.showPriorityTasks && priorityTasksData && (
          <PriorityTasksCard data={priorityTasksData} />
        )}

        {/* Footer Section */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all">
              <div className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </div>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-cyan-600/20 transition-all text-sm text-gray-300 hover:text-cyan-300 border border-slate-600/50 hover:border-cyan-500/50">
                  📊 View Reports
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-blue-600/20 transition-all text-sm text-gray-300 hover:text-blue-300 border border-slate-600/50 hover:border-blue-500/50">
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-green-600/20 transition-all text-sm text-gray-300 hover:text-green-300 border border-slate-600/50 hover:border-green-500/50">
                  ✓ Complete Tasks
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all">
              <div className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <span>🎯</span> System Status
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">API Status</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Database</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-cyan-400 font-semibold">30s ago</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all">
              <div className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Help & Support
              </div>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-purple-600/20 transition-all text-sm text-gray-300 hover:text-purple-300 border border-slate-600/50 hover:border-purple-500/50">
                  📖 Documentation
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-pink-600/20 transition-all text-sm text-gray-300 hover:text-pink-300 border border-slate-600/50 hover:border-pink-500/50">
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 backdrop-blur flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-4">
              <span>🔔 New updates available</span>
              <span className="text-gray-500">|</span>
              <span>Last synced: Just now</span>
            </div>
            <button className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-semibold transition-all">
              Update
            </button>
          </div>
        </div>
      </div>

      {open && <TailwindDialog open={open} setOpen={handleClose} />}
    </div>
  );
};

export default HomePage;
