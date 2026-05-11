"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanyById } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const TYPE_COLORS = {
  CLIENT: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SUBCONTRACTOR: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  VENDOR: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  PARTNER: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  CONSULTANT: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  OTHER: "bg-gray-600/40 text-gray-300 border-gray-600/40",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-800/60 last:border-0">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-200 text-right">{value ?? "—"}</span>
    </div>
  );
}

export default function CompanyDetail() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCompanyById(id)
      .then((res) => setCompany(res?.data ?? res))
      .catch((err) => setError(err?.message || "Failed to load company"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Company not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Companies
        </button>
        <Link
          href={`/Company/Edit/${id}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit Company
        </Link>
      </div>

      {/* Company header */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(company.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {company.region || "No region set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {company.type && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${TYPE_COLORS[company.type] || TYPE_COLORS.OTHER}`}
              >
                {company.type}
              </span>
            )}
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                company.subscriptionActive
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
              }`}
            >
              {company.subscriptionActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Details + Timeline two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Company Details
          </h2>
          <div>
            <DetailRow label="Name" value={company.name} />
            <DetailRow label="Type" value={company.type} />
            <DetailRow label="Region" value={company.region} />
            <DetailRow
              label="Subscription Plan"
              value={company.subscriptionPlan || "None"}
            />
            <DetailRow
              label="Subscription"
              value={company.subscriptionActive ? "Active" : "Inactive"}
            />
            {company.subscriptionExpiresAt && (
              <DetailRow
                label="Expires"
                value={new Date(
                  company.subscriptionExpiresAt,
                ).toLocaleDateString()}
              />
            )}
            <DetailRow
              label="Created"
              value={
                company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString()
                  : undefined
              }
            />
            <DetailRow
              label="Last Updated"
              value={
                company.updatedAt
                  ? new Date(company.updatedAt).toLocaleDateString()
                  : undefined
              }
            />
          </div>

          {/* ID */}
          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <p className="text-xs text-gray-500 mb-1">Company ID</p>
            <p className="text-xs font-mono text-gray-400 break-all">{id}</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <ActivityTimeline entityType="company" entityId={id} />
        </div>
      </div>
    </div>
  );
}
