"use client";
import { useState, useEffect } from "react";
import {
  getTimesheets,
  clockIn,
  clockOut,
  updateTimeEntry,
  deleteTimeEntry,
  getActiveClockIn,
} from "@/services/Payroll";
import { calcHoursWorked, formatHours, formatCurrency } from "@/Utils/payrollCalculations";

const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY_EDIT = {
  clock_in: "",
  clock_out: "",
  task_id: "",
  project_id: "",
  notes: "",
};

export default function PayrollTimesheets() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null); // currently clocked-in entry

  // Filters
  const [dateFrom, setDateFrom] = useState(TODAY);
  const [dateTo, setDateTo] = useState(TODAY);
  const [userFilter, setUserFilter] = useState("");

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

  // Clock-in form
  const [clockInForm, setClockInForm] = useState({ task_id: "", project_id: "", notes: "" });
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Live clock for active entry
  const [liveElapsed, setLiveElapsed] = useState("");

  useEffect(() => {
    fetchEntries();
    fetchActiveClockIn();
  }, [dateFrom, dateTo, userFilter]);

  useEffect(() => {
    if (!activeEntry) { setLiveElapsed(""); return; }
    const interval = setInterval(() => {
      setLiveElapsed(formatHours(calcHoursWorked(activeEntry.clock_in, new Date())));
    }, 30000);
    setLiveElapsed(formatHours(calcHoursWorked(activeEntry.clock_in, new Date())));
    return () => clearInterval(interval);
  }, [activeEntry]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await getTimesheets({
        date_from: dateFrom,
        date_to: dateTo,
        user: userFilter || undefined,
      });
      setEntries(res?.data?.items || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchActiveClockIn() {
    try {
      // Try to get the logged-in user's active clock-in
      // User id comes from localStorage token; use "me" as placeholder
      const res = await getActiveClockIn("me");
      setActiveEntry(res?.data || null);
    } catch (e) {
      setActiveEntry(null);
    }
  }

  async function handleClockIn() {
    setClockingIn(true);
    try {
      const res = await clockIn(clockInForm);
      setActiveEntry(res?.data || null);
      setClockInForm({ task_id: "", project_id: "", notes: "" });
      fetchEntries();
    } catch (e) {
      console.error(e);
    } finally {
      setClockingIn(false);
    }
  }

  async function handleClockOut() {
    if (!activeEntry) return;
    setClockingOut(true);
    try {
      await clockOut(activeEntry.id, { notes: activeEntry.notes || "" });
      setActiveEntry(null);
      fetchEntries();
    } catch (e) {
      console.error(e);
    } finally {
      setClockingOut(false);
    }
  }

  const openEdit = (entry) => {
    setEditTarget(entry);
    setEditForm({
      clock_in: entry.clock_in ? new Date(entry.clock_in).toISOString().slice(0, 16) : "",
      clock_out: entry.clock_out ? new Date(entry.clock_out).toISOString().slice(0, 16) : "",
      task_id: entry.task_id || "",
      project_id: entry.project_id || "",
      notes: entry.notes || "",
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateTimeEntry(editTarget.id, {
        ...editForm,
        clock_in: editForm.clock_in ? new Date(editForm.clock_in).toISOString() : undefined,
        clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : undefined,
      });
      setEditTarget(null);
      fetchEntries();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTimeEntry(deleteTarget.id);
      setDeleteTarget(null);
      fetchEntries();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  // Aggregate total hours for the filtered view
  const totalFilteredHours = entries.reduce(
    (sum, e) => sum + calcHoursWorked(e.clock_in, e.clock_out),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Timesheets</h1>
          <p className="text-sm text-gray-100 opacity-80 mt-0.5">
            Track check-in / check-out times and daily working hours
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg px-4 py-2 text-sm text-gray-100">
          Total:{" "}
          <span className="font-bold text-primary">{formatHours(totalFilteredHours)}</span>{" "}
          across {entries.length} entries
        </div>
      </div>

      {/* Active Clock-In Banner */}
      {activeEntry ? (
        <div className="alert alert-success rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold">You are currently clocked in</p>
            <p className="text-sm opacity-80">
              Since {new Date(activeEntry.clock_in).toLocaleTimeString()} — elapsed:{" "}
              <strong>{liveElapsed}</strong>
              {activeEntry.project_id && ` · Project: ${activeEntry.project_id}`}
              {activeEntry.task_id && ` · Task: ${activeEntry.task_id}`}
            </p>
          </div>
          <button
            className="btn btn-sm btn-error"
            onClick={handleClockOut}
            disabled={clockingOut}
          >
            {clockingOut ? "Clocking Out..." : "Clock Out"}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-gray-100 mb-3">Clock In</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label text-xs text-gray-100 mr-3">Project (optional) </label>
              <input
                type="text"
                placeholder="Project ID"
                className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-36"
                value={clockInForm.project_id}
                onChange={(e) =>
                  setClockInForm({ ...clockInForm, project_id: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label text-xs text-gray-100 mr-3">Task (optional) </label>
              <input
                type="text"
                placeholder="Task ID"
                className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-36"
                value={clockInForm.task_id}
                onChange={(e) =>
                  setClockInForm({ ...clockInForm, task_id: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label text-xs text-gray-100 mr-3">Notes </label>
              <input
                type="text"
                placeholder="Optional notes"
                className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-48"
                value={clockInForm.notes}
                onChange={(e) =>
                  setClockInForm({ ...clockInForm, notes: e.target.value })
                }
              />
            </div>
            <button
              className="btn btn-sm btn-success"
              onClick={handleClockIn}
              disabled={clockingIn}
            >
              {clockingIn ? "Clocking In..." : "Clock In Now"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <div>
          <label className="label text-xs text-gray-100 opacity-60">From</label>
          <input
            type="date"
            className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="label text-xs text-gray-100">To</label>
          <input
            type="date"
            className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className="label text-xs text-gray-100 mr-3">Employee</label>
          <input
            type="text"
            placeholder="Search by name..."
            className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-44"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
        <button className="btn btn-sm btn-ghost text-gray-100" onClick={fetchEntries}>
          Refresh
        </button>
      </div>

      {/* Entries Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-100">Loading timesheet entries...</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-gray-100">
            <p className="text-4xl mb-3">🕐</p>
            <p>No time entries for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-100 opacity-60 text-xs">
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Project</th>
                  <th>Task</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const hours = calcHoursWorked(e.clock_in, e.clock_out);
                  const isActive = !e.clock_out;
                  return (
                    <tr key={e.id} className={`hover:bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900-hover ${isActive ? "bg-success/5" : ""}`}>
                      <td>
                        <div className="text-gray-100 font-medium">{e.user_name || "—"}</div>
                      </td>
                      <td className="text-gray-100 text-xs">
                        {e.clock_in
                          ? new Date(e.clock_in).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-gray-100 text-xs">
                        {e.clock_in
                          ? new Date(e.clock_in).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="text-gray-100 text-xs">
                        {isActive ? (
                          <span className="badge badge-success badge-xs">Active</span>
                        ) : e.clock_out ? (
                          new Date(e.clock_out).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`font-medium text-sm ${
                            hours > 8 ? "text-warning" : "text-gray-100"
                          }`}
                        >
                          {isActive ? "—" : formatHours(hours)}
                        </span>
                        {hours > 8 && !isActive && (
                          <span className="badge badge-warning badge-xs ml-1">OT</span>
                        )}
                      </td>
                      <td className="text-gray-100 text-xs">{e.project_name || e.project_id || "—"}</td>
                      <td className="text-gray-100 text-xs">{e.task_title || e.task_id || "—"}</td>
                      <td className="text-gray-100 text-xs max-w-32 truncate" title={e.notes}>
                        {e.notes || "—"}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-xs btn-ghost text-gray-100"
                            onClick={() => openEdit(e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-xs btn-ghost text-error"
                            onClick={() => setDeleteTarget(e)}
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="text-gray-100 font-semibold border-t border-base-300">
                  <td colSpan={4} className="text-right pr-2 opacity-60 text-xs">
                    Total for period:
                  </td>
                  <td className="text-primary">{formatHours(totalFilteredHours)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-md">
            <h3 className="font-bold text-lg text-gray-100 mb-4">Edit Time Entry</h3>
            <p className="text-xs text-gray-100 opacity-50 mb-3">
              Admin override — changes are logged.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Clock In</label>
                  <input
                    type="datetime-local"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={editForm.clock_in}
                    onChange={(e) => setEditForm({ ...editForm, clock_in: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Clock Out</label>
                  <input
                    type="datetime-local"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={editForm.clock_out}
                    onChange={(e) =>
                      setEditForm({ ...editForm, clock_out: e.target.value })
                    }
                  />
                </div>
              </div>

              {editForm.clock_in && editForm.clock_out && (
                <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg px-3 py-2 border border-base-300 text-sm text-gray-100">
                  Computed hours:{" "}
                  <strong>
                    {formatHours(
                      calcHoursWorked(
                        new Date(editForm.clock_in),
                        new Date(editForm.clock_out)
                      )
                    )}
                  </strong>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Project ID</label>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={editForm.project_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, project_id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Task ID</label>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={editForm.task_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, task_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs text-gray-100 opacity-70">Notes</label>
                <textarea
                  className="textarea textarea-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 text-sm"
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditTarget(null)} />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Time Entry?</h3>
            <p className="text-sm text-gray-100 opacity-70 mt-2">
              This will permanently remove the time entry for{" "}
              <strong>{deleteTarget.user_name}</strong> on{" "}
              {deleteTarget.clock_in
                ? new Date(deleteTarget.clock_in).toLocaleDateString()
                : "unknown date"}
              . This cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
