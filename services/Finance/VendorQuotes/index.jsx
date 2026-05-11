"use client";
import sendRequest from "../../instance/sendRequest";

export const getVendorQuotes = (params = {}) =>
  sendRequest({ method: "GET", url: "/vendor-quotes", params });

export const getVendorQuoteById = (id) =>
  sendRequest({ method: "GET", url: `/vendor-quotes/${id}` });

export const createVendorQuote = (data) =>
  sendRequest({ method: "POST", url: "/vendor-quotes", data });

export const updateVendorQuote = (id, data) =>
  sendRequest({ method: "PATCH", url: `/vendor-quotes/${id}`, data });

export const submitVendorQuote = (id) =>
  sendRequest({ method: "POST", url: `/vendor-quotes/${id}/submit`, data: {} });

export const approveVendorQuote = (id) =>
  sendRequest({ method: "POST", url: `/vendor-quotes/${id}/approve`, data: {} });

export const rejectVendorQuote = (id, data) =>
  sendRequest({ method: "POST", url: `/vendor-quotes/${id}/reject`, data });
