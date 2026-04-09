"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, selectSubscription } from "@/services/Subscriptions";
import { useRouter } from "next/navigation";
import { GetOrganization, GetUser } from "@/services/auth";
import { setOrganization, setUser } from "@/services/instance/tokenService";

const plans = [
  {
    nameColor: "#00d4ff",
    accentColor: "#00ff88",
    borderColor: "rgba(0,180,220,0.22)",
    glowColor: "rgba(0,212,255,0.1)",
  },
  {
    nameColor: "#00d4ff",
    accentColor: "#00ff88",
    borderColor: "rgba(0,180,220,0.22)",
    glowColor: "rgba(0,212,255,0.1)",
  },
  {
    nameColor: "#00d4ff",
    accentColor: "#00ff88",
    borderColor: "rgba(0,180,220,0.22)",
    glowColor: "rgba(0,212,255,0.1)",
  },
];

export default function PricingPlans() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    GetAllSubscriptions();
  }, []);

  const GetAllSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      console.log(res?.data);
      setSubscriptions(res.data);
    } catch (error) {
      console.error("error Fetching subscritpions", error.message);
    }
  };

  const SelectSubscription = async (id) => {
    try {
      setLoadingId(id);
      const payload = {
        subscriptionPlanId: id,
      };
      await selectSubscription(payload);
      const userResponse = await GetUser();
      const organizationResponse = await GetOrganization();
      setUser({ user: userResponse });
      setOrganization({ organization: organizationResponse });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.log("error selecting subscription : ", error);
      setLoadingId(null);
    }
  };

  return (
    <div
      className="text-white min-h-screen flex flex-col items-center justify-center py-5 px-4"
      style={{ backgroundColor: "#020d16" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <div className="text-center mb-7 relative z-10">
        <h1
          className="text-5xl font-bold mb-3 tracking-wider"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: "0.12em",
            color: "#fff",
          }}
        >
          PRICING PLANS
        </h1>
        <p
          className="text-lg"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: "#4a7a92",
            letterSpacing: "0.06em",
          }}
        >
          Choose the best plan for your organization
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
        {subscriptions.map((plan, index) => (
          <div
            key={index}
            className="rounded-lg border transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: "rgba(5,15,26,0.8)",
              borderColor: plans[index].borderColor,
              backdropFilter: "blur(10px)",
              boxShadow: `0 0 30px ${plans[index].glowColor}`,
            }}
          >
            {/* Card Content */}
            <div className="p-8 flex flex-col h-full">
              {/* Plan Name */}
              <h2
                className="text-2xl font-bold mb-2 tracking-wide"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  color: plans[index].nameColor,
                  letterSpacing: "0.08em",
                }}
              >
                {plan.name}
              </h2>

              {/* Divider */}
              <div
                className="h-px mb-6"
                style={{
                  background: `linear-gradient(90deg, ${plans[index].nameColor} 0%, transparent 100%)`,
                  opacity: "0.3",
                }}
              />

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="text-4xl font-bold"
                    style={{
                      color: "#c8eaf5",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    ${plan.price || "0"}
                  </span>
                  <span
                    style={{
                      color: "#4a7a92",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    / month
                  </span>
                </div>
              </div>

              {/* Limits */}
              <div className="mb-6 space-y-2">
                <div
                  className="text-sm"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    color: "#7ab8cc",
                  }}
                >
                  <span style={{ color: "#5a9ab5" }}>Projects: </span>
                  <span style={{ color: "#c8eaf5" }}>
                    {plan.projectLimit || "Unlimited"}
                  </span>
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    color: "#7ab8cc",
                  }}
                >
                  <span style={{ color: "#5a9ab5" }}>Users: </span>
                  <span style={{ color: "#c8eaf5" }}>
                    {plan.userLimit || "Unlimited"}
                  </span>
                </div>
              </div>

              {/* Features Divider */}
              <div
                className="h-px my-6"
                style={{
                  borderTop: `1px solid ${plans[index].borderColor}`,
                }}
              />

              {/* Features */}
              <div className="mb-8 flex-1">
                <p
                  className="text-xs font-bold mb-3 uppercase tracking-wider"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    color: plans[index].nameColor,
                    letterSpacing: "0.2em",
                  }}
                >
                  Features
                </p>
                <div className="space-y-2">
                  {Object.entries(plan?.features || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-xs flex justify-between items-center"
                      style={{
                        fontFamily: "'Exo 2', sans-serif",
                        color: "#7ab8cc",
                      }}
                    >
                      <span style={{ color: "#5a9ab5" }}>{key}:</span>
                      <span
                        className="font-semibold"
                        style={{
                          color: plans[index].accentColor,
                        }}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              {plan.moduleAccess && plan.moduleAccess.length > 0 && (
                <div className="mb-8">
                  <p
                    className="text-xs font-bold mb-3 uppercase tracking-wider"
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      color: plans[index].nameColor,
                      letterSpacing: "0.2em",
                    }}
                  >
                    Modules Included
                  </p>
                  <div className="space-y-2">
                    {plan.moduleAccess.map((mod) => (
                      <div
                        key={mod}
                        className="text-xs flex items-center gap-2"
                        style={{
                          fontFamily: "'Exo 2', sans-serif",
                          color: "#7ab8cc",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: plans[index].accentColor,
                            boxShadow: `0 0 4px ${plans[index].accentColor}`,
                          }}
                        />
                        {mod}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Button */}
              <button
                onClick={() => SelectSubscription(plan?.id)}
                disabled={loadingId !== null}
                className="w-full py-3 rounded font-bold text-sm uppercase tracking-wider transition-all"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  backgroundColor:
                    loadingId === plan?.id ? "#0088aa" : "#00d4ff",
                  color: "#020d16",
                  fontSize: "0.9rem",
                  letterSpacing: "0.2em",
                  cursor: loadingId !== null ? "not-allowed" : "pointer",
                  opacity: loadingId === plan?.id ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loadingId === null) {
                    e.target.style.backgroundColor = "#10eaff";
                    e.target.style.boxShadow = "0 0 22px rgba(0,212,255,0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (loadingId === null) {
                    e.target.style.backgroundColor = "#00d4ff";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {loadingId === plan?.id ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
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
                    SELECTING...
                  </span>
                ) : (
                  <>SELECT PLAN →</>
                )}
              </button>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <p
        className="mt-7 text-center"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          color: "#4a7a92",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
        }}
      >
        All plans include 24/7 support and can be upgraded or downgraded anytime
      </p>
    </div>
  );
}
