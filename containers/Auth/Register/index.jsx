"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  GetOrganization,
  GetUser,
  RegisterService,
} from "../../../services/auth";
import { useRouter } from "next/navigation";
import config from "../../../config";
import {
  setOrganization,
  setUser,
} from "../../../services/instance/tokenService";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    organizationType: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await RegisterService(formData);
      console.log(response);
      if (response) {
        setMessage({
          type: "success",
          text: "Registration successful! 🚀 Redirecting...",
        });
        const userResponse = await GetUser();
        const organizationResponse = await GetOrganization();
        setUser({ user: userResponse });
        setOrganization({ organization: organizationResponse });
        setTimeout(() => {
          router.push("/Subscriptions");
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Registration failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Illustration (Hidden on mobile) */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center "></div>

      {/* Right Side: Form */}
      <div className="bg-[url('/images/mainBackground.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center w-full lg:w-1/3 p-8 md:p-16 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <img src={config?.brand} className="w-70 h-auto dark:hidden" />
          <img src={config?.brand} className="w-70 h-auto hidden dark:block" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1 text-white">
            Adventure starts here 🚀
          </h2>
          <p className="text-sm text-white">
            Make your app management easy and fun!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Company Name */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          {/* Organization Type */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              Organization Type
            </label>
            <select
              name="organizationType"
              value={formData.organizationType}
              onChange={handleChange}
              className="select select-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
              required
            >
              <option
                className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
                value=""
                disabled
              >
                Select organization type
              </option>
              <option
                className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
                value="GC"
              >
                GC
              </option>
              <option
                className="bg-gradient-to-r from-[#093E7D] to-[#0075FF] rounded-none"
                value="OEM"
              >
                OEM
              </option>
            </select>
          </div>

          {/* First Name */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="label-text text-sm text-white mb-1 font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered border-gray-600 bg-transparent w-full placeholder:text-white border-white text-white focus:border-accent focus:outline-none h-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-error"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn border-none btn-accent w-full normal-case  "
          >
            {loading ? "Registering..." : "Register"}
          </button>
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
