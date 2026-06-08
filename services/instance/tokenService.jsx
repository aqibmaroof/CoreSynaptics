export const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

export const getRefreshToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

export const setTokens = ({ accessToken, refreshToken }) => {
  if (typeof window === "undefined") return;
  accessToken && localStorage.setItem("accessToken", accessToken);
  refreshToken && localStorage.setItem("refreshToken", refreshToken);
};

export const setUser = ({ user }) => {
  if (typeof window === "undefined") return;
  user && localStorage.setItem("user", JSON.stringify(user));
};

export const setOrganization = ({ organization }) => {
  if (typeof window === "undefined") return;
  if (!organization) return;
  // Strip presigned logoUrl before caching — it expires in 30 min and would
  // cause a broken image on return visits. The sidebar fetches a fresh URL on
  // every mount via GetOrganization().
  const cacheable = { ...organization };
  localStorage.setItem("organization", JSON.stringify(cacheable));
};

export const getUser = () =>
  typeof window !== "undefined" ? localStorage.getItem("user") : null;

export const getOrganization = () =>
  typeof window !== "undefined" ? localStorage.getItem("organization") : null;

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // Clear per-user cached state so it can't leak into the next session on a
  // shared browser. The project-wizard draft is the important one: a draftId
  // left behind belongs to the previous user's org and 404s on save for the
  // next user (tenant isolation), wedging the wizard.
  localStorage.removeItem("user");
  localStorage.removeItem("organization");
  localStorage.removeItem("cxcontrol_wizard_draftId");
  localStorage.removeItem("cxcontrol_project_wizard_v4");
};
