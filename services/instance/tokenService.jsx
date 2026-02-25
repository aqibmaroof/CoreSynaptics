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
  organization &&
    localStorage.setItem("organization", JSON.stringify(organization));
};

export const getUser = () =>
  typeof window !== "undefined" ? localStorage.getItem("user") : null;

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
