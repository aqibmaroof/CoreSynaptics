"use client";
import { useState } from "react";
import Link from "next/link";
import config from "../../../config";
import { useRouter } from "next/navigation";
import { ForgotPassword } from "../../../services/auth";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State to hold the login payload
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ForgotPassword(formData);
      console.log(response);
      if (response) {
        setMessage({
          type: "success",
          text: response?.message || "Forgot password email sent! 🚀",
        });
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Forgot password failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: Array.isArray(error?.message)
          ? error?.message?.[0]
          : error?.message || "An error occurred during forgot password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Illustration */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center"></div>

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
            Enter your email to get a password reset link.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
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
                required
                className="input w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13"
              />
            </div>
          </div>

          {/* Status Messages */}
          {message.text && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm animate-fade-in ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-500/30"
                  : "bg-red-900/30 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-13 rounded-3xl bg-gradient-to-r from-[#0075F8] to-[#00387A] backdrop-blur-[42px] border-3 border-blue-700 text-white font-bold text-sm tracking-wider uppercase transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                SUBMITTING REQUEST...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
