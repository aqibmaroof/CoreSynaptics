"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateUsers, GetUsersById, UpdateUsers } from "@/services/Users";

const defaultForm = {
  email: "",
  firstName: "",
  lastName: "",
  roleId: "",
};

export default function AddSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const roles = JSON.parse(localStorage.getItem("roles"));

  useEffect(() => {
    if (id) {
      getUsersDetails();
    }
  }, [id]);

  const getUsersDetails = async () => {
    try {
      const res = await GetUsersById(id);
      console.log(res);
      setForm({
        email: res.email,
        firstName: res?.firstName,
        lastName: res.lastName,
        roleId: res.roleId,
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

    const payload = id
      ? {
          firstName: form?.firstName,
          lastName: form?.lastName,
        }
      : {
          email: form?.email,
          firstName: form?.firstName,
          lastName: form?.lastName,
          roleId: form.roleId,
        };

    try {
      setLoading(true);
      if (id) {
        console.log("id");
        await UpdateUsers(id, payload);
      } else {
        console.log("no id");
        await CreateUsers(payload);
      }
      router.back();
    } catch (err) {
      console.log(err);
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
          {id ? "Edit" : "Add"} Users
        </h1>
        <p className="text-gray-400 text-sm">
          {id ? "Update" : "Fill in"} the details{" "}
          {id ? "of created" : "to create a new"} user.
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

        {/* ── Basic Info ── */}
        {!id && (
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="email"
              value={form.email}
              required
              disabled={id}
              onChange={handleChange}
              placeholder="e.g. Professional"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
            />
          </div>
        )}
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="e.g. Professional"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="e.g. Professional"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
          />
        </div>
        {!id && (
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
              Role
            </label>
            <select
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              className={`select w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors ${accentBorder}`}
              required
            >
              <option
                className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
                value=""
                disabled
              >
                Select Role
              </option>
              {roles?.length > 0 &&
                roles.map((item, index) => (
                  <option
                    key={index}
                    className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
                    value={item?.id}
                  >
                    {item?.name}
                  </option>
                ))}
            </select>
          </div>
        )}
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
                ? "Update User"
                : "Create User"}
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
