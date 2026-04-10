import sendRequest from "../instance/sendRequest";

// ─── Shipments ────────────────────────────────────────────────────────────────

export const getShipments = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return sendRequest({ url: `/shipments${q ? `?${q}` : ""}`, method: "GET" });
};

export const getShipmentById = async (id) =>
  sendRequest({ url: `/shipments/${id}`, method: "GET" });

/** shipment_number is auto-generated server-side */
export const createShipment = async (payload) =>
  sendRequest({ url: `/shipments`, method: "POST", data: payload });

export const updateShipment = async (id, payload) =>
  sendRequest({ url: `/shipments/${id}`, method: "PATCH", data: payload });

/**
 * Advance shipment status.
 * Allowed sequence: CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
 * Branching: any state → RETURNED | FAILED
 * payload: { status, location, notes }
 */
export const updateShipmentStatus = async (id, payload) =>
  sendRequest({ url: `/shipments/${id}/status`, method: "POST", data: payload });

/** Add a tracking event (location ping, customs clearance, etc.) */
export const addTrackingEvent = async (shipmentId, payload) =>
  sendRequest({ url: `/shipments/${shipmentId}/tracking`, method: "POST", data: payload });

/** Get full timeline of tracking events for a shipment */
export const getShipmentTracking = async (shipmentId) =>
  sendRequest({ url: `/shipments/${shipmentId}/tracking`, method: "GET" });

/** Confirm delivery — sets actual_delivery_date, triggers stock deduction */
export const confirmDelivery = async (id, payload = {}) =>
  sendRequest({ url: `/shipments/${id}/confirm-delivery`, method: "POST", data: payload });

// ─── Carriers ─────────────────────────────────────────────────────────────────

export const getCarriers = async () =>
  sendRequest({ url: `/carriers`, method: "GET" });

export const createCarrier = async (payload) =>
  sendRequest({ url: `/carriers`, method: "POST", data: payload });

export const updateCarrier = async (id, payload) =>
  sendRequest({ url: `/carriers/${id}`, method: "PATCH", data: payload });

// ─── Shipment Items ───────────────────────────────────────────────────────────

export const getShipmentItems = async (shipmentId) =>
  sendRequest({ url: `/shipments/${shipmentId}/items`, method: "GET" });

export const addShipmentItem = async (shipmentId, payload) =>
  sendRequest({ url: `/shipments/${shipmentId}/items`, method: "POST", data: payload });
