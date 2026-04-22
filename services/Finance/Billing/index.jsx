"use client";
import sendRequest from "../../instance/sendRequest";

export const getInvoices = (params = {}) =>
  sendRequest({ method: "GET", url: "/invoices", params });

export const getInvoiceById = (id) =>
  sendRequest({ method: "GET", url: `/invoices/${id}` });

export const createInvoice = (data) =>
  sendRequest({ method: "POST", url: "/invoices", data });

export const updateInvoice = (id, data) =>
  sendRequest({ method: "PATCH", url: `/invoices/${id}`, data });

export const markInvoicePaid = (id) =>
  sendRequest({ method: "POST", url: `/invoices/${id}/mark-paid` });