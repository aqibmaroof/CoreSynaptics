"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateRoles, GetRolesById, UpdateRoles } from "@/services/Roles";

const defaultForm = {
  name: "",
  description: "",
};

export default function AddSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      getRolesDetails();
    }
  }, [id]);

  const getRolesDetails = async () => {
    try {
      const res = await GetRolesById(id);
      setForm({
        name: res.name,
        description: res.description,
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

  const handleFeatureChange = (index, field, value) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index][field] = value;
      return { ...prev, features };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name) {
      setError("Role name is required.");
      return;
    }

    const payload = {
      name: form.name,
      description: form?.description,
    };

    try {
      setLoading(true);
      if (id) {
        await UpdateRoles(id, payload);
      } else {
        await CreateRoles(payload);
      }
      router.back();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Color accent helpers ───────────────────────────────────

  const accentBorder = "border-orange-400/40 focus:border-orange-400";

  const accentBg = "bg-orange-400 hover:bg-orange-300";

  const cardGradient = "from-[#FF8E4E]/20";

  return (
    <div className="flex flex-col mt-5 justify-center py-5 px-7">
      {/* Header */}
      <div className=" mb-5">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          {id ? "Edit" : "Add"} Roles
        </h1>
        <p className="text-gray-400 text-sm">
          {id ? "Update" : "Fill in"} the details{" "}
          {id ? "of created" : "to create a new"} role.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`w-full  rounded-2xl border-2 border-white/20 bg-gradient-to-bl ${cardGradient} via-black/30 to-[#151515]/0 p-8 flex flex-col gap-7`}
      >
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Color Picker ── */}

        {/* ── Basic Info ── */}
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            Role Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            required
            onChange={handleChange}
            placeholder="e.g. Professional"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            Role Description
          </label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Professional"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
          />
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
                ? "Update Plan"
                : "Create Plan"}
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
