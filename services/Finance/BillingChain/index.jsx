"use client";
import sendRequest from "../../instance/sendRequest";

// Returns full lifecycle chain for a project: tasks → vendors → invoices → payments
export const getBillingChain = (projectId) =>
  sendRequest({ method: "GET", url: `/finance/billing-chain/${projectId}` });

// List of all billing chains (one per project) with summary status
export const getAllBillingChains = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/billing-chain", params });

// Stage-level status update (e.g. mark task billing stage as "Invoiced")
export const updateChainStageStatus = (chainId, stage, data) =>
  sendRequest({ method: "PATCH", url: `/finance/billing-chain/${chainId}/stages/${stage}`, data });
