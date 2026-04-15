"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreatePermissions,
  GetPermissionsById,
  UpdatePermissions,
} from "@/services/Permissions";

const defaultForm = {
  modules: "",
  resource: "",
  action: "",
};

const AVAILABLE_MODULES = [
  "admin",
  "authorization",
  "projects",
  "sales",
  "scheduling",
  "supply Chain",
  "field execution",
  "qa/qc",
  "Safety",
  "commissioning",
  "rma/rca",
  "finance",
  "hr",
  "documents",
  "reports",
];

export default function AddSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      getPermissionDetails();
    }
  }, [id]);

  const getPermissionDetails = async () => {
    try {
      const res = await GetPermissionsById(id);
      setForm({
        modules: res.module,
        resource: res?.resource,
        action: res.action,
      });
    } catch (error) {
      console.error("error fetching details : ", error?.message);
    }
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    const payload = {
      module: form.modules,
      resource: form?.resource,
      action: form.action,
    };

    try {
      setLoading(true);
      if (id) {
        await UpdatePermissions(id, payload);
      } else if (!id) {
        await CreatePermissions(payload);
      }
      router.back();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  const toggleModule = (mod) => {
    setForm((prev) => ({
      ...prev,
      modules: mod,
    }));
  };

  // ── Color accent helpers ───────────────────────────────────
  const accentText = "text-orange-400";

  const accentBorder = "border-orange-400/40 focus:border-orange-400";

  const accentBg = "bg-orange-400 hover:bg-orange-300";

  const cardGradient = "from-[#FF8E4E]/20";

  const moduleBorder = "border-orange-400 bg-orange-400/10 text-orange-400";

  return (
    <div className="flex flex-col mt-5 justify-center py-5 px-7">
      {/* Header */}
      <div className=" mb-5">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          {id ? "Edit" : "Add"} Permissions
        </h1>
        <p className="text-gray-400 text-sm">
          {id ? "Update" : "Fill in"} the details{" "}
          {id ? "of created" : "to create a new"} permission.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`w-full  rounded-2xl border-2 border-white/20 bg-gradient-to-bl ${cardGradient} via-black/30 to-[#151515]/0 p-8 flex flex-col gap-5`}
      >
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Basic Info ── */}

        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            Resource
          </label>
          <select
            name="resource"
            value={form.resource}
            onChange={handleChange}
            className={`select w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            required
          >
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value=""
              disabled
            >
              Select Resource
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="tenants"
            >
              Tenants
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="subscriptions"
            >
              Subscriptions
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="project"
            >
              Project
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="users"
            >
              Users
            </option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-3 block">
            Modules Included{" "}
            <span className={`normal-case text-xs ${accentText}`}>
              ({form.modules || " -"} selected)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MODULES.map((mod) => {
              const selected = form.modules === mod;
              return (
                <button
                  type="button"
                  key={mod}
                  onClick={() => toggleModule(mod)}
                  className={`px-4 py-2 rounded-xl text-sm border capitalize transition-all duration-150 font-medium ${
                    selected
                      ? moduleBorder
                      : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  {selected && <span className="mr-1.5">✓</span>}
                  {mod}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            Action
          </label>
          <select
            name="action"
            value={form.action}
            onChange={handleChange}
            className={`select w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            required
          >
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value=""
              disabled
            >
              Select Action
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="view"
            >
              View
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="edit"
            >
              Edit
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="create"
            >
              Create
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="read"
            >
              Read
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="update"
            >
              Update
            </option>
            <option
              className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
              value="delete"
            >
              Delete
            </option>
          </select>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${accentBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading
              ? id
                ? "Updating..."
                : "Creating..."
              : id
                ? "Update Permission"
                : "Create Permission"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
