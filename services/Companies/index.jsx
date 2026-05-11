import sendRequest from "../instance/sendRequest";

/** List all companies in the current organization */
export const getCompanies = async () => {
  return sendRequest({ url: `/companies`, method: "GET" });
};

/** Get a single company by ID */
export const getCompanyById = async (id) => {
  return sendRequest({ url: `/companies/${id}`, method: "GET" });
};

/**
 * Create a new company.
 * payload: { name, type, region, subscriptionPlan?, subscriptionActive? }
 * type: CLIENT | SUBCONTRACTOR | VENDOR | PARTNER | CONSULTANT | OTHER
 */
export const createCompany = async (payload) => {
  return sendRequest({ url: `/companies`, method: "POST", data: payload });
};

/**
 * Update company details via PUT.
 * payload: { name?, type?, region?, subscriptionPlan?, subscriptionActive? }
 * Name must remain unique within the organization.
 */
export const updateCompany = async (id, payload) => {
  return sendRequest({ url: `/companies/${id}`, method: "PUT", data: payload });
};

/**
 * Soft-delete a company (sets deletedAt internally).
 * Returns: { message, companyId }
 */
export const deleteCompany = async (id) => {
  return sendRequest({ url: `/companies/${id}`, method: "DELETE" });
};
