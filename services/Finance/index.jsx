"use client";
import sendRequest from "../instance/sendRequest";

export const getProjectFinancialList = () =>
  sendRequest({ method: "GET", url: "/finance/projects" });

export const getProjectFinancialSummary = (projectId) =>
  sendRequest({ method: "GET", url: `/finance/projects/${projectId}/summary` });
