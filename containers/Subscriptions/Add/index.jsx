"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreateSubscription,
  GetSubscriptionById,
  UpdateSubscription,
} from "@/services/Subscriptions";

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

const defaultForm = {
  name: "",
  displayName: "",
  tier: "",
  price: "",
  active: false,
  projectLimit: "",
  userLimit: "",
  features: [{ key: "", value: "" }],
  moduleAccess: [],
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
      getSubscriptioDetails();
    }
  }, [id]);

  const getSubscriptioDetails = async () => {
    try {
      const res = await GetSubscriptionById(id);
      console.log(res);
      setForm({
        name: res.name,
        displayName: res.displayName,
        price: res.price,
        projectLimit: res.projectLimit,
        tier: res.tier,
        userLimit: res.userLimit,
        active: res.isActive,
        features: Object.entries(res.features).map(([key, value]) => ({
          key,
          value,
        })),
        moduleAccess: res.moduleAccess,
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

  const addFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { key: "", value: "" }],
    }));
  };

  const removeFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const toggleModule = (mod) => {
    setForm((prev) => ({
      ...prev,
      moduleAccess: prev.moduleAccess.includes(mod)
        ? prev.moduleAccess.filter((m) => m !== mod)
        : [...prev.moduleAccess, mod],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price) {
      setError("Plan name and price are required.");
      return;
    }

    const payload = {
      name: form.name,
      displayName: form.displayName,
      price: form.price,
      projectLimit: form.projectLimit || null,
      tier: form.tier,
      userLimit: form.userLimit || null,
      features: Object.fromEntries(
        form.features
          .filter((f) => f.key.trim())
          .map((f) => [f.key.trim(), f.value]),
      ),
      moduleAccess: form.moduleAccess,
      isActive: form.active,
    };

    try {
      setLoading(true);
      if (id) {
        console.log("id");
        await UpdateSubscription(id, payload);
      } else {
        console.log("no id");
        await CreateSubscription(payload);
      }
      router.back();
    } catch (err) {
      console.log(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  console.log("form : ", form);
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
          {id ? "Edit" : "Add"} Subscription Plan
        </h1>
        <p className="text-gray-400 text-sm">
          {id ? "Update" : "Fill in"} the details{" "}
          {id ? "of created" : "to create a new"} pricing plan.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Plan Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Professional"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="e.g. Professional"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Price <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. $500"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Tier <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="tier"
              value={form.tier}
              onChange={handleChange}
              placeholder="e.g. $500"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Project Limit{" "}
              <span className="text-gray-600 normal-case">
                (leave empty for unlimited)
              </span>
            </label>
            <input
              type="number"
              name="projectLimit"
              value={form.projectLimit}
              onChange={handleChange}
              placeholder="e.g. 25"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              User Limit{" "}
              <span className="text-gray-600 normal-case">
                (leave empty for unlimited)
              </span>
            </label>
            <input
              type="number"
              name="userLimit"
              value={form.userLimit}
              onChange={handleChange}
              placeholder="e.g. 50"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
          <div className="flex items-center gap-10 mt-5">
            <label className="text-gray-400 text-xs uppercase tracking-widest block">
              Actice{" "}
            </label>
            <input
              type="checkbox"
              defaultChecked
              name="active"
              checked={form.active}
              onChange={handleChange}
              className={`toggle toggle-info `}
            />
          </div>
        </div>

        {/* ── Features ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-400 text-xs uppercase tracking-widest">
              Features
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              + Add Feature
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.features.map((feature, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={feature.key}
                  onChange={(e) =>
                    handleFeatureChange(index, "key", e.target.value)
                  }
                  placeholder="Feature name (e.g. Storage)"
                  className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
                />
                <input
                  type="text"
                  value={feature.value}
                  onChange={(e) =>
                    handleFeatureChange(index, "value", e.target.value)
                  }
                  placeholder="Value (e.g. 100 GB)"
                  className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
                />
                {form.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Modules ── */}
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-3 block">
            Modules Included{" "}
            <span className={`normal-case text-xs ${accentText}`}>
              ({form.moduleAccess.length} selected)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MODULES.map((mod) => {
              const selected = form.moduleAccess.includes(mod);
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
