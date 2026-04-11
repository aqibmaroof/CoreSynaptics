import sendRequest from "../instance/sendRequest";

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/products${q ? `?${q}` : ""}`, method: "GET" });
};

export const getProductById = async (id) =>
  sendRequest({ url: `/inventory/products/${id}`, method: "GET" });

export const createProduct = async (payload) =>
  sendRequest({ url: `/inventory/products`, method: "POST", data: payload });

export const updateProduct = async (id, payload) =>
  sendRequest({ url: `/inventory/products/${id}`, method: "PATCH", data: payload });

export const deleteProduct = async (id) =>
  sendRequest({ url: `/inventory/products/${id}`, method: "DELETE" });

// ─── SKUs ─────────────────────────────────────────────────────────────────────

export const getSKUs = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/skus${q ? `?${q}` : ""}`, method: "GET" });
};

export const getSKUById = async (id) =>
  sendRequest({ url: `/inventory/skus/${id}`, method: "GET" });

export const createSKU = async (payload) =>
  sendRequest({ url: `/inventory/skus`, method: "POST", data: payload });

export const updateSKU = async (id, payload) =>
  sendRequest({ url: `/inventory/skus/${id}`, method: "PATCH", data: payload });

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouses = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/warehouses${q ? `?${q}` : ""}`, method: "GET" });
};

export const getWarehouseById = async (id) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "GET" });

export const createWarehouse = async (payload) =>
  sendRequest({ url: `/inventory/warehouses`, method: "POST", data: payload });

export const updateWarehouse = async (id, payload) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "PATCH", data: payload });

export const deleteWarehouse = async (id) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "DELETE" });

export const getWarehouseStockSummary = async (id) =>
  sendRequest({ url: `/inventory/warehouses/${id}/stock-summary`, method: "GET" });

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export const getStockLevels = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/stock${q ? `?${q}` : ""}`, method: "GET" });
};

/** Get aggregated stock levels for a specific SKU across all warehouses */
export const getStockBySKU = async (skuId) =>
  sendRequest({ url: `/inventory/stock/sku/${skuId}`, method: "GET" });

// ─── Stock Movements ─────────────────────────────────────────────────────────

export const getStockMovements = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/movements${q ? `?${q}` : ""}`, method: "GET" });
};

/**
 * Record a stock movement.
 * payload: { sku_id, from_warehouse_id?, to_warehouse_id?, movement_type,
 *            quantity, reference_type, reference_id, notes }
 * movement_type: IN | OUT | TRANSFER | RETURN | ADJUSTMENT
 */
export const recordStockMovement = async (payload) =>
  sendRequest({ url: `/inventory/movements`, method: "POST", data: payload });

/** Low-stock alert list: products where available_qty < reorder_point */
export const getLowStockAlerts = async () =>
  sendRequest({ url: `/inventory/stock/alerts/low`, method: "GET" });
