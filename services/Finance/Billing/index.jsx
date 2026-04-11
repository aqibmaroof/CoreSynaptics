"use client";
import sendRequest from "../../instance/sendRequest";

export const getInvoices = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/invoices", params });

export const getInvoiceById = (id) =>
  sendRequest({ method: "GET", url: `/finance/invoices/${id}` });

export const createInvoice = (data) =>
  sendRequest({ method: "POST", url: "/finance/invoices", data });

export const updateInvoice = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/invoices/${id}`, data });

export const deleteInvoice = (id) =>
  sendRequest({ method: "DELETE", url: `/finance/invoices/${id}` });

export const markInvoicePaid = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/invoices/${id}/mark-paid`, data });

export const markInvoiceOverdue = (id) =>
  sendRequest({ method: "PATCH", url: `/finance/invoices/${id}/mark-overdue` });

export const sendInvoiceReminder = (id) =>
  sendRequest({ method: "POST", url: `/finance/invoices/${id}/send-reminder` });

// Payment records linked to an invoice
export const getInvoicePayments = (invoiceId) =>
  sendRequest({ method: "GET", url: `/finance/invoices/${invoiceId}/payments` });

export const recordPayment = (invoiceId, data) =>
  sendRequest({ method: "POST", url: `/finance/invoices/${invoiceId}/payments`, data });
