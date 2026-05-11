import sendRequest from "../instance/sendRequest";

/**
 * Step 1 — Create an onboarding session.
 * Returns { sessionId, expiresAt }.
 * Safe to call multiple times — reuse sessionId until expiry.
 */
export const createOnboardingSession = (companyName) =>
  sendRequest({
    method: "POST",
    url: "/onboarding/session",
    data: { companyName },
  });

/**
 * Step 2 — Request a presigned S3 PUT URL for the logo.
 * Returns { uploadUrl, s3Key, expiresIn }.
 * Store s3Key for later submission — never use it as an image src directly.
 * To preview the uploaded image, call getOnboardingSession() which returns
 * presigned viewUrl values for each confirmed asset.
 */
export const getOnboardingUploadUrl = (payload) =>
  sendRequest({
    method: "POST",
    url: "/onboarding/upload-url",
    data: payload,
    // payload shape:
    // { sessionId, fileName, fileType, assetType: "logo", fileSize }
  });

/**
 * Fetch session state including presigned view URLs for all uploaded assets.
 * Returns { sessionId, companyName, step, expiresAt, assets[] }.
 * Each asset has { assetType, fileName, viewUrl, expiresIn, confirmed }.
 * viewUrl is a short-lived presigned GET URL (30 min) — use it directly as <img src>.
 */
export const getOnboardingSession = (sessionId) =>
  sendRequest({
    method: "GET",
    url: `/onboarding/session/${sessionId}`,
  });

/**
 * Step 3 — Confirm the file was successfully uploaded to S3.
 * Returns { confirmed: true }.
 */
export const confirmOnboardingUpload = (sessionId, s3Key) =>
  sendRequest({
    method: "POST",
    url: "/onboarding/confirm-upload",
    data: { sessionId, s3Key },
  });

/**
 * Upload a file directly to S3 using a presigned PUT URL.
 * Bypasses the app backend — uses plain XHR for progress tracking.
 *
 * @param {string}   uploadUrl  presigned PUT URL from getOnboardingUploadUrl
 * @param {File}     file       the File object selected by the user
 * @param {function} onProgress optional callback receiving 0–100
 */
export const putFileToS3 = (uploadUrl, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed — status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("S3 upload network error"));
    xhr.send(file);
  });
