"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getProductById,
  getSKUsByProduct,
  createSKU,
  updateSKU,
  deleteSKU,
} from "@/services/Inventory";

// ─── Shared style constants ────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
const INPUT_READONLY =
  "w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 text-sm cursor-not-allowed select-none font-mono";
const FL = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-1">*</span>}
  </label>
);
const Err = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ─── Attribute key-value editor ───────────────────────────────────────────────
function AttributeEditor({ pairs, onChange }) {
  const add = () => onChange([...pairs, { key: "", value: "" }]);
  const remove = (i) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(pairs.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  return (
    <div className="space-y-2">
      {pairs.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            placeholder="Key (e.g. color)"
            value={p.key}
            onChange={(e) => update(i, "key", e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="Value (e.g. red)"
            value={p.value}
            onChange={(e) => update(i, "value", e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="px-3 py-2 text-gray-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1"
      >
        <span className="text-base leading-none">+</span> Add attribute
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pairsToObj = (pairs) => {
  const obj = {};
  for (const { key, value } of pairs) {
    if (key.trim()) obj[key.trim()] = value;
  }
  return Object.keys(obj).length ? obj : undefined;
};

const objToPairs = (obj) =>
  obj && typeof obj === "object"
    ? Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }))
    : [];

const EMPTY_FORM = { code: "", name: "", reorderPoint: "", attrPairs: [] };

// ─── SKU modal ────────────────────────────────────────────────────────────────
function SKUModal({ productId, sku, onClose, onSaved }) {
  const isEdit = !!sku;
  const [form, setForm] = useState(
    isEdit
      ? {
          code: sku.code ?? "",
          name: sku.name ?? "",
          reorderPoint: sku.reorderPoint != null ? String(sku.reorderPoint) : "",
          attrPairs: objToPairs(sku.attributes),
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((f) => ({ ...f, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isEdit && !form.code.trim()) e.code = "SKU code is required";
    if (form.reorderPoint !== "" && (isNaN(Number(form.reorderPoint)) || Number(form.reorderPoint) < 0))
      e.reorderPoint = "Must be a non-negative number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        name: form.name.trim() || undefined,
        reorderPoint: form.reorderPoint !== "" ? Number(form.reorderPoint) : undefined,
        attributes: pairsToObj(form.attrPairs),
      };
      if (isEdit) {
        await updateSKU(sku.id, payload);
      } else {
        await createSKU({ ...payload, productId, code: form.code.trim().toUpperCase() });
      }
      onSaved();
    } catch (err) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to save SKU");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit SKU" : "Add SKU"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
          {apiError && (
            <div className="px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {apiError}
            </div>
          )}

          {/* SKU Code */}
          <div>
            <FL required={!isEdit}>SKU Code</FL>
            {isEdit ? (
              <>
                <div className={INPUT_READONLY}>{sku.code}</div>
                <p className="text-gray-600 text-xs mt-1">SKU code cannot be changed after creation</p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={form.code}
                  onChange={set("code")}
                  onBlur={() => setForm((f) => ({ ...f, code: f.code.toUpperCase() }))}
                  placeholder="e.g. SKU-001-BLK"
                  className={`${INPUT} font-mono uppercase ${errors.code ? "border-red-500" : ""}`}
                />
                <p className="text-gray-600 text-xs mt-1">Unique identifier — cannot be changed after creation</p>
                <Err msg={errors.code} />
              </>
            )}
          </div>

          {/* Name */}
          <div>
            <FL>Display Name</FL>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Black 42U Server Rack"
              className={INPUT}
            />
          </div>

          {/* Reorder Point */}
          <div>
            <FL>Reorder Point</FL>
            <input
              type="number"
              min="0"
              value={form.reorderPoint}
              onChange={set("reorderPoint")}
              placeholder="e.g. 10"
              className={`${INPUT} ${errors.reorderPoint ? "border-red-500" : ""}`}
            />
            <p className="text-gray-600 text-xs mt-1">
              Alert threshold — triggers low-stock indicator when stock falls below this
            </p>
            <Err msg={errors.reorderPoint} />
          </div>

          {/* Attributes */}
          <div>
            <FL>Attributes</FL>
            <AttributeEditor
              pairs={form.attrPairs}
              onChange={(p) => setForm((f) => ({ ...f, attrPairs: p }))}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create SKU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirmation ───────────────────────────────────────────────────────
function DeleteConfirm({ sku, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold">Delete SKU</p>
            <p className="text-gray-400 text-sm">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-6">
          Are you sure you want to delete{" "}
          <span className="font-mono text-white bg-gray-800 px-1.5 py-0.5 rounded">{sku.code}</span>?
          Any associated stock records will be affected.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main container ────────────────────────────────────────────────────────────
export default function ProductSKUs({ productId }) {
  const router = useRouter();

  const [product, setProduct]     = useState(null);
  const [skus, setSkus]           = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg]             = useState(null);

  // Modal state
  const [modal, setModal]         = useState(null); // null | "add" | { sku }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    setFetching(true);
    try {
      const [prod, skuList] = await Promise.all([
        getProductById(productId),
        getSKUsByProduct(productId),
      ]);
      setProduct(prod?.data ?? prod);
      setSkus(Array.isArray(skuList) ? skuList : skuList?.data ?? []);
    } catch {
      setFetchError("Failed to load product data.");
    } finally {
      setFetching(false));
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const handleSaved = () => {
    setModal(null);
    setMsg({ type: "success", text: modal === "add" ? "SKU created" : "SKU updated" });
    load();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteSKU(deleteTarget.id);
      setDeleteTarget(null);
      setMsg({ type: "success", text: `SKU ${deleteTarget.code} deleted` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || err?.message || "Failed to delete SKU" });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading SKUs...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{fetchError}</p>
          <button onClick={() => router.back()} className="text-cyan-400 hover:text-cyan-300 text-sm underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6">
      {/* Modals */}
      {(modal === "add" || (modal && modal.sku)) && (
        <SKUModal
          productId={productId}
          sku={modal === "add" ? null : modal.sku}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          sku={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <div className="mx-auto">
        {/* Toast */}
        {msg && (
          <div className={`fixed top-6 right-6 z-40 px-4 py-3 rounded-lg border shadow-lg text-sm ${
            msg.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-300"
              : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>
            {msg.text}
          </div>
        )}

        {/* Back */}
        <button
          onClick={() => router.push("/Inventory/Products/List")}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">SKUs</h1>
            {product && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400 text-sm">{product.name}</span>
                {product.category && (
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.unit && (
                  <span className="text-xs text-cyan-400/70 bg-cyan-900/20 px-2 py-0.5 rounded-full font-mono">
                    {product.unit}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setModal("add")}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add SKU
          </button>
        </div>

        {/* Product info card */}
        {product && (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 mb-6 flex flex-wrap gap-6">
            {product.description && (
              <p className="text-gray-400 text-sm w-full">{product.description}</p>
            )}
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Brand</p>
              <p className="text-white text-sm mt-0.5">{product.brand || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Status</p>
              <p className={`text-sm mt-0.5 font-medium ${product.isActive !== false ? "text-green-400" : "text-gray-500"}`}>
                {product.isActive !== false ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">SKU Count</p>
              <p className="text-white text-sm mt-0.5 font-semibold">{skus.length}</p>
            </div>
            <div className="ml-auto self-end">
              <button
                onClick={() => router.push(`/Inventory/Products/Edit/${productId}`)}
                className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
              >
                Edit product →
              </button>
            </div>
          </div>
        )}

        {/* SKU list */}
        {skus.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-16 text-center">
            <p className="text-4xl mb-4">🏷️</p>
            <p className="text-gray-400 text-lg mb-1">No SKUs yet</p>
            <p className="text-gray-600 text-sm mb-6">
              Add SKUs to track variants of this product in inventory
            </p>
            <button
              onClick={() => setModal("add")}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium"
            >
              Add First SKU
            </button>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Code", "Name", "Attributes", "Reorder Point", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku) => {
                    const attrs = sku.attributes && typeof sku.attributes === "object"
                      ? Object.entries(sku.attributes)
                      : [];
                    return (
                      <tr key={sku.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                        {/* Code */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-cyan-300 text-sm bg-cyan-900/20 px-2 py-0.5 rounded">
                            {sku.code}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-5 py-4 text-gray-300 text-sm">
                          {sku.name || <span className="text-gray-600">—</span>}
                        </td>

                        {/* Attributes */}
                        <td className="px-5 py-4">
                          {attrs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {attrs.map(([k, v]) => (
                                <span key={k} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm">—</span>
                          )}
                        </td>

                        {/* Reorder Point */}
                        <td className="px-5 py-4">
                          {sku.reorderPoint != null ? (
                            <span className="text-gray-300 text-sm font-mono">{sku.reorderPoint}</span>
                          ) : (
                            <span className="text-gray-600 text-sm">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            sku.isActive !== false
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-gray-700/30 text-gray-500 border border-gray-600/30"
                          }`}>
                            {sku.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setModal({ sku })}
                              className="px-3 py-1.5 text-xs text-gray-300 border border-gray-700 hover:border-cyan-500 hover:text-cyan-300 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sku)}
                              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-700/50 hover:border-red-500/50 hover:text-red-400 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">{skus.length} SKU{skus.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
