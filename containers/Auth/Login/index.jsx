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
    <div className="flex min-h-screen ">
      {/* Left Side: Illustration */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center "></div>

      {/* Right Side: Form */}
      <div className="bg-[url('/images/mainBackground.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center w-full lg:w-1/3 p-8 md:p-16 lg:p-12 xl:p-20">
        <div className="flex items-center gap-2 mb-5">
          <img
            src={config?.brand}
            className="w-70 h-auto dark:hidden"
            alt="Brand"
          />
          <img
            src={config?.brand}
            className="w-70 h-auto hidden dark:block"
            alt="Brand Dark"
          />
        </div>

        <div className="mb-10 mt-18">
          <h2 className="text-[30px] font-semibold dark:text-white">
            Nice to see you!
          </h2>
          <p className="text-[14px] text-[#101437] dark:text-gray-300">
            Enter your email and password to sign in
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="flex flex-col items-start justify-center">
            <label className="label py-1">
              <span className="label-text text-lg text-[#101437] dark:text-white">
                Email
              </span>
            </label>
            <div className="w-full max-w-lg">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                className="input w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13"
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-lg text-[#101437] dark:text-white">
                Password
              </span>
            </label>
            <div className="relative ">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                className="input w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13"
              />
            </div>
          </div>

          <fieldset className="fieldset">
            <label className="label text-[#FFFFFF] text-[120x]">
              <input
                type="checkbox"
                className="toggle border-blue-100 h-5 bg-blue-100 text-[#0075FF] checked:border-[#0075FF] checked:bg-[#0075FF] checked:text-[#fff]"
              />
              Remember me
            </label>
          </fieldset>

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
            className="w-full  mt-2 h-13 rounded-3xl bg-gradient-to-r from-[#0075F8] to-[#00387A] backdrop-blur-[42px] border-3 border-blue-700 text-white font-bold text-sm tracking-wider uppercase transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-60 overflow-hidden"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400 font-bold">
          Don't have an account?
          <Link
            href="/Auth/Register"
            className="text-white ml-1 hover:underline "
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
