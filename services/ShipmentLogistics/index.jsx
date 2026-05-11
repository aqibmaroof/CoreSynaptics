import sendRequest from "../instance/sendRequest";

// Maps the target status to its dedicated API endpoint
const STATUS_ENDPOINTS = {
  PICKED_UP:        "pickup",
  IN_TRANSIT:       "in-transit",
  OUT_FOR_DELIVERY: "out-for-delivery",
  DELIVERED:        "deliver",
  RETURNED:         "return",
  FAILED:           "fail",
};

// ─── Shipments ────────────────────────────────────────────────────────────────

export const getShipments = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/shipments${q ? `?${q}` : ""}`, method: "GET" });
};

export const getShipmentById = async (id) =>
  sendRequest({ url: `/shipments/${id}`, method: "GET" });

/** Creates a shipment in CREATED status. Stock is NOT deducted at creation time. */
export const createShipment = async (payload) =>
  sendRequest({ url: `/shipments`, method: "POST", data: payload });

/**
 * Updates editable fields on a non-terminal shipment.
 * Allowed fields: carrierId, trackingNumber, estimatedDeliveryDate, destinationAddress, notes
 */
export const updateShipment = async (id, payload) =>
  sendRequest({ url: `/shipments/${id}`, method: "PATCH", data: payload });

/** Only CREATED or terminal (DELIVERED, RETURNED, FAILED) shipments can be deleted. */
export const deleteShipment = async (id) =>
  sendRequest({ url: `/shipments/${id}`, method: "DELETE" });

/**
 * Advances shipment to the next status by routing to the correct endpoint.
 * payload: { status, location?, notes? }
 * Valid transitions:
 *   CREATED → PICKED_UP | FAILED
 *   PICKED_UP → IN_TRANSIT | FAILED
 *   IN_TRANSIT → OUT_FOR_DELIVERY | RETURNED | FAILED
 *   OUT_FOR_DELIVERY → DELIVERED | RETURNED | FAILED
 */
export const updateShipmentStatus = async (id, payload) => {
  const { status, ...rest } = payload;
  const endpoint = STATUS_ENDPOINTS[status];
  if (!endpoint) throw new Error(`Unknown target status: ${status}`);
  return sendRequest({ url: `/shipments/${id}/${endpoint}`, method: "POST", data: rest });
};

/** Returns the full ordered timeline of tracking events for a shipment. */
export const getShipmentTracking = async (shipmentId) =>
  sendRequest({ url: `/shipments/${shipmentId}/tracking`, method: "GET" });

// ─── Carriers ─────────────────────────────────────────────────────────────────

export const getCarriers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/carriers${q ? `?${q}` : ""}`, method: "GET" });
};

export const getCarrierById = async (id) =>
  sendRequest({ url: `/carriers/${id}`, method: "GET" });

export const createCarrier = async (payload) =>
  sendRequest({ url: `/carriers`, method: "POST", data: payload });

export const updateCarrier = async (id, payload) =>
  sendRequest({ url: `/carriers/${id}`, method: "PATCH", data: payload });

/** Soft-deletes a carrier. */
export const deleteCarrier = async (id) =>
  sendRequest({ url: `/carriers/${id}`, method: "DELETE" });
