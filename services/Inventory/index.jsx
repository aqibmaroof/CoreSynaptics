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

/** Returns all SKUs for one product. */
export const getSKUsByProduct = async (productId) =>
  sendRequest({ url: `/inventory/skus/by-product/${productId}`, method: "GET" });

export const getSKUById = async (id) =>
  sendRequest({ url: `/inventory/skus/${id}`, method: "GET" });

export const createSKU = async (payload) =>
  sendRequest({ url: `/inventory/skus`, method: "POST", data: payload });

/** Note: `code` and `productId` cannot be changed via this endpoint. */
export const updateSKU = async (id, payload) =>
  sendRequest({ url: `/inventory/skus/${id}`, method: "PATCH", data: payload });

export const deleteSKU = async (id) =>
  sendRequest({ url: `/inventory/skus/${id}`, method: "DELETE" });

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouses = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/warehouses${q ? `?${q}` : ""}`, method: "GET" });
};

export const getWarehouseById = async (id) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "GET" });

export const createWarehouse = async (payload) =>
  sendRequest({ url: `/inventory/warehouses`, method: "POST", data: payload });

/** Note: warehouse `code` is immutable after creation. */
export const updateWarehouse = async (id, payload) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "PATCH", data: payload });

export const deleteWarehouse = async (id) =>
  sendRequest({ url: `/inventory/warehouses/${id}`, method: "DELETE" });

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const getSuppliers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/suppliers${q ? `?${q}` : ""}`, method: "GET" });
};

export const getSupplierById = async (id) =>
  sendRequest({ url: `/inventory/suppliers/${id}`, method: "GET" });

export const createSupplier = async (payload) =>
  sendRequest({ url: `/inventory/suppliers`, method: "POST", data: payload });

export const updateSupplier = async (id, payload) =>
  sendRequest({ url: `/inventory/suppliers/${id}`, method: "PATCH", data: payload });

export const deleteSupplier = async (id) =>
  sendRequest({ url: `/inventory/suppliers/${id}`, method: "DELETE" });

// ─── Stock Levels ─────────────────────────────────────────────────────────────

/** Returns stock levels for one SKU across all warehouses. */
export const getStockBySKU = async (skuId) =>
  sendRequest({ url: `/inventory/stock/by-sku/${skuId}`, method: "GET" });

/** Returns stock levels for all SKUs in one warehouse. */
export const getStockByWarehouse = async (warehouseId) =>
  sendRequest({ url: `/inventory/stock/by-warehouse/${warehouseId}`, method: "GET" });

// ─── Stock Movements ─────────────────────────────────────────────────────────

export const getStockMovements = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/inventory/stock/movements${q ? `?${q}` : ""}`, method: "GET" });
};

/**
 * Record a stock movement.
 * payload fields: skuId, type (IN|OUT|TRANSFER|RETURN|ADJUSTMENT), quantity,
 *   warehouseId (required for all types), toWarehouseId (TRANSFER only),
 *   adjustmentDelta (ADJUSTMENT only), supplierId?, unitCost?,
 *   referenceType?, referenceId?, notes?
 *
 * Type rules:
 *   IN      → warehouseId (receiving warehouse)
 *   OUT     → warehouseId (source warehouse)
 *   RETURN  → warehouseId (return destination)
 *   TRANSFER → warehouseId (from) + toWarehouseId (to)
 *   ADJUSTMENT → warehouseId + adjustmentDelta
 */
export const recordStockMovement = async (payload) =>
  sendRequest({ url: `/inventory/stock/movements`, method: "POST", data: payload });

/**
 * Transfer stock between warehouses atomically.
 * payload: { skuId, fromWarehouseId, toWarehouseId, quantity, notes? }
 */
export const transferStock = async (payload) =>
  sendRequest({ url: `/inventory/stock/movements/transfer`, method: "POST", data: payload });
