"use client";

import { useState, useEffect } from "react";

export default function SubmittalEditForm({
  data,
  onSubmit,
  loading,
  projects,
  companies,
  users,
}) {
  const [form, setForm] = useState({
    project_id: "",
    submittal_number: "",
    title: "",
    spec_section: "",
    submittal_type: "Product Data",
    manufacturer: "",
    sent_date: "",
    received_date: "",
    required_date: "",
    reviewer_company_id: "",
    reviewed_by: "",
    status: "Open",
    revision_number: 0,
    notes: "",
    rejection_reason: "",
  });

  // ONLY DIFFERENCE: inject API data into same structure
  useEffect(() => {
    if (data) {
      setForm({
        project_id: data.project_id || "",
        submittal_number: data.submittal_number || "",
        title: data.title || "",
        spec_section: data.spec_section || "",
        submittal_type: data.submittal_type || "Product Data",
        manufacturer: data.manufacturer || "",
        sent_date: data.sent_date || "",
        received_date: data.received_date || "",
        required_date: data.required_date || "",
        reviewer_company_id: data.reviewer_company_id || "",
        reviewed_by: data.reviewed_by || "",
        status: data.status || "Open",
        revision_number: data.revision_number || 0,
        notes: data.notes || "",
        rejection_reason: data.rejection_reason || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg outline-none";

  const inputStyle = {
    background: "var(--rf-bg2)",
    color: "var(--rf-txt)",
    boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
  };

  const labelClass = "text-sm mb-1 block";

  const labelStyle = { color: "var(--rf-txt2)" };

  const fieldWrapper = "flex flex-col";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border2)",
      }}
    >

      {/* HEADER */}
      <div
        className="p-6"
        style={{
          background: "var(--rf-accent)",
          borderBottom: "1px solid var(--rf-border2)",
        }}
      >
        <h2
          className="flex items-center gap-2 text-xl font-semibold"
          style={{ color: "#fff" }}
        >
            <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                        />
                    </svg>
          Submittal Details
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* PROJECT (SAME AS CREATE) */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Project *</label>
            <select
              name="project_id"
              value={form.project_id}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              required
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName ?? p.name ?? p.code ?? p.id}
                </option>
              ))}
            </select>
          </div>

          {/* SUBMITTAL NUMBER */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Submittal Number</label>
            <input
              name="submittal_number"
              value={form.submittal_number}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* TITLE */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              required
            />
          </div>

          {/* SPEC SECTION */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Spec Section</label>
            <input
              name="spec_section"
              value={form.spec_section}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* TYPE */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Submittal Type</label>
            <select
              name="submittal_type"
              value={form.submittal_type}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            >
              <option>Product Data</option>
              <option>Shop Drawing</option>
              <option>Sample</option>
              <option>O&M</option>
              <option>Warranty</option>
            </select>
          </div>

          {/* MANUFACTURER */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Manufacturer</label>
            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* SENT DATE */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Sent Date</label>
            <input
              type="date"
              name="sent_date"
              value={form.sent_date}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* RECEIVED DATE */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Received Date</label>
            <input
              type="date"
              name="received_date"
              value={form.received_date}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* REQUIRED DATE */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Required Date</label>
            <input
              type="date"
              name="required_date"
              value={form.required_date}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* REVIEWER COMPANY (SAME DROPDOWN) */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Reviewer Company</label>
            <select
              name="reviewer_company_id"
              value={form.reviewer_company_id}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* REVIEWED BY */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Reviewed By</label>
            <select
              name="reviewed_by"
              value={form.reviewed_by}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className={fieldWrapper}>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            >
              <option>Open</option>
              <option>Under Review</option>
              <option>Approved</option>
              <option>Approved on Sub</option>
              <option>Revise & Resubmit</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* REVISION */}
          <div className="col-span-3">
            <label className={labelClass} style={labelStyle}>Revision Number</label>
            <input
              type="number"
              name="revision_number"
              value={form.revision_number}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* NOTES */}
        <div className="mt-5 flex flex-col">
          <label className={labelClass} style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className={inputClass + " h-28"}
            style={inputStyle}
          />
        </div>

        {/* REJECTION */}
        <div className="mt-4 flex flex-col">
          <label className={labelClass} style={labelStyle}>Rejection Reason</label>
          <textarea
            name="rejection_reason"
            value={form.rejection_reason}
            onChange={handleChange}
            className={inputClass + " h-24"}
            style={inputStyle}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 px-4 py-3 rounded-lg font-medium transition-all"
          style={{
            background: "var(--rf-accent)",
            color: "#fff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Updating..." : "Update Submittal"}
        </button>
      </form>
    </div>
  );
}