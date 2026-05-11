"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getPayrollProfiles,
  createPayrollProfile,
  updatePayrollProfile,
  deletePayrollProfile,
  getDeductions,
  addDeduction,
  removeDeduction,
} from "@/services/Payroll";
import { formatCurrency } from "@/Utils/payrollCalculations";

const EMPLOYMENT_TYPES = ["hourly", "permanent"];
const PAY_FREQUENCIES = ["weekly", "biweekly", "monthly"];
const DEDUCTION_TYPES = ["Tax", "Insurance", "Pension", "Loan", "Other"];

const EMPTY_FORM = {
  user_id: "",
  employment_type: "permanent",
  hourly_rate: "",
  monthly_salary: "",
  pay_frequency: "monthly",
  start_date: "",
  end_date: "",
  department: "",
  notes: "",
};

const EMPTY_DEDUCTION = {
  label: "",
  type: "Tax",
  amount: "",
  is_percentage: false,
};

export default function PayrollEmployees() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Deductions drawer
  const [deductionProfile, setDeductionProfile] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [deductionForm, setDeductionForm] = useState(EMPTY_DEDUCTION);
  const [addingDeduction, setAddingDeduction] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const res = await getPayrollProfiles();
      setProfiles(res?.data?.items || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openDeductions(profile) {
    setDeductionProfile(profile);
    try {
      const res = await getDeductions(profile.id);
      setDeductions(res?.data || []);
    } catch (e) {
      setDeductions([]);
    }
  }

  const openAdd = () => {
    setEditingProfile(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setForm({
      user_id: profile.user_id || "",
      employment_type: profile.employment_type || "permanent",
      hourly_rate: profile.hourly_rate || "",
      monthly_salary: profile.monthly_salary || "",
      pay_frequency: profile.pay_frequency || "monthly",
      start_date: profile.start_date ? profile.start_date.slice(0, 10) : "",
      end_date: profile.end_date ? profile.end_date.slice(0, 10) : "",
      department: profile.department || "",
      notes: profile.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        monthly_salary: form.monthly_salary ? parseFloat(form.monthly_salary) : null,
      };
      if (editingProfile) {
        await updatePayrollProfile(editingProfile.id, payload);
      } else {
        await createPayrollProfile(payload);
      }
      setShowModal(false);
      fetchProfiles();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePayrollProfile(deleteTarget.id);
      setDeleteTarget(null);
      fetchProfiles();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddDeduction = async () => {
    setAddingDeduction(true);
    try {
      await addDeduction(deductionProfile.id, {
        ...deductionForm,
        amount: parseFloat(deductionForm.amount),
      });
      const res = await getDeductions(deductionProfile.id);
      setDeductions(res?.data || []);
      setDeductionForm(EMPTY_DEDUCTION);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingDeduction(false);
    }
  };

  const handleRemoveDeduction = async (deductionId) => {
    try {
      await removeDeduction(deductionProfile.id, deductionId);
      setDeductions((prev) => prev.filter((d) => d.id !== deductionId));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = profiles.filter((p) => {
    const matchSearch =
      !search ||
      p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || p.employment_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Payroll Employees</h1>
          <p className="text-sm text-gray-100 opacity-80 mt-0.5">
            Manage payroll profiles, employment types, and deductions
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>
          + Add Profile
        </button>
      </div>

      {/* Filters */}
      <div className="flex bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search employees..."
          className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-56"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {["All", "hourly", "permanent"].map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${typeFilter === t ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === "All" ? "All" : t === "hourly" ? "Hourly" : "Permanent"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-100">Loading profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-100">
            <p className="text-4xl mb-3">👥</p>
            <p>No payroll profiles found.</p>
            <button className="btn btn-sm btn-info rounded-xl mt-4" onClick={openAdd}>
              Add First Profile
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-100 opacity-60 text-xs">
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Rate / Salary</th>
                  <th>Frequency</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900-hover">
                    <td>
                      <div className="text-gray-100 font-medium">{p.user_name || "—"}</div>
                      <div className="text-xs text-gray-100 opacity-50">{p.user_email || ""}</div>
                    </td>
                    <td className="text-gray-100">{p.department || "—"}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          p.employment_type === "hourly" ? "badge-secondary" : "badge-info"
                        }`}
                      >
                        {p.employment_type === "hourly" ? "Hourly" : "Permanent"}
                      </span>
                    </td>
                    <td className="text-gray-100 font-medium">
                      {p.employment_type === "hourly"
                        ? `${formatCurrency(p.hourly_rate)}/hr`
                        : formatCurrency(p.monthly_salary) + "/mo"}
                    </td>
                    <td className="text-gray-100 capitalize">{p.pay_frequency}</td>
                    <td className="text-gray-100 text-xs">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          p.end_date && new Date(p.end_date) < new Date()
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {p.end_date && new Date(p.end_date) < new Date()
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-xs btn-ghost text-gray-100"
                          onClick={() => openDeductions(p)}
                          title="Deductions"
                        >
                          ✂️
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-gray-100"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editingProfile ? "Edit Payroll Profile" : "Add Payroll Profile"}
            </h3>

            <div className="space-y-3">
              {!editingProfile && (
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">User ID</label>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    placeholder="User UUID"
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Employment Type</label>
                  <select
                    className="select select-sm select-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={form.employment_type}
                    onChange={(e) =>
                      setForm({ ...form, employment_type: e.target.value })
                    }
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t === "hourly" ? "Hourly" : "Permanent"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Pay Frequency</label>
                  <select
                    className="select select-sm select-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={form.pay_frequency}
                    onChange={(e) => setForm({ ...form, pay_frequency: e.target.value })}
                  >
                    {PAY_FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.employment_type === "hourly" ? (
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    placeholder="e.g. 25.00"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">
                    Monthly Salary ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    placeholder="e.g. 5000.00"
                    value={form.monthly_salary}
                    onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="label text-xs text-gray-100 opacity-70">Department</label>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">Start Date</label>
                  <input
                    type="date"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-100 opacity-70">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs text-gray-100 opacity-70">Notes</label>
                <textarea
                  className="textarea textarea-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 text-sm"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-info btn-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editingProfile ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Deductions Drawer */}
      {deductionProfile && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-md">
            <h3 className="font-bold text-lg text-gray-100 mb-1">
              Deductions — {deductionProfile.user_name}
            </h3>
            <p className="text-xs text-gray-100 opacity-50 mb-4">
              Applied each pay period before net pay calculation
            </p>

            {/* Existing deductions */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {deductions.length === 0 ? (
                <p className="text-sm text-gray-100 opacity-50 text-center py-3">
                  No deductions configured.
                </p>
              ) : (
                deductions.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg px-3 py-2 border border-base-300"
                  >
                    <div>
                      <span className="text-gray-100 text-sm font-medium">{d.label}</span>
                      <span className="badge badge-xs ml-2">{d.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-100">
                        {d.is_percentage ? `${d.amount}%` : formatCurrency(d.amount)}
                      </span>
                      <button
                        className="btn btn-xs btn-ghost text-error"
                        onClick={() => handleRemoveDeduction(d.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add deduction form */}
            <div className="border-t border-base-300 pt-4 space-y-2">
              <p className="text-xs text-gray-100 opacity-60 font-medium uppercase tracking-wide">
                Add Deduction
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Federal Tax)"
                  className="input input-xs input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 col-span-2"
                  value={deductionForm.label}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, label: e.target.value })
                  }
                />
                <select
                  className="select select-xs select-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  value={deductionForm.type}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, type: e.target.value })
                  }
                >
                  {DEDUCTION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  className="input input-xs input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  value={deductionForm.amount}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, amount: e.target.value })
                  }
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={deductionForm.is_percentage}
                  onChange={(e) =>
                    setDeductionForm({ ...deductionForm, is_percentage: e.target.checked })
                  }
                />
                <span className="text-xs text-gray-100">Percentage of gross pay</span>
              </label>
              <button
                className="btn btn-xs btn-info w-full"
                onClick={handleAddDeduction}
                disabled={addingDeduction || !deductionForm.label || !deductionForm.amount}
              >
                {addingDeduction ? "Adding..." : "Add Deduction"}
              </button>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setDeductionProfile(null)}
              >
                Done
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeductionProfile(null)}
          />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Payroll Profile?</h3>
            <p className="text-sm text-gray-100 opacity-70 mt-2">
              This will permanently delete the payroll profile for{" "}
              <strong>{deleteTarget.user_name}</strong>. All associated deductions will
              also be removed. This cannot be undone.
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
