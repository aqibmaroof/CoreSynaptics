import axiosInstance from "./axiosConfig"; // Import from axiosConfig, not axiosInstance

const sendRequest = async ({
  url,
  method = "GET",
  data,
  params,
  headers = {},
}) => {
  try {
    const config = {
      url,
      method,
      params,
      headers,
    };

    // 👇 only attach data if it exists
    if (data !== undefined) {
      config.data = data;
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export default sendRequest;
