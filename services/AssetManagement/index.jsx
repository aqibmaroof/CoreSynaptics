import sendRequest from "../instance/sendRequest";

// ─── Assets ───────────────────────────────────────────────────────────────────

export const getAssets = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/assets${q ? `?${q}` : ""}`, method: "GET" });
};

export const getAssetById = async (id) =>
  sendRequest({ url: `/assets/${id}`, method: "GET" });

export const createAsset = async (payload) =>
  sendRequest({ url: `/assets`, method: "POST", data: payload });

export const updateAsset = async (id, payload) =>
  sendRequest({ url: `/assets/${id}`, method: "PATCH", data: payload });

export const deleteAsset = async (id) =>
  sendRequest({ url: `/assets/${id}`, method: "DELETE" });

/**
 * Change asset status — writes to asset_status_history automatically.
 * payload: { status, reason? }
 * Allowed: IN_STOCK | ASSIGNED | IN_REPAIR | DAMAGED | RETIRED | LOST
 */
export const changeAssetStatus = async (id, payload) =>
  sendRequest({ url: `/assets/${id}/status`, method: "PATCH", data: payload });

/** Get complete status history for an asset */
export const getAssetHistory = async (id) =>
  sendRequest({ url: `/assets/${id}/history`, method: "GET" });

// ─── Asset Assignments ────────────────────────────────────────────────────────

export const getAssetAssignments = async (assetId) =>
  sendRequest({ url: `/assets/${assetId}/assignments`, method: "GET" });

/**
 * Assign an asset to a user.
 * Sets status → ASSIGNED, creates assignment record.
 * payload: { assigned_to_user_id, assigned_date, expected_return_date?, notes }
 */
export const assignAsset = async (assetId, payload) =>
  sendRequest({ url: `/assets/${assetId}/assign`, method: "POST", data: payload });

/**
 * Return an asset.
 * Sets asset status → IN_STOCK.
 * payload: { notes? }
 */
export const returnAsset = async (assetId, payload = {}) =>
  sendRequest({ url: `/assets/${assetId}/return`, method: "POST", data: payload });
