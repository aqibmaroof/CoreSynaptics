"use client";
import { useState } from "react";
import Link from "next/link";
import config from "../../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPassword } from "../../../services/auth";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State to hold the login payload
  const [formData, setFormData] = useState({
    token: token,
    newPassword: "",
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
      const payload = {
        token: formData?.token,
        newPassword: formData?.newPassword,
      };
      const response = await ResetPassword(payload);
      console.log(response);
      if (response) {
        setMessage({ type: "success", text: "Password reset successful! 🚀" });
        router.push("/Auth/Login");
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Password reset failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: Array.isArray(error?.message)
          ? error?.message?.[0]
          : error?.message || "An error occurred during password reset.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div
      className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans"
      style={{ fontFamily: "'Exo 2', sans-serif" }}
    >
      {/* ══ LEFT PANEL ══ */}
      <section className="hidden lg:flex flex-col items-center justify-center relative w-1/2 bg-slate-900 overflow-hidden p-10">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,180,220,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,180,220,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "38px 38px",
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-700" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-700" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-700" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-700" />

        {/* Circular logo icon */}
        <div className="w-28 h-28 mb-7 relative z-10">
          <svg
            viewBox="0 0 110 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Glow backdrop */}
            <circle
              cx="55"
              cy="55"
              r="32"
              fill="rgba(0,180,255,0.10)"
              style={{
                animation: "pulse 2s ease-in-out infinite",
                filter: "blur(12px)",
              }}
            />

            {/* Outer dashed ring */}
            <g
              style={{
                animation: "spin 8s linear infinite",
                transformOrigin: "50% 50%",
              }}
            >
              <circle
                cx="55"
                cy="55"
                r="50"
                stroke="rgba(0,180,220,0.18)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            </g>

            {/* Mid ring with gaps */}
            <g
              style={{
                animation: "spin-reverse 5s linear infinite",
                transformOrigin: "50% 50%",
              }}
            >
              <circle
                cx="55"
                cy="55"
                r="40"
                stroke="rgba(0,212,255,0.28)"
                strokeWidth="1.2"
                strokeDasharray="10 4"
              />
            </g>

            {/* Solid arcs (the "C" shape) */}
            <path
              d="M 55 18 A 37 37 0 1 1 20 55"
              stroke="#00d4ff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Inner arc */}
            <path
              d="M 55 30 A 25 25 0 1 1 30 55"
              stroke="#0090bb"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Dot on arc end */}
            <circle cx="20" cy="55" r="4" fill="#00d4ff" />
            <circle cx="30" cy="55" r="2.5" fill="#00aadd" />

            {/* Small accent tick */}
            <line
              x1="55"
              y1="14"
              x2="55"
              y2="22"
              stroke="#00d4ff"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Inner filled ring */}
            <circle
              cx="55"
              cy="55"
              r="10"
              fill="rgba(0,60,90,0.7)"
              stroke="#00d4ff"
              strokeWidth="1.5"
            />
            <circle cx="55" cy="55" r="4" fill="#00d4ff" />
          </svg>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes spin-reverse {
              to { transform: rotate(-360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.5; filter: blur(12px); }
              50% { opacity: 1; filter: blur(18px); }
            }
          `}</style>
        </div>

        {/* Brand */}
        <div className="text-center mb-9 relative z-10">
          <div
            className="text-4xl font-bold mb-1 tracking-widest"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.12em",
            }}
          >
            <span className="text-white">CORE</span>
            <span className="text-cyan-400">SYNAPTICS</span>
          </div>
          <div
            className="text-xs text-slate-400 mt-1 uppercase"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: "0.35em",
            }}
          >
            ExControl &nbsp;·&nbsp; Data Center Commissioning ERP
          </div>
        </div>

        {/* Feature bullets */}
        <ul
          className="text-left w-full max-w-xs mb-11 relative z-10 space-y-2"
          style={{ listStyle: "none" }}
        >
          <li
            className="flex items-center gap-3 text-xs font-light tracking-wider"
            style={{ color: "#7ab8cc" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }}
            />
            Phase Gate Enforcement L1 → L5
          </li>
          <li
            className="flex items-center gap-3 text-xs font-light tracking-wider"
            style={{ color: "#7ab8cc" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }}
            />
            Real-Time TARF Site Access
          </li>
          <li
            className="flex items-center gap-3 text-xs font-light tracking-wider"
            style={{ color: "#7ab8cc" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }}
            />
            OEM Multi-Site Portfolio
          </li>
          <li
            className="flex items-center gap-3 text-xs font-light tracking-wider"
            style={{ color: "#7ab8cc" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }}
            />
            AI Fault Diagnosis + Reporting
          </li>
          <li
            className="flex items-center gap-3 text-xs font-light tracking-wider"
            style={{ color: "#7ab8cc" }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }}
            />
            Smart Import — CxAlloy · Procore
          </li>
        </ul>

        {/* Tagline */}
        <div className="text-center relative z-10">
          <p
            className="text-base font-medium text-cyan-100"
            style={{ letterSpacing: "0.03em" }}
          >
            Mission-critical commissioning.
          </p>
          <p
            className="text-base font-semibold text-cyan-400"
            style={{ letterSpacing: "0.03em" }}
          >
            Built for the industry.
          </p>
        </div>

        {/* Bottom ticker */}
        <div
          className="absolute bottom-0 left-0 right-0 h-6 border-t border-slate-600 flex items-center overflow-hidden"
          style={{
            borderTopColor: "rgba(0,180,220,0.22)",
          }}
        >
          <div
            className="whitespace-nowrap"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.52rem",
              color: "#4a7a92",
              letterSpacing: "0.18em",
              animation: "ticker-scroll 22s linear infinite",
            }}
          >
            CORESYNAPTICS™ &nbsp;·&nbsp; EXCONTROL v1.8 &nbsp;·&nbsp; DC
            COMMISSIONING PLATFORM &nbsp;·&nbsp; SECURE SESSION &nbsp;·&nbsp;
            PHASE GATE ENFORCEMENT &nbsp;·&nbsp; REAL-TIME TARF
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <style>{`
            @keyframes ticker-scroll {
              from { transform: translateX(100vw); }
              to { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      </section>

      {/* ══ DIVIDER ══ */}
      <div
        className="w-px"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0,180,220,0.22) 15%,
            #0a8aaa 50%,
            rgba(0,180,220,0.22) 85%,
            transparent 100%
          )`,
        }}
      />

      {/* ══ RIGHT PANEL ══ */}
      <section
        className="flex-1 flex flex-col items-center justify-center relative p-12"
        style={{ backgroundColor: "#050f1a" }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "340px",
            height: "340px",
            background:
              "radial-gradient(circle, rgba(0,160,200,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-xs">
          {/* Form Title */}
          <h1
            className="text-5xl font-bold text-white mb-1 tracking-widest"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            Reset Password
          </h1>
          <p
            className="text-xs text-slate-400 mb-8 uppercase tracking-wider"
            style={{ color: "#4a7a92", letterSpacing: "0.06em" }}
          >
            Enter your new password to reset your account Password{" "}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="mb-4 relative">
              <label
                className="block text-xs uppercase tracking-wider mb-2"
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  color: "#5a9ab5",
                  fontSize: "0.6rem",
                  letterSpacing: "0.22em",
                }}
                htmlFor="password"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full px-3.5 py-2.5 rounded border text-sm transition-all outline-none"
                style={{
                  backgroundColor: "rgba(0,30,50,0.7)",
                  borderColor: "rgba(0,180,220,0.22)",
                  color: "#c8eaf5",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.8rem",
                  letterSpacing: "0.04em",
                  paddingRight: "42px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00d4ff";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(0,212,255,0.18), inset 0 0 8px rgba(0,212,255,0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,180,220,0.22)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-10 text-slate-400 hover:text-cyan-400 transition-colors"
                style={{ color: "#5a9ab5" }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {/* Status Messages */}
            {message.text && (
              <div
                className="mb-4 p-3 rounded text-xs transition-all"
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  backgroundColor:
                    message.type === "success"
                      ? "rgba(0, 255, 136, 0.1)"
                      : "rgba(255, 100, 100, 0.1)",
                  color: message.type === "success" ? "#00ff88" : "#ff6464",
                  border:
                    message.type === "success"
                      ? "1px solid rgba(0, 255, 136, 0.3)"
                      : "1px solid rgba(255, 100, 100, 0.3)",
                  animation: "fadeIn 0.3s ease-in",
                }}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                backgroundColor: loading ? "#0088aa" : "#00d4ff",
                color: "#020d16",
                fontSize: "0.95rem",
                letterSpacing: "0.2em",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#10eaff";
                  e.target.style.boxShadow = "0 0 22px rgba(0,212,255,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#00d4ff";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Reseting Password...
                </>
              ) : (
                <>
                  Reset Password <span style={{ fontSize: "1.1rem" }}>→</span>
                </>
              )}
            </button>

            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </form>

          {/* Forgot Password & Register */}
          <div className="mt-4 text-center flex flex-col gap-2 items-center justify-center">
            <a
              href="/Auth/Register"
              className="text-xs transition-colors"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                color: "#4a7a92",
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#00ff88")}
              onMouseLeave={(e) => (e.target.style.color = "#4a7a92")}
            >
              Create New Account
            </a>
          </div>

          {/* Footer */}
          <div
            className="mt-12 text-center"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            <p
              style={{
                fontSize: "0.55rem",
                color: "#4a7a92",
                letterSpacing: "0.12em",
                lineHeight: "1.9",
              }}
            >
              CoreSynaptics® &nbsp; ExControl v1.8 &nbsp; DC Commissioning
              Platform
            </p>
            <p
              style={{
                fontSize: "0.5rem",
                color: "rgba(74,122,146,0.55)",
                marginTop: "4px",
              }}
            >
              © 2025 CoreSynaptics Inc. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
