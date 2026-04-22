import sendRequest from "./instance/sendRequest";

export const GetSetup = async (sessionId) => {
  try {
    const url = sessionId ? `/setup/draft/${sessionId}` : "/setup/draft";
    return await sendRequest({ url });
  } catch (error) {
    throw error;
  }
};

export const SaveCompany = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/1/company",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const SaveScope = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/2/scope",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const SaveFacility = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/3/facility",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const GetEquipmentDefaults = async () => {
  try {
    return await sendRequest({ url: "/setup/steps/4/equipment-defaults" });
  } catch (error) {
    throw error;
  }
};

export const SaveEquipment = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/4/equipment",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const GetSetupRoles = async (sessionId) => {
  try {
    return await sendRequest({
      url: `/setup/steps/5/role-presets/${sessionId}`,
    });
  } catch (error) {
    throw error;
  }
};

export const SaveTeam = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/5/team",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const SaveBrand = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/steps/6/brand",
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const GetReview = async (sessionId) => {
  try {
    return await sendRequest({
      url: `/setup/steps/7/review/${sessionId}`,
    });
  } catch (error) {
    throw error;
  }
};

export const FinalizeSetup = async (payload) => {
  try {
    return await sendRequest({
      url: "/setup/finalize",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};
