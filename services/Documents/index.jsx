import sendRequest from "../instance/sendRequest";

// ─── Upload flow ──────────────────────────────────────────────────────────────

/**
 * Step 1: Create the document record and get a presigned S3 PUT URL.
 * Call this first. The document record is created immediately; the file is
 * not confirmed until you call confirmUpload().
 *
 * Required body fields: title, projectId, siteId, subProjectId,
 *                       fileName, mimeType, fileSize (positive number)
 * Optional: description, zoneId, assetId, category, linkedToType, linkedToId
 */
export const requestUploadUrl = (data) =>
  sendRequest({ method: "POST", url: "/documents/upload-url", data });

/**
 * Step 2: Upload the actual file directly to S3 using the presigned URL.
 * This bypasses the app backend — call with plain fetch, not sendRequest.
 *
 * @param {string} uploadUrl   presigned PUT URL returned by requestUploadUrl
 * @param {File}   file        the File object selected by the user
 * @param {function} onProgress optional callback (0–100)
 */
export const uploadFileToS3 = (uploadUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
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
      else reject(new Error(`S3 upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("S3 upload network error"));
    xhr.send(file);
  });
};

/**
 * Step 3: Confirm that the file was successfully uploaded to S3.
 * The backend verifies the file exists in storage before confirming.
 * Returns the full document object.
 */
export const confirmUpload = (documentId) =>
  sendRequest({ method: "POST", url: `/documents/${documentId}/confirm-upload` });

// ─── Re-upload (versioning) ───────────────────────────────────────────────────

/**
 * Replace the file on an existing document.
 * Increments the document version and returns a new presigned PUT URL.
 * After uploading the new file to S3, call confirmUpload() again.
 *
 * Required body: fileName, mimeType, fileSize
 * Optional: category
 */
export const requestReuploadUrl = (documentId, data) =>
  sendRequest({ method: "PUT", url: `/documents/${documentId}/reupload`, data });

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * List documents. Exactly ONE of the following filter combos is required:
 *   • one hierarchy key: projectId | siteId | subProjectId | zoneId | assetId
 *   • both: linkedToType + linkedToId
 */
export const getDocuments = (params) =>
  sendRequest({ method: "GET", url: "/documents", params });

export const getDocumentById = (id) =>
  sendRequest({ method: "GET", url: `/documents/${id}` });

/**
 * Get a presigned S3 download URL (expires in 900 s).
 * Returns { downloadUrl, expiresIn }.
 */
export const getDownloadUrl = (id) =>
  sendRequest({ method: "GET", url: `/documents/${id}/download-url` });

/**
 * Update document metadata only (not the file).
 * Allowed fields: title, description, category, linkedToType, linkedToId
 * Deleted documents cannot be updated.
 */
export const updateDocument = (id, data) =>
  sendRequest({ method: "PATCH", url: `/documents/${id}`, data });

/**
 * Soft-delete a document. Changes status to DELETED.
 * Returns { message, documentId }.
 */
export const deleteDocument = (id) =>
  sendRequest({ method: "DELETE", url: `/documents/${id}` });
