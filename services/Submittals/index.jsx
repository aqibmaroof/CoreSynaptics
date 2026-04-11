import sendRequest from "../instance/sendRequest";

/** List submittals with optional filters (projectId, status, tradeCompanyId) */
export const getSubmittals = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await sendRequest({
      url: `/submittals${query ? `?${query}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Get a single submittal by ID */
export const getSubmittalById = async (id) => {
  try {
    const data = await sendRequest({ url: `/submittals/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Create a new submittal (number auto-generated server-side) */
export const createSubmittal = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/submittals`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Update submittal fields (title, spec_section, dates, notes, etc.) */
export const updateSubmittal = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/submittals/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Delete a submittal */
export const deleteSubmittal = async (id) => {
  try {
    const data = await sendRequest({ url: `/submittals/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Submit for review: transitions Open → Under Review */
export const submitForReview = async (id) => {
  try {
    const data = await sendRequest({
      url: `/submittals/${id}/submit-review`,
      method: "POST",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Approve submittal */
export const approveSubmittal = async (id, payload = {}) => {
  try {
    const data = await sendRequest({
      url: `/submittals/${id}/approve`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Reject submittal */
export const rejectSubmittal = async (id, payload = {}) => {
  try {
    const data = await sendRequest({
      url: `/submittals/${id}/reject`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Revise & Resubmit */
export const reviseSubmittal = async (id, payload = {}) => {
  try {
    const data = await sendRequest({
      url: `/submittals/${id}/revise`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
