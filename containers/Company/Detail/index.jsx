"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanyById } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const TYPE_TOKENS = {
  CLIENT: "var(--rf-accent)",
  SUBCONTRACTOR: "var(--rf-orange)",
  VENDOR: "var(--rf-purple)",
  PARTNER: "var(--rf-teal)",
  CONSULTANT: "var(--rf-yellow)",
  OTHER: "var(--rf-txt3)",
};

function badgeStyle(token) {
  return {
    background: `color-mix(in srgb, ${token} 14%, transparent)`,
    color: token,
    border: `1px solid color-mix(in srgb, ${token} 32%, transparent)`,
  };
}

function getTypeStyle(type) {
  return badgeStyle(TYPE_TOKENS[type] || TYPE_TOKENS.OTHER);
}

function DetailRow({ label, value }) {
  return (
    <div
      className="flex items-start justify-between py-3 border-b last:border-0"
      style={{ borderColor: "var(--rf-border)" }}
    >
      <span
        className="text-xs font-bold uppercase tracking-wider w-40 shrink-0"
        style={{ color: "var(--rf-txt3)" }}
      >
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: "var(--rf-txt)" }}>
        {value ?? "—"}
      </span>
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
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--rf-accent)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--rf-red)" }}>
            {error || "Company not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="text-sm underline"
            style={{ color: "var(--rf-accent)" }}
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
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: "var(--rf-txt2)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--rf-txt)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--rf-txt2)";
          }}
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
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          style={{ background: "var(--rf-accent)", color: "#fff" }}
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
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border2)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{ background: "var(--rf-accent)", color: "#fff" }}
            >
              {(company.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--rf-txt)" }}
              >
                {company.name}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--rf-txt2)" }}>
                {company.region || "No region set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {company.type && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={getTypeStyle(company.type)}
              >
                {company.type}
              </span>
            )}
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={badgeStyle(
                company.subscriptionActive ? "var(--rf-green)" : "var(--rf-red)",
              )}
            >
              {company.subscriptionActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Details + Timeline two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border2)",
          }}
        >
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "var(--rf-txt2)" }}
          >
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
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: "var(--rf-border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--rf-txt3)" }}>
              Company ID
            </p>
            <p
              className="text-xs font-mono break-all"
              style={{ color: "var(--rf-txt2)" }}
            >
              {id}
            </p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border2)",
          }}
        >
          <ActivityTimeline entityType="company" entityId={id} />
        </div>
      </div>
    </div>
  );
}
