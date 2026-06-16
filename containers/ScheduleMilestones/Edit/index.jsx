"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getMilestoneById,
  updateMilestone,
} from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";

const MILESTONE_TYPES = [
  { value: "INTERNAL", label: "Internal — tracking only" },
  { value: "CONTRACT", label: "Contract — client-facing deadline" },
  { value: "OPS", label: "OPS — internal ops target" },
];

function toArr(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
}

// ─── rf-token style atoms (theme-aware light/dark) ───────────────────────────
const sCard = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border)",
  borderRadius: 14,
};
const sLabel = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--rf-txt3)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 7,
};
const sInput = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--rf-bg)",
  border: "1px solid var(--rf-border)",
  borderRadius: 9,
  color: "var(--rf-txt)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
const sBtnPrimary = {
  padding: "10px 20px",
  borderRadius: 9,
  border: "none",
  background: "var(--rf-accent)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const sBtnGhost = {
  padding: "10px 20px",
  borderRadius: 9,
  border: "1px solid var(--rf-border)",
  background: "var(--rf-bg3)",
  color: "var(--rf-txt2)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function Chevron() {
  return (
    <svg
      style={{
        pointerEvents: "none",
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--rf-txt3)",
      }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      className="animate-spin"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function ScheduleMilestoneEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [phases, setPhases] = useState([]);
  const [phasesLoading, setPhasesLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "INTERNAL",
    isCritical: false,
    phaseId: "",
    projectId: "",
  });
  const [detachPhase, setDetachPhase] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMilestoneById(id)
      .then((ms) => {
        const projectId = ms.projectId ?? "";
        setForm({
          name: ms.name ?? "",
          date: ms.date ? ms.date.slice(0, 10) : "",
          type: ms.type ?? "INTERNAL",
          isCritical: ms.isCritical ?? false,
          phaseId: ms.phaseId ?? "",
          projectId,
        });
        setPhasesLoading(true);
        const params = projectId ? { projectId } : {};
        return listPhases(params);
      })
      .then((d) => setPhases(toArr(d)))
      .catch((err) => setError(err?.message || "Failed to load milestone"))
      .finally(() => {
        setFetching(false);
        setPhasesLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.date) payload.date = new Date(form.date).toISOString();
      payload.type = form.type;
      payload.isCritical = form.isCritical;

      if (detachPhase) {
        payload.phaseId = null;
      } else if (form.phaseId) {
        payload.phaseId = form.phaseId;
      }

      await updateMilestone(id, payload);
      router.push("/ScheduleMilestones/List");
    } catch (err) {
      setError(err?.message || "Failed to update milestone");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--rf-accent)",
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 9,
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border)",
            color: "var(--rf-txt2)",
            cursor: "pointer",
          }}
        >
          <svg
            width="18"
            height="18"
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
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: "var(--rf-txt)",
          }}
        >
          Edit Milestone
        </h1>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            color: "var(--rf-red)",
            fontSize: 13,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ ...sCard, padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>Milestone Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={sInput}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>Target Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            style={sInput}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>Type</label>
          <div style={{ position: "relative" }}>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                ...sInput,
                appearance: "none",
                paddingRight: 32,
                cursor: "pointer",
              }}
            >
              {MILESTONE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            name="isCritical"
            type="checkbox"
            checked={form.isCritical}
            onChange={handleChange}
            style={{
              width: 16,
              height: 16,
              accentColor: "var(--rf-accent)",
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: 14, color: "var(--rf-txt2)" }}>
            Mark as Critical Path
          </span>
        </label>

        {/* Phase dropdown */}
        <div style={{ marginBottom: 22 }}>
          <label style={sLabel}>Phase (optional)</label>
          <div style={{ position: "relative" }}>
            <select
              name="phaseId"
              value={form.phaseId}
              onChange={handleChange}
              disabled={detachPhase || phasesLoading}
              style={{
                ...sInput,
                appearance: "none",
                paddingRight: 32,
                cursor: detachPhase || phasesLoading ? "default" : "pointer",
                opacity: detachPhase || phasesLoading ? 0.5 : 1,
              }}
            >
              <option value="">
                {phasesLoading
                  ? "Loading phases…"
                  : phases.length === 0
                    ? "No phases available"
                    : "— Unlinked —"}
              </option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.id}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={detachPhase}
              onChange={(e) => setDetachPhase(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: "var(--rf-red)",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: 13, color: "var(--rf-txt3)" }}>
              Detach from current phase (sends{" "}
              <code
                style={{
                  fontSize: 12,
                  background: "var(--rf-bg3)",
                  padding: "1px 5px",
                  borderRadius: 4,
                  color: "var(--rf-txt2)",
                }}
              >
                phaseId: null
              </code>
              )
            </span>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            paddingTop: 4,
          }}
        >
          <button type="button" onClick={() => router.back()} style={sBtnGhost}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...sBtnPrimary, opacity: loading ? 0.6 : 1 }}
          >
            {loading && <Spinner />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
