"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import config from "../../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { GetUser, GetOrganization, AcceptInvite } from "../../../services/auth";
import {
  setOrganization,
  setUser,
} from "../../../services/instance/tokenService";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rememberMe, setRememberMe] = useState(false);

  // State to hold the login payload
  const [formData, setFormData] = useState({
    token: token,
    password: "",
  });

  // Load saved credentials on component mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = () => {
    try {
      const savedEmail = localStorage.getItem("rememberedEmail");
      const savedPassword = localStorage.getItem("rememberedPassword");
      const wasRemembered = localStorage.getItem("rememberMe") === "true";

      if (wasRemembered && savedEmail) {
        setFormData((prev) => ({
          ...prev,
          email: savedEmail,
          password: savedPassword || "",
        }));
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Error loading saved credentials:", error);
    }
  };

  /**
   * Save credentials to localStorage
   * Called when user successfully logs in with "Remember Me" checked
   */
  const saveCredentials = () => {
    try {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
        localStorage.setItem("rememberMe", "true");
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        clearSavedCredentials();
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  /**
   * Clear saved credentials from localStorage
   * Called when user unchecks "Remember Me" or logs out
   */
  const clearSavedCredentials = () => {
    try {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    } catch (error) {
      console.error("Error clearing credentials:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    // If unchecking, immediately clear saved credentials
    if (!checked) {
      clearSavedCredentials();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await AcceptInvite(formData);
      if (response) {
        setMessage({ type: "success", text: "Login successful! 🚀" });

        // Save credentials if "Remember Me" is checked
        saveCredentials();

        const userResponse = await GetUser();
        setUser({ user: userResponse });
        if (userResponse?.organizationName) {
          const organizationResponse = await GetOrganization();
          setOrganization({ organization: organizationResponse });
        }
        setTimeout(() => router.push("/"), 2000);
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Login failed.",
        });

        // Don't save credentials on failed login
        if (rememberMe) {
          clearSavedCredentials();
          setRememberMe(false);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: Array.isArray(error?.message)
          ? error?.message?.[0]
          : error?.message || "An error occurred during login.",
      });

      // Don't save credentials on error
      if (rememberMe) {
        clearSavedCredentials();
        setRememberMe(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
            Enter your email and password to sign in
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Password Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-lg text-[#101437] dark:text-white">
                Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                className="input w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 pr-12 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <fieldset className="fieldset">
              <label className="label text-[#FFFFFF] text-[12px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="toggle border-blue-100 h-5 bg-blue-100 text-[#0075FF] checked:border-[#0075FF] checked:bg-[#0075FF] checked:text-[#fff]"
                />
                Remember me
              </label>
            </fieldset>
            <fieldset className="fieldset">
              <a
                href="/Auth/ForgotPassword"
                className="label text-[#FFFFFF] text-[12px]"
              >
                Forgot Password ?
              </a>
            </fieldset>
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
                SIGNING IN...
              </span>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
