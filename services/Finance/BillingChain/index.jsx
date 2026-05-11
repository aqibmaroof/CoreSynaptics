"use client";
import sendRequest from "../../instance/sendRequest";

export const getPayments = (params = {}) =>
  sendRequest({ method: "GET", url: "/payments", params });

export const getPaymentById = (id) =>
  sendRequest({ method: "GET", url: `/payments/${id}` });

export const createPayment = (data) =>
  sendRequest({ method: "POST", url: "/payments", data });
