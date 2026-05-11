"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getContactById } from "@/services/Contacts";
import { getCompanyById } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

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

export default function ContactDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [contact, setContact] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getContactById(id)
      .then(async (res) => {
        const data = res?.data ?? res;
        setContact(data);
        if (data?.companyId) {
          try {
            const c = await getCompanyById(data.companyId);
            setCompany(c?.data ?? c);
          } catch {}
        }
      })
      .catch((err) => setError(err?.message || "Failed to load contact"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Contact not found"}</p>
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

  const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  const initials = `${(contact.firstName || "?")[0]}${(contact.lastName || "")[0] || ""}`.toUpperCase();

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
          Back to Contacts
        </button>
      </div>

      {/* Header card */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {contact.jobTitle || "No job title"}{company ? ` · ${company.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Contact Details
          </h2>
          <DetailRow label="First Name" value={contact.firstName} />
          <DetailRow label="Last Name" value={contact.lastName} />
          <DetailRow label="Email" value={contact.email} />
          <DetailRow label="Phone" value={contact.phone} />
          <DetailRow label="Job Title" value={contact.jobTitle} />
          <DetailRow label="Company" value={company?.name} />
          <DetailRow
            label="Created"
            value={contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : undefined}
          />
          <DetailRow
            label="Last Updated"
            value={contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString() : undefined}
          />
          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <p className="text-xs text-gray-500 mb-1">Contact ID</p>
            <p className="text-xs font-mono text-gray-400 break-all">{id}</p>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
          <ActivityTimeline entityType="contact" entityId={id} />
        </div>
      </div>
    </div>
  );
}
