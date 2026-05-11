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
 * Returns { uploadUrl, fileUrl, s3Key }.
 * fileUrl is the permanent public URL — store this as logoUrl.
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
