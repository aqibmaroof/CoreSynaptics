"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/services/Companies";

const COMPANY_TYPES = [
  "CLIENT",
  "SUBCONTRACTOR",
  "VENDOR",
  "PARTNER",
  "CONSULTANT",
  "OTHER",
];

export default function CompanyAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    region: "",
    subscriptionPlan: "",
    subscriptionActive: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!formData.type) {
      setError("Company type is required");
      return false;
    }
    if (!formData.region.trim()) {
      setError("Region is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createCompany({
        name: formData.name,
        type: formData.type,
        region: formData.region,
        subscriptionPlan: formData.subscriptionPlan || undefined,
        subscriptionActive: formData.subscriptionActive,
      });
      router.push("/Company/List");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--rf-txt)" }}
          >
            Add New Company
          </h1>
          <p style={{ color: "var(--rf-txt2)" }}>
            Create and manage your company information
          </p>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border2)",
          }}
        >
          <div
            className="p-6"
            style={{
              background: "var(--rf-accent)",
              borderBottom: "1px solid var(--rf-border2)",
            }}
          >
            <h2
              className="text-xl font-semibold flex items-center gap-2"
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
              Company Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div
                className="rounded-lg p-4 flex items-start gap-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-red) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--rf-red)" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span style={{ color: "var(--rf-red)" }}>{error}</span>
              </div>
            )}

            {/* Company Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--rf-txt)" }}
              >
                Company Name <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter company name"
                className="w-full px-4 py-3 rounded-lg outline-none placeholder-gray-400"
                style={{
                  background: "var(--rf-bg2)",
                  color: "var(--rf-txt)",
                  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                }}
              />
            </div>

            {/* Company Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--rf-txt)" }}
              >
                Company Type <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg outline-none placeholder-gray-400"
                style={{
                  background: "var(--rf-bg2)",
                  color: "var(--rf-txt)",
                  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                }}
              >
                <option value="">— Select Type —</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0] + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="region"
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--rf-txt)" }}
              >
                Region <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., North America, Europe, Asia-Pacific"
                className="w-full px-4 py-3 rounded-lg outline-none placeholder-gray-400"
                style={{
                  background: "var(--rf-bg2)",
                  color: "var(--rf-txt)",
                  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                }}
              />
            </div>

            {/* Subscription Plan */}
            <div>
              <label
                htmlFor="subscriptionPlan"
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--rf-txt)" }}
              >
                Subscription Plan{" "}
                <span
                  className="font-normal"
                  style={{ color: "var(--rf-txt3)" }}
                >
                  (optional)
                </span>
              </label>
              <input
                type="text"
                id="subscriptionPlan"
                name="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleChange}
                placeholder="e.g., Standard, Premium, Enterprise"
                className="w-full px-4 py-3 rounded-lg outline-none placeholder-gray-400"
                style={{
                  background: "var(--rf-bg2)",
                  color: "var(--rf-txt)",
                  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                }}
              />
            </div>

            {/* Subscription Active */}
            <div
              className="rounded-lg p-4"
              style={{
                background: "var(--rf-bg3)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <label
                htmlFor="subscriptionActive"
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="subscriptionActive"
                  name="subscriptionActive"
                  checked={formData.subscriptionActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded focus:ring-2 cursor-pointer"
                  style={{ accentColor: "var(--rf-accent)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--rf-txt)" }}
                >
                  Subscription Active
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  {formData.subscriptionActive ? "Active" : "○ Inactive"}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div
              className="flex gap-3 pt-6 border-t"
              style={{ borderColor: "var(--rf-border2)" }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt)",
                  border: "1px solid var(--rf-border2)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--rf-txt2)" }}
        >
          <p>
            All fields marked with{" "}
            <span style={{ color: "var(--rf-red)" }}>*</span> are required
          </p>
        </div>
      </div>
    </div>
  );
}
