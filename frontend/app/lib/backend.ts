const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://healthcare-czr7.onrender.com";

export const BACKEND_URL = rawBackendUrl.replace(/\/$/, "");
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

export const normalizeBackendUrl = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && parsed.port === "5000") {
      return `${BACKEND_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return value;
  } catch {
    return `${BACKEND_URL}${value.startsWith("/") ? value : `/${value}`}`;
  }
};