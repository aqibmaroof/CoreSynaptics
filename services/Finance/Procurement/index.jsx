"use client";
import sendRequest from "../../instance/sendRequest";

export const getProcurementItems = (params = {}) =>
  sendRequest({ method: "GET", url: "/procurement", params });

export const getProcurementItemById = (id) =>
  sendRequest({ method: "GET", url: `/procurement/${id}` });

export const createProcurementItem = (data) =>
  sendRequest({ method: "POST", url: "/procurement", data });

export const updateProcurementItem = (id, data) =>
  sendRequest({ method: "PATCH", url: `/procurement/${id}`, data });

export const orderProcurementItem = (id) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/order`, data: {} });

export const markProcurementDelayed = (id, data) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/mark-delayed`, data });

export const markProcurementDelivered = (id) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/mark-delivered`, data: {} });
