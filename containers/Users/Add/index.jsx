"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateUsers, GetUsersById, UpdateUsers } from "@/services/Users";
import { useRequirePermission, MODULE } from "@/Utils/rbac";

const defaultForm = {
  email: "",
  firstName: "",
  lastName: "",
  roleId: "",
};

// Letters (incl. accented), spaces, hyphens, apostrophes — e.g. O'Brien, Jean-Luc.
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;
// Standard email shape; also rejects embedded spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_NAME = 100;

// Mirrors the backend CreateUserDto rules so the user gets immediate feedback.
function validateForm(form, isEdit) {
  const errors = {};

  if (!isEdit) {
    const email = (form.email || "").trim();
    if (!email) errors.email = "Email is required.";
    else if (/\s/.test(form.email || ""))
      errors.email = "Email cannot contain spaces.";
    else if (!EMAIL_PATTERN.test(email))
      errors.email = "Enter a valid email address.";
    else if (email.length > MAX_EMAIL)
      errors.email = `Email cannot exceed ${MAX_EMAIL} characters.`;

    if (!form.roleId) errors.roleId = "Please select a role.";
  }

  const first = (form.firstName || "").trim();
  if (!first) errors.firstName = "First name is required.";
  else if (first.length > MAX_NAME)
    errors.firstName = `First name cannot exceed ${MAX_NAME} characters.`;
  else if (!NAME_PATTERN.test(first))
    errors.firstName =
      "First name may only contain letters, spaces, hyphens, and apostrophes.";

  const last = (form.lastName || "").trim();
  if (!last) errors.lastName = "Last name is required.";
  else if (last.length > MAX_NAME)
    errors.lastName = `Last name cannot exceed ${MAX_NAME} characters.`;
  else if (!NAME_PATTERN.test(last))
    errors.lastName =
      "Last name may only contain letters, spaces, hyphens, and apostrophes.";

  return errors;
}

export default function AddSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  // Both create and update gated by `edit` on the admin module.
  const guard = useRequirePermission(MODULE.ADMIN, "edit");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const roles =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("roles") || "[]")
      : [];

  useEffect(() => {
    if (id) {
      getUsersDetails();
    }
  }, [id]);

  const getUsersDetails = async () => {
    try {
      const res = await GetUsersById(id);
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
    // Clear the inline error for this field as the user corrects it.
    setFieldErrors((prev) =>
      prev[name] ? { ...prev, [name]: undefined } : prev,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validateForm(form, Boolean(id));
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    // Trim before sending so leading/trailing spaces never persist.
    const payload = id
      ? {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        }
      : {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          roleId: form.roleId,
        };

    try {
      setLoading(true);
      if (id) {
        await UpdateUsers(id, payload);
      } else {
        await CreateUsers(payload);
      }
      router.back();
    } catch (err) {
      // Surface backend validation messages (the API may return an array).
      const apiMsg = Array.isArray(err?.message)
        ? err.message.join(" ")
        : err?.message;
      if (apiMsg && /already exists|already in use|duplicate/i.test(apiMsg)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "This email is already registered.",
        }));
      } else {
        setError(apiMsg || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Color accent helpers ───────────────────────────────────
  // Higher-contrast input chrome: solid border, readable fill + placeholder.
  const accentBorder = "border-orange-400/70 focus:border-orange-400";

  const accentBg = "bg-orange-400 hover:bg-orange-300";

  const cardGradient = "from-[#FF8E4E]/20";

  const inputBase =
    "w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm outline-none transition-colors";
  const labelBase =
    "text-gray-200 text-xs uppercase tracking-widest mb-2 block";
  const fieldClass = (name) =>
    `${inputBase} ${fieldErrors[name] ? "border-red-500 focus:border-red-500" : accentBorder}`;
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="mt-1.5 text-red-400 text-xs">{fieldErrors[name]}</p>
    ) : null;

  if (guard.loading || guard.blocked) return guard.fallback;

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
        noValidate
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
            <label className={labelBase}>
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled={id}
              maxLength={MAX_EMAIL}
              onChange={handleChange}
              placeholder="e.g. jane.doe@company.com"
              className={fieldClass("email")}
            />
            <FieldError name="email" />
          </div>
        )}
        <div>
          <label className={labelBase}>
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            maxLength={MAX_NAME}
            placeholder="e.g. Jane"
            className={fieldClass("firstName")}
          />
          <FieldError name="firstName" />
        </div>

        <div>
          <label className={labelBase}>
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            maxLength={MAX_NAME}
            placeholder="e.g. Doe"
            className={fieldClass("lastName")}
          />
          <FieldError name="lastName" />
        </div>
        {!id && (
          <div>
            <label className={labelBase}>
              Role <span className="text-red-400">*</span>
            </label>
            <select
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              className={`select ${fieldClass("roleId")}`}
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
                    {item?.description}
                  </option>
                ))}
            </select>
            <FieldError name="roleId" />
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
