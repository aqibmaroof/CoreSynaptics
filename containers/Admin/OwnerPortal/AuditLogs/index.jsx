"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs } from "@/services/Admin";

const ACTION_COLORS = {
  CREATE: "bg-green-500/20 text-green-300",
  UPDATE: "bg-blue-500/20 text-blue-300",
  DELETE: "bg-red-500/20 text-red-300",
  LOGIN:  "bg-cyan-500/20 text-cyan-300",
  LOGOUT: "bg-gray-600/40 text-gray-400",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const PAGE_SIZE = 50;

  const fetchLogs = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = {
        page: reset ? 1 : page,
        limit: PAGE_SIZE,
      };
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entityType = filterEntity;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + "T23:59:59").toISOString();

      const res = await getAuditLogs(params);
      const data = Array.isArray(res) ? res : res?.data || [];
      if (reset) {
        setLogs(data);
        setPage(1);
      } else {
        setLogs((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, filterEntity, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs(true);
  }, [filterAction, filterEntity, dateFrom, dateTo]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
    fetchLogs(false);
  };

  const displayedLogs = search
    ? logs.filter((l) =>
        (l.entityType || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.performedBy || l.userId || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const uniqueEntities = [...new Set(logs.map((l) => l.entityType).filter(Boolean))];

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 text-sm mt-1">Complete history of all platform actions</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex flex-wrap gap-3">
        <input type="text" placeholder="Search logs..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 w-52" />

        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); }}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Actions</option>
          {["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Entities</option>
          {uniqueEntities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>

        <button
          onClick={() => { setSearch(""); setFilterAction(""); setFilterEntity(""); setDateFrom(""); setDateTo(""); }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
          Reset
        </button>

        <span className="ml-auto text-xs text-gray-500 self-center">
          {displayedLogs.length} log{displayedLogs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No audit logs found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    {["Timestamp", "Action", "Entity", "Entity ID", "Performed By", "Description"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || "bg-gray-600/40 text-gray-300"}`}>
                          {log.action || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-sm">{log.entityType || "—"}</td>
                      <td className="px-6 py-3 text-gray-600 text-xs font-mono">{log.entityId ? log.entityId.slice(0, 8) + "…" : "—"}</td>
                      <td className="px-6 py-3 text-gray-400 text-sm">{log.performedBy || log.userId || "—"}</td>
                      <td className="px-6 py-3 text-gray-400 text-sm max-w-xs truncate" title={log.description}>{log.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="px-6 py-4 border-t border-gray-700/50 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50">
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
