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

/** Create a procurement / long-lead item (V2 — emits procurement.created → feed).
 *  payload: { cxProjectId, description (req), ownership (OFCI|CFCI, req),
 *             manufacturer?, model?, status?, vendor?, poc?, poSubmittalNo? }
 */
export const createProcurement = async (payload) =>
  sendRequest({ url: `/v2/procurement`, method: "POST", data: payload });
