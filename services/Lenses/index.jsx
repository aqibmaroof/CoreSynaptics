import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B7: Lens registry (20 lenses, server-owned) ─────────────
// Always read from `/lenses`; never hardcode the list. Future lenses appear
// automatically.

export const listLenses = () =>
  sendRequest({ url: `/lenses`, method: "GET" });

// Display labels for the 20 server-side lens keys. Add new entries here only
// when the spec ships them.
export const LENS_LABEL = {
  gc_pm: "GC PM",
  gc_sup: "GC Superintendent",
  gc_qaqc: "GC QA/QC",
  gc_procurement: "GC Procurement",
  gc_engineering: "GC Engineering",
  safety: "Safety",
  finance: "Finance",
  oem_pm: "OEM PM",
  oem_qaqc: "OEM QA/QC",
  fsm: "Field Service Manager",
  fse: "Field Service Engineer",
  customer: "Customer",
  customer_qaqc: "Customer QA/QC",
  trade: "Trade",
  trade_qaqc_e: "Trade QA/QC · E",
  trade_qaqc_m: "Trade QA/QC · M",
  trade_field: "Trade Field",
  cxa: "CxA",
  bms: "BMS",
  generic: "Generic",
};
