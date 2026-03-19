/**
 * Returns the backend base URL for server-side API route proxying.
 * Strips any trailing slash from API_BASE_URL and ensures API_BASE_PATH
 * starts with a leading slash before concatenating.
 */
export const getBackendBase = () =>
  (process.env.API_BASE_URL ?? "").replace(/\/$/, "") +
  (process.env.API_BASE_PATH ?? "/api/v1").replace(/^(?!\/)/, "/")
