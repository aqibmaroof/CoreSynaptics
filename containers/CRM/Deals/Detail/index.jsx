"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDealById } from "@/services/Deals";
import { getContactById } from "@/services/Contacts";
import { getCompanyById } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const STAGE_COLORS = {
  QUALIFIED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  NEEDS_ANALYSIS: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  PROPOSAL_QUOTE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  NEGOTIATION: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  CLOSED_WON: "bg-green-500/20 text-green-300 border-green-500/30",
  CLOSED_LOST: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STAGE_LABELS = {
  QUALIFIED: "Qualified",
  NEEDS_ANALYSIS: "Needs Analysis",
  PROPOSAL_QUOTE: "Proposal/Quote",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

const formatCurrency = (val) => {
  if (!val) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
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

export default function DealDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [deal, setDeal] = useState(null);
  const [contact, setContact] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDealById(id)
      .then(async (res) => {
        const data = res?.data ?? res;
        setDeal(data);
        await Promise.allSettled([
          data?.contactId
            ? getContactById(data.contactId).then((r) => setContact(r?.data ?? r)).catch(() => {})
            : Promise.resolve(),
          data?.companyId
            ? getCompanyById(data.companyId).then((r) => setCompany(r?.data ?? r)).catch(() => {})
            : Promise.resolve(),
        ]);
      })
      .catch((err) => setError(err?.message || "Failed to load deal"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Deal not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const stage = deal.stage || "QUALIFIED";
  const stageLabel = STAGE_LABELS[stage] || stage.replace(/_/g, " ");
  const stageColor = STAGE_COLORS[stage] || "bg-gray-600/40 text-gray-300 border-gray-600/40";
  const contactName = contact
    ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
    : null;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Deals
        </button>
      </div>

      {/* Header card */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(deal.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{deal.name}</h1>
              <p className="text-cyan-400 font-bold text-lg mt-0.5">
                {formatCurrency(deal.value)}
              </p>
              <p className="text-gray-400 text-sm">
                {company?.name || "No company"}{contactName ? ` · ${contactName}` : ""}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${stageColor}`}>
            {stageLabel}
          </span>
        </div>
      </div>

      {/* Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Deal Details
          </h2>
          <DetailRow label="Deal Name" value={deal.name} />
          <DetailRow label="Value" value={formatCurrency(deal.value)} />
          <DetailRow label="Stage" value={stageLabel} />
          <DetailRow label="Contact" value={contactName} />
          <DetailRow label="Company" value={company?.name} />
          <DetailRow
            label="Expected Close"
            value={deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : undefined}
          />
          <DetailRow
            label="Created"
            value={deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : undefined}
          />
          <DetailRow
            label="Last Updated"
            value={deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString() : undefined}
          />
          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <p className="text-xs text-gray-500 mb-1">Deal ID</p>
            <p className="text-xs font-mono text-gray-400 break-all">{id}</p>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <ActivityTimeline entityType="deal" entityId={id} />
        </div>
      </div>
    </div>
  );
}
