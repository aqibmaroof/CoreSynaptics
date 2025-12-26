"use client";
import { useState } from "react";
import Link from "next/link";
import config from "../../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation"; // To redirect after login
import { LoginService, GetUser } from "../../../services/auth";
import { setUser } from "../../../services/instance/tokenService";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowpassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State to hold the login payload
  const [formData, setFormData] = useState({
    email: "", // Initializing with your example values
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true);

    try {
      const response = await LoginService(formData);

      if (response?.success) {
        setMessage({ type: "success", text: "Login successful! 🚀" });
        const response = await GetUser();
        setUser({ user: response });
        setTimeout(() => router.push("/"), 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Login failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: Array.isArray(error?.message)
          ? error?.message?.[0]
          : error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] dark:bg-[#183431]">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex lg:w-2/3 items-center justify-center p-12 bg-[#fff] dark:bg-[#1e4742]">
        <div className="relative w-full max-w-2xl">
          <img
            src={config?.login_illustration_light}
            className="w-full h-auto object-contain dark:hidden"
            alt="Illustration Light"
          />
          <img
            src={config?.login_illustration}
            className="w-full h-auto object-contain hidden dark:block"
            alt="Illustration Dark"
          />
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/3 p-8 md:p-16 lg:p-12 xl:p-20">
        <div className="flex items-center gap-2 mb-5">
          <img
            src={config?.brand}
            className="w-40 h-auto dark:hidden"
            alt="Brand"
          />
          <img
            src={config?.brand_dark}
            className="w-40 h-auto hidden dark:block"
            alt="Brand Dark"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1 dark:text-white">
            Welcome to WildTag! 👋
          </h2>
          <p className="text-lg text-[#183431] dark:text-gray-300">
            Please sign-in to your account and start the adventure
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-lg text-[#183431] dark:text-white mb-2 font-semibold">
                Email
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-lg text-[#183431] dark:text-white mb-2 font-semibold">
                Phone
              </span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none h-10 text-sm"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-lg text-[#183431] dark:text-white mb-2 font-semibold">
                Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="............"
                className="input input-bordered border-gray-600 bg-transparent w-full focus:border-accent focus:outline-none h-10 text-sm pr-10"
                required
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

          <div className="flex items-center justify-between mt-4">
            <Link
              href="/forgot-password"
              size="sm"
              className="text-sm text-accent hover:underline ml-auto"
            >
              Forgot Password?
            </Link>
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

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-accent border-none w-full normal-case mt-2 `}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          New on our platform?
          <Link
            href="/Auth/Register"
            className="text-accent ml-1 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
