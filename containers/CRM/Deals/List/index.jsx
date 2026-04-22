"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDeals, createDeal, updateDeal, deleteDeal } from "@/services/Deals";
import { getContactsByCompany, getContacts } from "@/services/Contacts";
import { getCompanies, getCompanyById } from "@/services/Companies";
import CompanySelect from "@/components/CRM/CompanySelect";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const STAGES = [
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Needs Analysis", value: "NEEDS_ANALYSIS" },
  { label: "Proposal/Quote", value: "PROPOSAL_QUOTE" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Closed Won", value: "CLOSED_WON" },
  { label: "Closed Lost", value: "CLOSED_LOST" },
];

const STAGE_COLORS = {
  QUALIFIED: {
    dot: "bg-blue-400",
    col: "border-blue-600/40",
    badge: "bg-blue-500/20 text-blue-300",
  },
  NEEDS_ANALYSIS: {
    dot: "bg-orange-400",
    col: "border-orange-600/40",
    badge: "bg-orange-500/20 text-orange-300",
  },
  PROPOSAL_QUOTE: {
    dot: "bg-yellow-400",
    col: "border-yellow-600/40",
    badge: "bg-yellow-500/20 text-yellow-300",
  },
  NEGOTIATION: {
    dot: "bg-cyan-400",
    col: "border-cyan-600/40",
    badge: "bg-cyan-500/20 text-cyan-300",
  },
  CLOSED_WON: {
    dot: "bg-green-400",
    col: "border-green-600/40",
    badge: "bg-green-500/20 text-green-300",
  },
  CLOSED_LOST: {
    dot: "bg-red-400",
    col: "border-red-600/40",
    badge: "bg-red-500/20 text-red-300",
  },
};

const EMPTY_FORM = {
  name: "",
  companyId: "",
  contactId: "",
  value: "",
  stage: "QUALIFIED",
  expectedCloseDate: "",
};

const formatCurrency = (val) => {
  if (!val) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function DealsList() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [timelineEntity, setTimelineEntity] = useState(null); // { id, name }

  const [form, setForm] = useState(EMPTY_FORM);

  // Drag state
  const dragIdRef = useRef(null);
  // Cache full lists so we can restore them when selections are cleared
  const allContactsRef = useRef([]);
  const allCompaniesRef = useRef([]);

  // Mount: load deals, all companies, and all contacts in parallel
  useEffect(() => {
    fetchDeals();
    getCompanies()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        allCompaniesRef.current = list;
        setCompanies(list);
      })
      .catch(() => {});
    getContacts()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        allContactsRef.current = list;
        setContacts(list);
      })
      .catch(() => {});
  }, []);

  // Company selected → filter contacts to that company; restore all when cleared
  useEffect(() => {
    if (!form.companyId) {
      setContacts(allContactsRef.current);
      return;
    }
    getContactsByCompany(form.companyId)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setContacts(list);
        // Clear contact selection if it doesn't belong to this company
        setForm((prev) => {
          const selectedId = prev.contactId?.id || prev.contactId;
          if (selectedId && !list.find((c) => c.id === selectedId)) {
            return { ...prev, contactId: "" };
          }
          return prev;
        });
      })
      .catch(() => {});
  }, [form.companyId]);

  // Contact selected → fetch its company, show it in company dropdown and auto-set companyId
  // Contact cleared → restore all companies
  useEffect(() => {
    const contactObj = form.contactId;
    if (!contactObj) {
      // Contact cleared — restore all companies (unless company was manually chosen)
      setCompanies(allCompaniesRef.current);
      return;
    }
    const companyId = contactObj?.companyId;
    if (!companyId) return;
    getCompanyById(companyId)
      .then((res) => {
        const company = res?.data ?? res;
        if (!company) return;
        // Show only the contact's company in the dropdown and auto-select it
        setCompanies([company]);
        setForm((prev) => ({ ...prev, companyId: company.id }));
      })
      .catch(() => {});
  }, [form.contactId]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await getDeals();
      setDeals(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingDeal(null);
  };
  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };
  const openEdit = (deal) => {
    // Resolve full contact object from cached list if possible
    const contactObj =
      allContactsRef.current.find((c) => c.id === deal.contactId) || "";
    setForm({
      name: deal.name || "",
      companyId: deal.companyId || "",
      contactId: contactObj,
      value: deal.value || "",
      stage: deal.stage || "QUALIFIED",
      expectedCloseDate: deal.expectedCloseDate?.split("T")[0] || "",
    });
    setEditingDeal(deal);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      setMessage({ type: "error", text: "Deal name is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        // contactId in form is the full object; API needs just the UUID
        contactId:
          form.contactId?.id ||
          (typeof form.contactId === "string" ? form.contactId : undefined) ||
          undefined,
        value: form.value ? Number(form.value) : 0,
      };
      if (editingDeal) {
        await updateDeal(editingDeal.id, payload);
        setMessage({ type: "success", text: "Deal updated successfully" });
      } else {
        await createDeal(payload);
        setMessage({ type: "success", text: "Deal created successfully" });
      }
      setShowModal(false);
      resetForm();
      await fetchDeals();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to save deal",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeal(id);
      setDeals(deals.filter((d) => d.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Deal deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete deal" });
    }
  };

  // ─── Drag & Drop handlers ───────────────────────────────────────
  const handleDragStart = (dealId) => {
    dragIdRef.current = dealId;
  };

  const handleDrop = async (targetStage) => {
    const id = dragIdRef.current;
    if (!id) return;
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === targetStage) return;
    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage: targetStage } : d)),
    );
    try {
      await updateDeal(id, { stage: targetStage });
    } catch {
      await fetchDeals(); // revert on failure
    }
    dragIdRef.current = null;
  };

  const filteredDeals = deals.filter((deal) =>
    (deal.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPipeline = deals.reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0,
  );

  // ─── KANBAN VIEW ────────────────────────────────────────────────
  const renderKanban = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const col = STAGE_COLORS[stage.value];
        const colDeals = filteredDeals.filter(
          (d) => (d.stage || "PROSPECT") === stage.value,
        );
        const stageTotal = colDeals.reduce(
          (s, d) => s + (Number(d.value) || 0),
          0,
        );
        return (
          <div
            key={stage.value}
            className={`flex-shrink-0 w-64 bg-gray-900/60 rounded-xl border ${col.col} p-3`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {stage.label}
                </h3>
                <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">
                  {colDeals.length}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatCurrency(stageTotal)}
              </span>
            </div>
            <div className="space-y-2 min-h-[80px]">
              {colDeals.map((deal) => {
                const contact = allContactsRef.current.find(
                  (c) => c.id === deal.contactId,
                );
                const company = allCompaniesRef.current.find(
                  (c) => c.id === deal.companyId,
                );
                return (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/50 cursor-grab active:cursor-grabbing hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <button
                        onClick={() => router.push(`/CRM/Deals/Detail/${deal.id}`)}
                        className="text-white text-sm font-medium hover:text-cyan-400 text-left leading-tight"
                      >
                        {deal.name}
                      </button>
                    </div>
                    <p className="text-cyan-400 font-bold text-base mt-1">
                      {formatCurrency(deal.value)}
                    </p>
                    {contact && (
                      <p className="text-gray-400 text-xs mt-1">
                        {contact.firstName} {contact.lastName}
                      </p>
                    )}
                    {company && (
                      <p className="text-purple-400 text-xs">{company.name}</p>
                    )}
                    {deal.expectedCloseDate && (
                      <p className="text-gray-600 text-xs mt-1">
                        Close: {deal.expectedCloseDate.split("T")[0]}
                      </p>
                    )}
                    <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-700/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimelineEntity({ id: deal.id, name: deal.name });
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Timeline
                      </button>
                    </div>
                  </div>
                );
              })}
              {colDeals.length === 0 && (
                <div className="text-center text-gray-700 text-xs py-6 border border-dashed border-gray-800 rounded-lg">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── LIST VIEW ────────────────────────────────────────────────
  const renderList = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {[
                "Deal Name",
                "Value",
                "Stage",
                "Contact",
                "Company",
                "Expected Close",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal) => {
              const contact = allContactsRef.current.find(
                (c) => c.id === deal.contactId,
              );
              const company = allCompaniesRef.current.find(
                (c) => c.id === deal.companyId,
              );
              const stage = deal.stage || "Prospect";
              return (
                <tr
                  key={deal.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/CRM/Deals/Detail/${deal.id}`)}
                      className="text-white font-medium text-sm hover:text-cyan-400"
                    >
                      {deal.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-bold text-sm">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${STAGE_COLORS[stage]?.badge || "bg-gray-700 text-gray-300"}`}
                    >
                      {STAGES.find((s) => s.value === stage)?.label || stage.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {company ? company.name : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {deal.expectedCloseDate?.split("T")[0] || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(deal)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setTimelineEntity({ id: deal.id, name: deal.name })
                        }
                        className="text-purple-400 hover:text-purple-300 text-xs"
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(deal.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredDeals.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  No deals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Deals</h1>
            <p className="text-gray-400">
              Total Pipeline:{" "}
              <span className="text-cyan-400 font-bold">
                {formatCurrency(totalPipeline)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <div
                className={`z-50 px-4 py-3 rounded-lg border shadow-lg ${message.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"}`}
              >
                {message.text}
              </div>
            )}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "list" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Deal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "kanban" ? (
          renderKanban()
        ) : (
          renderList()
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold mb-2">Delete Deal?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Deal Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-white font-bold text-lg mb-6">
                {editingDeal ? "Edit Deal" : "Create Deal"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Deal name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Value ($)
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) =>
                        setForm({ ...form, value: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Stage
                    </label>
                    <select
                      value={form.stage}
                      onChange={(e) =>
                        setForm({ ...form, stage: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {STAGES.map((s, i) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <CompanySelect
                  value={form.companyId}
                  onChange={(id) => setForm({ ...form, companyId: id })}
                  companies={companies}
                  onCreated={(company) =>
                    setCompanies((prev) => [...prev, company])
                  }
                  label="Assign to Company"
                />
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Contact
                  </label>
                  <select
                    value={form.contactId?.id || ""}
                    onChange={(e) => {
                      const contact =
                        contacts.find((c) => c.id === e.target.value) || "";
                      setForm({ ...form, contactId: contact });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">Select contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) =>
                      setForm({ ...form, expectedCloseDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingDeal ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {timelineEntity && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setTimelineEntity(null)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
                <h3 className="text-white font-bold">
                  Timeline — {timelineEntity.name}
                </h3>
                <button
                  onClick={() => setTimelineEntity(null)}
                  className="text-gray-400 hover:text-white text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                <ActivityTimeline
                  entityType="deal"
                  entityId={timelineEntity.id}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
