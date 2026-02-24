import sendRequest from "../instance/sendRequest";

export const getSubscriptions = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/subscription-plans`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteSubscription = async (id) => {
  try {
    const data = await sendRequest({
      url: `/subscription-plans/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateSubscription = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/subscription-plans/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateSubscription = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/subscription-plans`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetSubscriptionById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/subscription-plans/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
