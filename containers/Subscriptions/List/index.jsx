"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, selectSubscription } from "@/services/Subscriptions";
import { useRouter } from "next/navigation";
import { GetOrganization, GetUser } from "@/services/auth";
import { setOrganization, setUser } from "@/services/instance/tokenService";

const plans = [
  {
    nameColor: "text-emerald-400",
    dividerColor: "border-emerald-400/40",
    buttonClass: "bg-emerald-400 hover:bg-emerald-300 text-white",
    cardClass:
      "bg-gradient-to-bl from-[#00E691] via-[#000]/30 to-[#151515]/0 border border-2 border-white/20",
    glowClass: "shadow-[0_0_60px_rgba(52,211,153,0.15)]",
    modules: ["Projects", "Field Execution", "Documents", "Reports", "Admin"],
  },
  {
    nameColor: "text-blue-400",
    dividerColor: "border-blue-400/40",
    buttonClass: "bg-blue-500 hover:bg-blue-400 text-white",
    cardClass:
      "bg-gradient-to-bl from-[#0075FF] via-[#000]/30 to-[#151515]/0 border border-2 border-white/20",
    glowClass: "shadow-[0_0_60px_rgba(59,130,246,0.15)]",
  },
  {
    nameColor: "text-orange-400",
    dividerColor: "border-orange-400/40",
    buttonClass:
      "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white",
    cardClass:
      "bg-gradient-to-bl from-[#FF8E4E] via-[#000]/30 to-[#151515]/0  border border-2 border-white/20",
    glowClass: "shadow-[0_0_60px_rgba(249,115,22,0.15)]",
  },
];

export default function PricingPlans() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);

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
    }
  };

  return (
    <div className="bg-[url('/images/background.png')] bg-cover bg-center bg-no-repeat min-h-screen flex flex-col items-center justify-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Pricing Plans
        </h1>
        <p className="text-gray-400 text-base">
          Choose the best plan for your business wisely!
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {subscriptions.map((plan, index) => (
          <div
            key={index}
            className={`h-150 rounded-2xl p-6 flex flex-col ${plans[index].cardClass} transition-transform duration-300`}
          >
            {/* Plan Name */}
            <h2 className={`text-2xl font-bold mb-2 ${plans[index].nameColor}`}>
              {plan.name}
            </h2>

            {/* Price */}
            <div className="flex flex-col items-start gap-1 mb-1">
              <span className="text-5xl font-semibold text-white leading-none">
                ${plan.price || "20"}
              </span>
              <span className="text-gray-400 text-sm mb-1">
                Projects Limit: {plan.projectLimit || "♾️"}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Users Limit: {plan.userLimit || "♾️"}
            </p>

            {/* Divider */}
            <div className={`border-t ${plans[index].dividerColor} mb-4`} />

            {/* Features */}
            <div className="flex flex-col gap-2 text-gray-300 text-sm mb-4">
              {Object.entries(plan?.features).map(([key, value]) => (
                <div key={key}>
                  <span>{key}</span>: <span>{String(value)}</span>
                </div>
              ))}
            </div>

            {/* Modules */}
            <div className="flex flex-col gap-2 text-sm flex-1">
              <p className={`font-bold ${plans[index].nameColor}`}>
                Modules Included
              </p>
              {plan.moduleAccess.map((mod) => (
                <p key={mod} className="text-gray-300">
                  {mod}
                </p>
              ))}
            </div>

            {/* Button */}
            <div className="mt-8">
              <button
                onClick={() => SelectSubscription(plan?.id)}
                className={`w-auto px-8 py-2.5 rounded-xl text-sm font-semibold transition-all translate-y-10 duration-200 cursor-pointer ${plans[index].buttonClass}`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
