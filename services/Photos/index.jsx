import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B2: Photos ───────────────────────────────────────────────
// Two-step upload:
//   1. POST /photos/presign → { uploadUrl, s3Key, expiresIn }
//   2. PUT to S3 directly (NEVER proxy bytes through the API server)
//   3. POST /photos (commit) with the s3Key + metadata
//
// Constraints (server-enforced):
//   • s3Key must start with `documents/<orgId>/`
//   • contentType must start with `image/`
//   • byteSize ≤ 25 MB
//   • Presigned download URLs expire — fetch a fresh URL each mount

const base = "/photos";

export const presignPhotoUpload = (body) =>
  sendRequest({
    url: `${base}/presign`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/**
 * body: { s3Key, cxProjectId, assetId?, phaseId?, contentType, byteSize,
 *         title?, caption?, tags?, capturedAt?, geoLatitude?, geoLongitude?,
 *         width?, height? }
 */
export const commitPhoto = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

/**
 * params: { cxProjectId?, assetId?, phaseId?, tags?: string[], search?,
 *           cursor?, limit?, fromDate?, toDate? }
 */
export const listPhotos = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, x));
    else p.append(k, String(v));
  });
  return sendRequest({
    url: `${base}?${p.toString()}`,
    method: "GET",
  });
};

/** Returns { photo, downloadUrl }. downloadUrl is short-lived. */
export const getPhoto = (id) =>
  sendRequest({ url: `${base}/${encodeURIComponent(id)}`, method: "GET" });

export const retagPhoto = (id, tags) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/tags`,
    method: "PATCH",
    data: { tags },
    mutationId: true,
  });

export const deletePhoto = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}`,
    method: "DELETE",
    mutationId: true,
  });

export const listPhotoComments = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/comments`,
    method: "GET",
  });

export const commentPhoto = (id, body) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/comments`,
    method: "POST",
    data: { body },
    mutationId: true,
  });

export const photoTimeline = (cxProjectId) =>
  sendRequest({
    url: `${base}/timeline/${encodeURIComponent(cxProjectId)}`,
    method: "GET",
  });

export const PHOTO_TAGS = [
  "QAQC",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "NETA",
  "SAFETY",
  "WALK",
  "WITNESS",
  "PROGRESS",
  "ISSUE",
  "ASBUILT",
];

export const PHOTO_STATUSES = ["PENDING", "ACTIVE", "ARCHIVED", "DELETED"];
