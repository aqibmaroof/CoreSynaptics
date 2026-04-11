"use client";
import sendRequest from "../../instance/sendRequest";

export const getVendorQuotes = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/vendor-quotes", params });

export const getVendorQuoteById = (id) =>
  sendRequest({ method: "GET", url: `/finance/vendor-quotes/${id}` });

export const createVendorQuote = (data) =>
  sendRequest({ method: "POST", url: "/finance/vendor-quotes", data });

export const updateVendorQuote = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/vendor-quotes/${id}`, data });

export const deleteVendorQuote = (id) =>
  sendRequest({ method: "DELETE", url: `/finance/vendor-quotes/${id}` });

export const approveVendorQuote = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/vendor-quotes/${id}/approve`, data });

export const rejectVendorQuote = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/vendor-quotes/${id}/reject`, data });

// Compare multiple quotes for the same project/scope
export const compareQuotes = (quoteIds) =>
  sendRequest({ method: "POST", url: "/finance/vendor-quotes/compare", data: { ids: quoteIds } });

// Attach a document (reuses Document module — document_id is stored as FK)
export const attachDocument = (quoteId, documentId) =>
  sendRequest({ method: "POST", url: `/finance/vendor-quotes/${quoteId}/documents`, data: { document_id: documentId } });

export const detachDocument = (quoteId, documentId) =>
  sendRequest({ method: "DELETE", url: `/finance/vendor-quotes/${quoteId}/documents/${documentId}` });
