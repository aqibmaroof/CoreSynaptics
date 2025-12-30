"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import config from "../../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RegisterService } from "../../../services/auth";
import { useRouter } from "next/navigation";

// Note: For the illustration, you would typically use an SVG or
// the image file you uploaded. I will use a placeholder div for the layout.

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowpassword] = React.useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneCountryCode: "",
    phoneNumber: "",
    password: "",
    role: "admin",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await RegisterService(formData);
      if (response?.success) {
        setMessage({ type: "success", text: "Registration successful! 🚀" });
        setTimeout(() => router.push("/Auth/Login"), 5000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Registration failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] dark:bg-[#101437]">
      {/* Left Side: Illustration (Hidden on mobile) */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center "></div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/3 p-8 md:p-16 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <img src={config?.brand} className="w-70 h-auto dark:hidden" />
          <img src={config?.brand} className="w-70 h-auto hidden dark:block" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1 text-[#101437] dark:text-white">
            Adventure starts here 🚀
          </h2>
          <p className="text-sm text-[#101437] dark:text-white">
            Make your app management easy and fun!
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="form-control w-full md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                FULL NAME
              </span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white focus:border-accent focus:outline-none h-10 text-sm"
            />
          </div>

          <div className="form-control w-full md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                EMAIL
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white h-10 text-sm"
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                DATE OF BIRTH
              </span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              max={today}
              onChange={handleChange}
              required
              className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none h-10 text-sm placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white"
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                ROLE
              </span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select select-bordered border-gray-600 bg-[#fff] dark:bg-[#101437] w-full placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white focus:border-accent focus:outline-none h-10 min-h-0 text-sm font-normal"
            >
              {/* "role must be one of the following values: hunter, guide, outfitter, admin" */}
              <option value="admin">Admin</option>
              <option value="hunter">Hunter</option>
              <option value="guide">Guide</option>
              <option value="outfitter">Outfitter</option>
            </select>
          </div>

          <div className="form-control w-full md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                PHONE NUMBER
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="phoneCountryCode"
                value={formData.phoneCountryCode}
                onChange={handleChange}
                placeholder="+1"
                className="input input-bordered border-gray-600 placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white bg-transparent w-20 focus:border-accent focus:outline-none h-10 text-sm text-center"
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="4547260592"
                className="input input-bordered border-gray-600 bg-transparent flex-1 focus:border-accent placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white focus:outline-none h-10 text-sm"
              />
            </div>
          </div>

          <div className="form-control w-full md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                COUNTRY (ISO CODE)
              </span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="US"
              className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none h-10 text-sm placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white"
            />
          </div>

          <div className="form-control w-full md:col-span-2">
            <div className="flex justify-between items-center">
              <label className="label py-1">
                <span className="label-text text-sm text-[#101437] dark:text-white mb-1 font-semibold">
                  Password
                </span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="............"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent placeholder:text-[#101437] dark:placeholder:text-white border-[#101437] dark:border-white text-[#101437] dark:text-white focus:outline-none h-10 text-sm pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                onClick={() => setShowpassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {/* Status Messages */}
          {message.text && (
            <div
              className={`p-3 rounded mb-4 text-sm ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="md:col-span-2 space-y-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className={`btn border-none btn-accent w-full normal-case `}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <Link
            href="/Auth/Login"
            className="text-accent ml-1 hover:underline font-medium"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
