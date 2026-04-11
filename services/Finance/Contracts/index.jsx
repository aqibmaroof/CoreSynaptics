"use client";
import sendRequest from "../../instance/sendRequest";

export const getContracts = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/contracts", params });

export const getContractById = (id) =>
  sendRequest({ method: "GET", url: `/finance/contracts/${id}` });

export const createContract = (data) =>
  sendRequest({ method: "POST", url: "/finance/contracts", data });

export const updateContract = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/contracts/${id}`, data });

export const deleteContract = (id) =>
  sendRequest({ method: "DELETE", url: `/finance/contracts/${id}` });

// Budget allocations per task/subtask within a contract
export const getContractBudgetAllocations = (contractId) =>
  sendRequest({ method: "GET", url: `/finance/contracts/${contractId}/allocations` });

export const createBudgetAllocation = (contractId, data) =>
  sendRequest({ method: "POST", url: `/finance/contracts/${contractId}/allocations`, data });

export const updateBudgetAllocation = (contractId, allocationId, data) =>
  sendRequest({ method: "PATCH", url: `/finance/contracts/${contractId}/allocations/${allocationId}`, data });

export const deleteBudgetAllocation = (contractId, allocationId) =>
  sendRequest({ method: "DELETE", url: `/finance/contracts/${contractId}/allocations/${allocationId}` });

// Budget consumption snapshot (calculated server-side from tasks)
export const getContractBudgetSummary = (contractId) =>
  sendRequest({ method: "GET", url: `/finance/contracts/${contractId}/budget-summary` });
