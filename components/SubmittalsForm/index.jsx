"use client";

import { useState } from "react";

export default function SubmittalForm({
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const inputClass =
        "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";

    const labelClass = "text-sm text-gray-300 mb-1 block";

    const fieldWrapper = "flex flex-col";

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
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
            <form
                onSubmit={handleSubmit}
                className="bg-gray-900/50 p-6 shadow-sm"
            >
                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* PROJECT */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Project *</label>
                        <select
                            name="project_id"
                            value={form.project_id}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        >
                            <option value="">Select Project</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SUBMITTAL NUMBER */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Submittal Number</label>
                        <input
                            name="submittal_number"
                            value={form.submittal_number}
                            onChange={handleChange}
                            placeholder="Auto / Manual Number"
                            className={inputClass}
                        />
                    </div>

                    {/* TITLE */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Title *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter title"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* SPEC SECTION */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Spec Section</label>
                        <input
                            name="spec_section"
                            value={form.spec_section}
                            onChange={handleChange}
                            placeholder="e.g. 09 21 16"
                            className={inputClass}
                        />
                    </div>

                    {/* TYPE */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Submittal Type</label>
                        <select
                            name="submittal_type"
                            value={form.submittal_type}
                            onChange={handleChange}
                            className={inputClass}
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
                        <label className={labelClass}>Manufacturer</label>
                        <input
                            name="manufacturer"
                            value={form.manufacturer}
                            onChange={handleChange}
                            placeholder="Manufacturer name"
                            className={inputClass}
                        />
                    </div>

                    {/* SENT DATE */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Sent Date</label>
                        <input
                            type="date"
                            name="sent_date"
                            value={form.sent_date}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* RECEIVED DATE */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Received Date</label>
                        <input
                            type="date"
                            name="received_date"
                            value={form.received_date}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* REQUIRED DATE */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Required Date</label>
                        <input
                            type="date"
                            name="required_date"
                            value={form.required_date}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* REVIEWER COMPANY */}
                    <div className={fieldWrapper}>
                        <label className={labelClass}>Reviewer Company</label>
                        <select
                            name="reviewer_company_id"
                            value={form.reviewer_company_id}
                            onChange={handleChange}
                            className={inputClass}
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
                        <label className={labelClass}>Reviewed By</label>
                        <select
                            name="reviewed_by"
                            value={form.reviewed_by}
                            onChange={handleChange}
                            className={inputClass}
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
                        <label className={labelClass}>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className={inputClass}
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
                        <label className={labelClass}>Revision Number</label>
                        <input
                            type="number"
                            name="revision_number"
                            value={form.revision_number}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* NOTES */}
                <div className="mt-5 flex flex-col">
                    <label className={labelClass}>Notes</label>
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        className={inputClass + " h-28"}
                        placeholder="Add internal notes..."
                    />
                </div>

                {/* REJECTION REASON */}
                <div className="mt-4 flex flex-col">
                    <label className={labelClass}>Rejection Reason</label>
                    <textarea
                        name="rejection_reason"
                        value={form.rejection_reason}
                        onChange={handleChange}
                        className={inputClass + " h-24"}
                        placeholder="If rejected, explain reason..."
                    />
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-5 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all"
                >
                    {loading ? "Creating..." : "Create Submittal"}
                </button>
            </form>
        </div>
    );
}