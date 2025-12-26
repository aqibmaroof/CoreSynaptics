  import sendRequest from "../instance/sendRequest";

  export const UploadImage = async (ownerType, payload) => {
    try {
      const data = await sendRequest({
        url: `/media/upload?ownerType=${ownerType}`,
        method: "POST",
        data: payload, // FormData comes here
      });
      return data;
    } catch (error) {
      throw error;
    }
  };
