"use client";
import sendRequest from "../../instance/sendRequest";

export const getContracts = (params = {}) =>
  sendRequest({ method: "GET", url: "/contracts", params });

export const getContractById = (id) =>
  sendRequest({ method: "GET", url: `/contracts/${id}` });

export const createContract = (data) =>
  sendRequest({ method: "POST", url: "/contracts", data });

export const updateContract = (id, data) =>
  sendRequest({ method: "PATCH", url: `/contracts/${id}`, data });

export const deleteContract = (id) =>
  sendRequest({ method: "DELETE", url: `/contracts/${id}` });
