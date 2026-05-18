"use client";

// ── Phase v15 B2: Photo gallery + two-step upload ───────────────────────────
// Upload: presign → PUT to S3 (browser → S3, NEVER through the API) → commit.
// Constraints: contentType image/*, byteSize ≤ 25MB, server validates s3Key
// prefix. Presigned download URLs expire — fetch fresh on each card mount.

import { useCallback, useEffect, useState } from "react";
import {
  listPhotos,
  presignPhotoUpload,
  commitPhoto,
  getPhoto,
  retagPhoto,
  deletePhoto,
  photoTimeline,
  PHOTO_TAGS,
} from "@/services/Photos";

export default function Photos({ cxProjectId }) {
  const [photos, setPhotos] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const refresh = useCallback(async () => {
    if (!cxProjectId) return;
    setLoading(true);
    setError("");
    try {
      const [list, tl] = await Promise.all([
        listPhotos({
          cxProjectId,
          tags: tags.length ? tags : undefined,
          limit: 100,
        }),
        photoTimeline(cxProjectId).catch(() => []),
      ]);
      const items = Array.isArray(list?.data)
        ? list.data
        : Array.isArray(list)
        ? list
        : list?.items ?? [];
      setPhotos(items);
      setTimeline(Array.isArray(tl) ? tl : tl?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId, tags]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!cxProjectId) {
    return (
      <div style={{ padding: 24, color: "var(--rf-txt3)" }}>
        Pick a project (set <code>?cxProjectId=…</code>) to view photos.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Photos</h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Two-step upload via S3 presign. Tags drive QA / readiness gates
            downstream.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowUpload(true)}
        >
          + Upload photo
        </button>
      </header>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}
      >
        {PHOTO_TAGS.map((t) => {
          const active = tags.includes(t);
          return (
            <button
              key={t}
              className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
              onClick={() =>
                setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
              }
              style={{ fontSize: 11 }}
            >
              {t}
            </button>
          );
        })}
        {tags.length > 0 && (
          <button
            className="rf-btn"
            onClick={() => setTags([])}
            style={{ fontSize: 11, color: "var(--rf-txt3)" }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 16,
        }}
      >
        <aside className="rf-card" style={{ padding: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
              marginBottom: 6,
            }}
          >
            Timeline
          </div>
          {timeline.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
              No photos yet.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {timeline.map((b) => (
                <li
                  key={b.month}
                  style={{
                    padding: 6,
                    borderTop: "1px solid var(--rf-border)",
                    fontSize: 12,
                  }}
                >
                  <strong>{b.month}</strong>
                  <span
                    style={{
                      marginLeft: 6,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {b.count} photos
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main>
          {loading && photos.length === 0 ? (
            <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
          ) : photos.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--rf-txt3)",
              }}
            >
              No photos match.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {photos.map((p) => (
                <PhotoCard key={p.id} photo={p} onChange={refresh} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal
          cxProjectId={cxProjectId}
          onClose={() => setShowUpload(false)}
          onDone={() => {
            setShowUpload(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function PhotoCard({ photo, onChange }) {
  const [url, setUrl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draftTags, setDraftTags] = useState(photo.tags || []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getPhoto(photo.id);
        if (!cancelled) setUrl(r?.downloadUrl || null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photo.id]);

  const saveTags = async () => {
    setBusy(true);
    try {
      await retagPhoto(photo.id, draftTags);
      setEditing(false);
      onChange?.();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this photo?")) return;
    setBusy(true);
    try {
      await deletePhoto(photo.id);
      onChange?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className="rf-card"
      style={{ padding: 8, display: "grid", gap: 6 }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={photo.title || photo.s3Key}
          style={{
            width: "100%",
            aspectRatio: "4/3",
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
      ) : (
        <div
          style={{
            aspectRatio: "4/3",
            background: "var(--rf-bg3)",
            borderRadius: 6,
          }}
        />
      )}
      <div style={{ fontSize: 13, fontWeight: 600 }}>
        {photo.title || "Untitled"}
      </div>
      {photo.caption && (
        <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
          {photo.caption}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {(editing ? draftTags : photo.tags || []).map((t) => (
          <span
            key={t}
            style={{
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              background: "var(--rf-bg3)",
              color: "var(--rf-txt3)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      {editing && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {PHOTO_TAGS.map((t) => {
            const active = draftTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
                onClick={() =>
                  setDraftTags((p) =>
                    p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
                  )
                }
                style={{ fontSize: 10 }}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        {editing ? (
          <>
            <button
              className="rf-btn rf-btn-primary"
              onClick={saveTags}
              disabled={busy}
              style={{ fontSize: 11 }}
            >
              Save tags
            </button>
            <button
              className="rf-btn"
              onClick={() => {
                setEditing(false);
                setDraftTags(photo.tags || []);
              }}
              disabled={busy}
              style={{ fontSize: 11 }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="rf-btn"
              onClick={() => setEditing(true)}
              style={{ fontSize: 11 }}
            >
              Retag
            </button>
            <button
              className="rf-btn"
              onClick={remove}
              disabled={busy}
              style={{ fontSize: 11, color: "var(--rf-red)" }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function UploadModal({ cxProjectId, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [progress, setProgress] = useState("idle");
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image/* files.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File exceeds 25 MB cap.");
      return;
    }
    setError("");
    try {
      setProgress("presigning");
      const { uploadUrl, s3Key } = await presignPhotoUpload({
        cxProjectId,
        fileName: file.name,
        contentType: file.type,
        byteSize: file.size,
      });
      setProgress("uploading");
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`S3 upload failed (${put.status})`);
      setProgress("committing");
      const dims = await readImageDims(file);
      await commitPhoto({
        s3Key,
        cxProjectId,
        contentType: file.type,
        byteSize: file.size,
        title: title || undefined,
        caption: caption || undefined,
        tags,
        width: dims.width || undefined,
        height: dims.height || undefined,
      });
      onDone?.();
    } catch (e) {
      setError(e?.message || "Upload failed");
      setProgress("error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="rf-card"
        style={{ padding: 20, maxWidth: 540, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Upload photo
        </h2>
        {error && (
          <div
            style={{
              padding: 8,
              background: "rgba(239,68,68,0.12)",
              color: "var(--rf-red)",
              borderRadius: 6,
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 10 }}
        />
        <input
          className="rf-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 8, width: "100%" }}
        />
        <textarea
          className="rf-input"
          placeholder="Caption"
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ marginBottom: 8, width: "100%" }}
        />
        <div
          style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}
        >
          {PHOTO_TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
                onClick={() =>
                  setTags((p) =>
                    p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
                  )
                }
                style={{ fontSize: 10 }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            className="rf-btn"
            onClick={onClose}
            disabled={["uploading", "committing", "presigning"].includes(progress)}
          >
            Cancel
          </button>
          <button
            className="rf-btn rf-btn-primary"
            onClick={upload}
            disabled={!file || ["uploading", "committing", "presigning"].includes(progress)}
          >
            {progress === "uploading"
              ? "Uploading…"
              : progress === "committing"
              ? "Committing…"
              : progress === "presigning"
              ? "Presigning…"
              : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function readImageDims(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}
