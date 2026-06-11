import sendRequest from "../instance/sendRequest";

/** List procurement / long-lead items.
 *  params: { cxProjectId, status, ownership, page, limit }
 */
export const getProcurementItems = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({
    url: `/procurement${query ? `?${query}` : ""}`,
    method: "GET",
  });
};
