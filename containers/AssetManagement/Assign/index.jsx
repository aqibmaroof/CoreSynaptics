"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssetById, assignAsset } from "@/services/AssetManagement";
import { getUsers } from "@/services/Users";

const today = () => new Date().toISOString().split("T")[0];

const STATUS_STYLES = {
  IN_STOCK:  "bg-green-900/30 text-green-300 border-green-500/30",
  ASSIGNED:  "bg-blue-900/30 text-blue-300 border-blue-500/30",
  IN_REPAIR: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  DAMAGED:   "bg-orange-900/30 text-orange-300 border-orange-500/30",
  RETIRED:   "bg-gray-800/60 text-gray-400 border-gray-600/30",
  LOST:      "bg-red-900/30 text-red-300 border-red-500/30",
};

const INPUT = "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const FL = ({ children, required, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {hint && <p className="text-gray-600 text-xs mb-1">{hint}</p>}
  </div>
);

export default function AssetAssign({ assetId }) {
  const router = useRouter();

  const [asset, setAsset]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState(null);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({
    assigned_to_user_id:  "",
    assigned_date:        today(),
    expected_return_date: "",
    notes:                "",
  });

  useEffect(() => {
    if (!assetId) return;
    setFetching(true);
    Promise.all([
      getAssetById(assetId),
      getUsers().catch(() => []),
    ])
      .then(([assetRes, usersRes]) => {
        const d = assetRes?.data ?? assetRes;
        setAsset(d);
        const allUsers = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
        setUsers(allUsers);
      })
      .catch(() => setFetchError("Failed to load asset."))
      .finally(() => setFetching(false));
  }, [assetId]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.assigned_to_user_id) e.assigned_to_user_id = "Select a user to assign to";
    if (!form.assigned_date)       e.assigned_date        = "Assigned date is required";
    if (form.expected_return_date && form.expected_return_date < form.assigned_date)
      e.expected_return_date = "Return date must be on or after the assigned date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await assignAsset(assetId, {
        assigned_to_user_id:  form.assigned_to_user_id,
        assigned_date:        form.assigned_date,
        expected_return_date: form.expected_return_date || undefined,
        notes:                form.notes || undefined,
      });
      setMsg({ type: "success", text: "Asset assigned successfully" });
      setTimeout(() => router.push("/Assets/Assignments"), 1500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to assign asset" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading asset...
        </div>
      </div>
    );
  }

  if (fetchError || !asset) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{fetchError ?? "Asset not found"}</p>
          <button onClick={() => router.back()} className="text-cyan-400 hover:text-cyan-300 text-sm underline">Go back</button>
        </div>
      </div>
    );
  }

  const canAssign = asset.status === "IN_STOCK";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto">

        {msg && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>{msg.text}</div>
        )}

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Assign Asset</h1>
        <p className="text-gray-400 mb-8">Assign this asset to a user and set the expected return date</p>

        {/* Asset summary card */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cyan-400 font-mono text-sm font-bold">{asset.asset_tag}</p>
              <p className="text-white font-semibold text-lg mt-0.5">{asset.name}</p>
              <p className="text-gray-500 text-sm">{asset.category}</p>
              {asset.serial_number && (
                <p className="text-gray-600 text-xs mt-1 font-mono">S/N: {asset.serial_number}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[asset.status] || "bg-gray-800 text-gray-400 border-gray-600"}`}>
              {asset.status?.replace(/_/g, " ")}
            </span>
          </div>
          {asset.purchase_cost && (
            <p className="text-gray-600 text-xs mt-3 font-mono">
              Cost: ${Number(asset.purchase_cost).toLocaleString()}
              {asset.current_value ? ` · Current value: $${Number(asset.current_value).toLocaleString()}` : ""}
            </p>
          )}
        </div>

        {!canAssign ? (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5 flex gap-3">
            <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-yellow-300 font-medium text-sm">Cannot assign — asset is {asset.status?.replace(/_/g, " ")}</p>
              <p className="text-yellow-300/60 text-xs mt-1">
                Only <strong>IN_STOCK</strong> assets can be assigned. Change the asset status first if applicable.
              </p>
              <button onClick={() => router.push(`/Assets/Edit/${assetId}`)}
                className="text-cyan-400 hover:text-cyan-300 text-xs underline mt-2">
                Open asset to change status
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Assignment Details
              </h2>

              {/* User */}
              <div>
                <FL required>Assign To User</FL>
                <select value={form.assigned_to_user_id} onChange={set("assigned_to_user_id")}
                  className={`${INPUT} ${errors.assigned_to_user_id ? "border-red-500" : ""}`}>
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
                {errors.assigned_to_user_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.assigned_to_user_id}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FL required>Assigned Date</FL>
                  <input type="date" value={form.assigned_date} onChange={set("assigned_date")}
                    className={`${INPUT} ${errors.assigned_date ? "border-red-500" : ""}`} />
                  {errors.assigned_date && (
                    <p className="text-red-400 text-xs mt-1">{errors.assigned_date}</p>
                  )}
                </div>
                <div>
                  <FL hint="Leave blank for open-ended assignment">Expected Return Date</FL>
                  <input type="date" value={form.expected_return_date} onChange={set("expected_return_date")}
                    min={form.assigned_date || undefined}
                    className={`${INPUT} ${errors.expected_return_date ? "border-red-500" : ""}`} />
                  {errors.expected_return_date && (
                    <p className="text-red-400 text-xs mt-1">{errors.expected_return_date}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <FL>Notes</FL>
                <textarea value={form.notes} onChange={set("notes")} rows={3}
                  placeholder="Purpose of assignment, project, special instructions, access requirements..."
                  className={`${INPUT} resize-none`} />
              </div>
            </div>

            {/* Assignment summary preview */}
            {form.assigned_to_user_id && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Assignment Summary</p>
                <div className="text-sm text-blue-300/80 space-y-1">
                  <p>
                    <span className="text-cyan-400 font-mono">{asset.asset_tag}</span>
                    {" → "}
                    <span className="text-white font-medium">
                      {users.find((u) => String(u.id) === String(form.assigned_to_user_id))
                        ? `${users.find((u) => String(u.id) === String(form.assigned_to_user_id)).firstName} ${users.find((u) => String(u.id) === String(form.assigned_to_user_id)).lastName}`
                        : "—"}
                    </span>
                  </p>
                  <p>
                    From <span className="text-white">{form.assigned_date}</span>
                    {form.expected_return_date
                      ? <> until <span className="text-white">{form.expected_return_date}</span></>
                      : <span className="text-gray-500"> (open-ended)</span>}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all">
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
