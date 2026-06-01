"use client";

import { useEffect, useState } from "react";
import {
  getGlossaryTerms,
  createGlossaryTermRequest,
} from "@/services/Glossary";

export default function Glossary() {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    term: "",
    definition: "",
    moduleRef: "",
  });

  const load = async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getGlossaryTerms({ search: q });
      const list = res?.data || res?.items || res || [];
      setTerms(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || "Failed to load glossary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await createGlossaryTermRequest(requestForm);
      setRequestOpen(false);
      setRequestForm({ term: "", definition: "", moduleRef: "" });
    } catch (err) {
      setError(err?.message || "Failed to submit term request");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--cx-text)",
          marginBottom: 8,
        }}
      >
        Glossary
      </h1>
      <p style={{ color: "var(--cx-text-muted)", marginBottom: 16 }}>
        Standardized domain terminology linked to relevant modules. Submit
        requests to add new terms — admins review and approve.
      </p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="rf-input"
          style={{ flex: 1, maxWidth: 320 }}
        />
        <button type="submit" className="rf-btn rf-btn-primary">
          Search
        </button>
        <button
          type="button"
          className="rf-btn rf-btn-secondary"
          onClick={() => setRequestOpen((v) => !v)}
        >
          Request term
        </button>
      </form>

      {requestOpen && (
        <form
          onSubmit={handleSubmitRequest}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 16,
            padding: 12,
            border: "1px solid var(--rf-border)",
            borderRadius: 8,
          }}
        >
          <input
            type="text"
            required
            placeholder="Term"
            className="rf-input"
            value={requestForm.term}
            onChange={(e) =>
              setRequestForm((f) => ({ ...f, term: e.target.value }))
            }
          />
          <textarea
            required
            placeholder="Definition"
            className="rf-input"
            rows={3}
            value={requestForm.definition}
            onChange={(e) =>
              setRequestForm((f) => ({ ...f, definition: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Related module (e.g. PhaseReference)"
            className="rf-input"
            value={requestForm.moduleRef}
            onChange={(e) =>
              setRequestForm((f) => ({ ...f, moduleRef: e.target.value }))
            }
          />
          <button type="submit" className="rf-btn rf-btn-primary">
            Submit request
          </button>
        </form>
      )}

      {loading && (
        <div style={{ color: "var(--cx-text-muted)" }}>Loading…</div>
      )}
      {error && <div style={{ color: "var(--rf-red)" }}>{error}</div>}

      {!loading && !error && (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--cx-text)",
              marginBottom: 8,
            }}
          >
            {terms.length} term{terms.length === 1 ? "" : "s"}
          </div>
          <ul style={{ color: "var(--cx-text-muted)" }}>
            {terms.map((t) => (
              <li key={t.id || t.term} style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--cx-text)" }}>
                  {t.term}
                </strong>{" "}
                — {t.definition}
                {t.moduleRef && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>
                    ({t.moduleRef})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
