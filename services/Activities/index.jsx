import sendRequest from "../instance/sendRequest";

/** List activities for a specific entity */
export const getActivities = async (linkedToType, linkedToId) =>
  sendRequest({
    url: `/activities?linkedToType=${linkedToType}&linkedToId=${linkedToId}`,
    method: "GET",
  });

/** Create an activity linked to an entity */
export const createActivity = async (payload) =>
  sendRequest({ url: `/activities`, method: "POST", data: payload });

/** Delete an activity by ID */
export const deleteActivity = async (id) =>
  sendRequest({ url: `/activities/${id}`, method: "DELETE" });
