import axiosInstance from "./axiosConfig"; // Import from axiosConfig, not axiosInstance
import { newMutationId } from "./mutationId";

// PR-10 contract:
//   • Pass `mutationId: true` to auto-attach `x-mutation-id` and read the echo
//     back in `response.headers["x-mutation-id"]`.
//   • Pass `withMeta: true` to receive `{ data, etag, cacheVersion, mutationId,
//     status, headers }` instead of just the parsed body. Default stays
//     backward-compatible (returns body only).
//   • Pass `ifNoneMatch` to send the conditional `If-None-Match` header. A 304
//     response returns `null` data with `notModified: true`.

const sendRequest = async ({
  url,
  method = "GET",
  data,
  params,
  headers = {},
  mutationId = false,
  withMeta = false,
  ifNoneMatch,
}) => {
  try {
    const reqMutationId =
      mutationId === true ? newMutationId() : mutationId || null;

    const finalHeaders = { ...headers };
    if (reqMutationId) finalHeaders["x-mutation-id"] = reqMutationId;
    if (ifNoneMatch) finalHeaders["If-None-Match"] = ifNoneMatch;

    const config = {
      url,
      method,
      params,
      headers: finalHeaders,
      // We need to inspect headers; allow 304s through so callers can detect them.
      validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
    };

    if (data !== undefined) {
      config.data = data;
    }

    const response = await axiosInstance(config);

    if (!withMeta) return response.data;

    return {
      data: response.status === 304 ? null : response.data,
      etag: response.headers?.etag || response.headers?.ETag || null,
      cacheVersion: response.headers?.["x-cache-version"] || null,
      mutationId: response.headers?.["x-mutation-id"] || null,
      status: response.status,
      notModified: response.status === 304,
      headers: response.headers,
    };
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export default sendRequest;
