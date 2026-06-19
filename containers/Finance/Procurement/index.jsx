"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getProcurementV2Items,
  createProcurementV2Item,
  updateProcurementV2Item,
  deleteProcurementV2Item,
} from "@/services/Finance/ProcurementV2";
import { listV2Projects } from "@/services/CxProjectsV2";

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

const FURNISH = ["OFCI", "CFCI"];

const ORDER_STATUS = [
  { v: "NOT_ORDERED", label: "Not Ordered", color: "var(--rf-txt3)" },
  { v: "ORDERED", label: "Ordered", color: "var(--rf-orange)" },
  { v: "IN_TRANSIT", label: "In Transit", color: "var(--rf-accent)" },
  { v: "DELIVERED", label: "Delivered", color: "var(--rf-green)" },
];
const OS = Object.fromEntries(ORDER_STATUS.map((o) => [o.v, o]));

const EMPTY_FORM = {
  projectId: "",
  po: "",
  description: "",
  furnish: "OFCI",
  manufacturer: "",
  model: "",
  orderStatus: "NOT_ORDERED",
  location: "",
  vendor: "",
  poc: "",
};

/* ------------------------------------------------------------------ *
 * Shared styles (RequiredFlow light theme)
 * ------------------------------------------------------------------ */

const CARD = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border2)",
};
// Border drawn as an inset ring so it survives the global input overrides.
const FIELD = {
  background: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
};
const fieldCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";

/* ------------------------------------------------------------------ *
 * Field helpers — read tolerant of differing backend shapes
 * ------------------------------------------------------------------ */

const itemName = (i) => i.description ?? i.name ?? i.itemName ?? "—";
const itemPo = (i) => i.poSubmittalNo ?? i.poNumber ?? i.po ?? "";
const itemFurnish = (i) =>
  i.ownership ?? i.furnish ?? i.procurementOwner ?? "OFCI";
const itemVendor = (i) => i.vendor ?? i.vendorName ?? "";
const itemSource = (i) =>
  i.projectAssetId || i.source === "ASSET_REGISTER" || i.fromAssetRegister
    ? "Asset Register"
    : "Manual";
const itemOrderStatus = (i) => i.status ?? i.orderStatus ?? "NOT_ORDERED";

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function Procurement() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [furnishTab, setFurnishTab] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchProjects();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await getProcurementV2Items();
      const d = res?.data ?? res;
      setItems(Array.isArray(d) ? d : (d?.data ?? d?.items ?? []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const res = await listV2Projects({ limit: 100 });
      const d = res?.data ?? res;
      setProjects(Array.isArray(d) ? d : (d?.data ?? d?.items ?? []));
    } catch (e) {
      console.error(e);
    }
  }

  const projectLabel = (p) => p.name ?? p.projectName ?? p.code ?? p.id;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        ownership: form.furnish,
        status: form.orderStatus,
        poSubmittalNo: form.po || undefined,
        manufacturer: form.manufacturer || undefined,
        model: form.model || undefined,
        location: form.location || undefined,
        vendor: form.vendor || undefined,
        poc: form.poc || undefined,
        cxProjectId: form.projectId || undefined,
      };
      await createProcurementV2Item(payload);
      setForm(EMPTY_FORM);
      setShowAdd(false);
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item, status) => {
    setStatusBusy(item.id);
    setItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, status } : x)),
    );
    try {
      await updateProcurementV2Item(item.id, { status });
    } catch (e) {
      console.error(e);
      fetchItems();
    } finally {
      setStatusBusy(null);
    }
  };

  const remove = async (id) => {
    const prev = items;
    setItems((p) => p.filter((x) => x.id !== id));
    try {
      await deleteProcurementV2Item(id);
    } catch (e) {
      console.error(e);
      setItems(prev);
    }
  };

  // Furnish-tab filtering + counts
  const counts = useMemo(() => {
    const ofci = items.filter((i) => itemFurnish(i) === "OFCI").length;
    const cfci = items.filter((i) => itemFurnish(i) === "CFCI").length;
    return { OFCI: ofci, CFCI: cfci, All: items.length };
  }, [items]);

  const filtered = useMemo(
    () =>
      furnishTab === "All"
        ? items
        : items.filter((i) => itemFurnish(i) === furnishTab),
    [items, furnishTab],
  );

  const statusCounts = useMemo(() => {
    const c = { NOT_ORDERED: 0, ORDERED: 0, IN_TRANSIT: 0, DELIVERED: 0 };
    filtered.forEach((i) => {
      const s = itemOrderStatus(i);
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [filtered]);

  return (
    <div className="p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <p
              className="uppercase font-bold mb-1"
              style={{
                color: "var(--rf-txt3)",
                fontSize: 11,
                letterSpacing: "0.12em",
              }}
            >
              Procurement Register
            </p>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--rf-txt)" }}
            >
              Procurement
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
              Pulled from project creation (asset register) — plus anything you
              add or import here.{" "}
              <strong style={{ color: "var(--rf-txt)" }}>OFCI</strong> ={" "}
              owner-furnished,{" "}
              <strong style={{ color: "var(--rf-txt)" }}>CFCI</strong> ={" "}
              contractor-furnished.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "var(--rf-accent)", color: "#fff" }}
              onClick={() => setShowAdd((v) => !v)}
            >
              + Add item
            </button>
          </div>
        </div>

        {/* Add item form */}
        {showAdd && (
          <div className="rounded-2xl p-4 mb-5" style={CARD}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Project — attach the procurement to a project (listV2Projects) */}
              <select
                className={`${fieldCls} md:col-span-4`}
                style={FIELD}
                value={form.projectId}
                onChange={(e) => set("projectId", e.target.value)}
              >
                <option value="">— Attach to project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {projectLabel(p)}
                  </option>
                ))}
              </select>

              <input
                className={fieldCls}
                style={FIELD}
                placeholder="PO / Submittal #"
                value={form.po}
                onChange={(e) => set("po", e.target.value)}
              />
              <input
                className={`${fieldCls} md:col-span-2`}
                style={FIELD}
                placeholder="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <select
                className={fieldCls}
                style={FIELD}
                value={form.furnish}
                onChange={(e) => set("furnish", e.target.value)}
              >
                {FURNISH.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <input
                className={fieldCls}
                style={FIELD}
                placeholder="manufacturer"
                value={form.manufacturer}
                onChange={(e) => set("manufacturer", e.target.value)}
              />
              <input
                className={fieldCls}
                style={FIELD}
                placeholder="model"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
              <select
                className={fieldCls}
                style={FIELD}
                value={form.orderStatus}
                onChange={(e) => set("orderStatus", e.target.value)}
              >
                {ORDER_STATUS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                className={fieldCls}
                style={FIELD}
                placeholder="data hall / location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />

              <input
                className={fieldCls}
                style={FIELD}
                placeholder="vendor"
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
              />
              <input
                className={fieldCls}
                style={FIELD}
                placeholder="POC"
                value={form.poc}
                onChange={(e) => set("poc", e.target.value)}
              />
              <button
                className="md:col-span-2 rounded-lg text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: saving || !form.description.trim() ? 0.6 : 1,
                }}
                disabled={saving || !form.description.trim()}
                onClick={handleAdd}
              >
                {saving ? "Adding…" : "Add to project"}
              </button>
            </div>
          </div>
        )}

        {/* Furnish tabs */}
        <div className="flex items-center gap-2 mb-3">
          {["All", "OFCI", "CFCI"].map((t) => {
            const active = furnishTab === t;
            return (
              <button
                key={t}
                onClick={() => setFurnishTab(t)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold"
                style={
                  active
                    ? { background: "var(--rf-accent)", color: "#fff" }
                    : { background: "var(--rf-bg3)", color: "var(--rf-txt2)" }
                }
              >
                {t} ({counts[t]})
              </button>
            );
          })}
        </div>

        {/* Status summary pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {ORDER_STATUS.map((o) => (
            <span
              key={o.v}
              className="px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{
                background: `color-mix(in srgb, ${o.color} 12%, transparent)`,
                color: o.color,
              }}
            >
              {o.label}: {statusCounts[o.v]}
            </span>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {loading ? (
            <div
              className="p-10 text-center text-sm"
              style={{ color: "var(--rf-txt2)" }}
            >
              Loading procurement items…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-10 text-center text-sm"
              style={{ color: "var(--rf-txt3)" }}
            >
              No procurement items found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    className="uppercase"
                    style={{
                      color: "var(--rf-txt3)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textAlign: "left",
                    }}
                  >
                    <th className="px-4 py-3 font-bold">Item</th>
                    <th className="px-4 py-3 font-bold">Mfr / Model</th>
                    <th className="px-4 py-3 font-bold">Furnish</th>
                    <th className="px-4 py-3 font-bold">PO#</th>
                    <th className="px-4 py-3 font-bold">Order Status</th>
                    <th className="px-4 py-3 font-bold">Location</th>
                    <th className="px-4 py-3 font-bold">Vendor</th>
                    <th className="px-4 py-3 font-bold">Source</th>
                    <th className="px-4 py-3 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const os = itemOrderStatus(item);
                    const osCfg = OS[os] ?? OS.NOT_ORDERED;
                    return (
                      <tr
                        key={item.id}
                        style={{ borderTop: "1px solid var(--rf-border)" }}
                      >
                        <td
                          className="px-4 py-3 text-sm font-semibold"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {itemName(item)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {[item.manufacturer, item.model]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-bold font-mono"
                            style={{
                              background: "var(--rf-bg3)",
                              color: "var(--rf-txt2)",
                            }}
                          >
                            {itemFurnish(item)}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {itemPo(item) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={os}
                            disabled={statusBusy === item.id}
                            onChange={(e) => changeStatus(item, e.target.value)}
                            className="px-2 py-1 rounded-md text-xs font-bold outline-none cursor-pointer"
                            style={{
                              color: osCfg.color,
                              background: `color-mix(in srgb, ${osCfg.color} 12%, transparent)`,
                              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${osCfg.color} 35%, transparent)`,
                            }}
                          >
                            {ORDER_STATUS.map((o) => (
                              <option key={o.v} value={o.v}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {item.location || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {itemVendor(item) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              background: "var(--rf-bg3)",
                              color: "var(--rf-txt3)",
                            }}
                          >
                            {itemSource(item)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => remove(item.id)}
                            title="Remove"
                            className="px-2 text-lg leading-none"
                            style={{ color: "var(--rf-txt3)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--rf-red)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--rf-txt3)")
                            }
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
