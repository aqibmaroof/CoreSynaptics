"use client";

import { useState, useEffect } from "react";
import SubmittalEditForm from "@/components/EditSubmittalsForm";
import EntityApprovals from "@/components/EntityApprovals";
import RelatedSidebar from "@/components/RelatedSidebar";
import CopilotPanel from "@/components/CopilotPanel";
import WhyTab from "@/components/WhyTab";
import LineageTab from "@/components/LineageTab";
import ContextPanel from "@/components/ContextPanel";
import EntityRecommendationsPanel from "@/components/EntityRecommendationsPanel";
import FederatedBadge from "@/components/FederatedBadge";
import ComplianceHoldBadge from "@/components/ComplianceHoldBadge";
import { updateSubmittal, getSubmittalById } from "@/services/Submittals";
import { getProjects } from "@/services/Projects";
import { getCompanies } from "@/services/Companies";
import { getUsers } from "@/services/Users";
import { useParams } from "next/navigation";

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.users ?? data?.companies ?? []);
}

export default function EditSubmittalContainer() {
  const params = useParams();
  const submittalId = params.id;

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [message, setMessage] = useState(null);

  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  // Load dropdown data and submittal in parallel
  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
    getCompanies()
      .then((d) => setCompanies(toArray(d)))
      .catch(() => {});
    getUsers()
      .then((d) => setUsers(toArray(d)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!submittalId) return;
    getSubmittalById(submittalId)
      .then((data) => setInitialData(data))
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load submittal" }),
      );
  }, [submittalId]);

  const handleUpdate = async (data) => {
    try {
      setLoading(true);
      setMessage(null);
      await updateSubmittal(submittalId, data);
      setMessage({ type: "success", text: "Submittal updated successfully" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to update submittal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2 text-white">Edit Submittal</h1>
      <p className="text-gray-300 mb-6">Update fields to update records</p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-900/20 border-green-500/30 text-green-300"
              : "bg-red-900/20 border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <SubmittalEditForm
        data={initialData}
        onSubmit={handleUpdate}
        loading={loading}
        projects={projects}
        companies={companies}
        users={users}
      />

      {submittalId && (
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 16,
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <EntityApprovals
              entityType="Submittal"
              entityId={submittalId}
              cxProjectId={initialData?.cxProjectId}
            />
            <LineageTab entityType="Submittal" entityId={submittalId} />
            <WhyTab subjectType="Submittal" subjectId={submittalId} />
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <FederatedBadge entityType="Submittal" entityId={submittalId} />
              <ComplianceHoldBadge
                entityType="Submittal"
                entityId={submittalId}
                cxProjectId={initialData?.cxProjectId}
              />
            </div>
            <EntityRecommendationsPanel
              entityType="Submittal"
              entityId={submittalId}
              cxProjectId={initialData?.cxProjectId}
            />
            <CopilotPanel entityType="Submittal" entityId={submittalId} />
            <ContextPanel entityType="Submittal" entityId={submittalId} />
            <RelatedSidebar entityType="Submittal" entityId={submittalId} />
          </div>
        </div>
      )}
    </div>
  );
}
