export const toAuthEmail = (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("@")) return normalized;
  return `${normalized}@pharmacy.local`;
};

const getAdminAllowList = () => {
  const envList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const defaultList = ["ajeet21@pharmacy.local", "admin@pharmacy.local"];
  return Array.from(new Set([...defaultList, ...envList]));
};

export const isAllowedAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return getAdminAllowList().includes(email.toLowerCase());
};

export const isAdminFromToken = (claims: Record<string, unknown>, email?: string | null) => {
  if (claims.admin === true) return true;
  if (claims.role === "admin") return true;
  return isAllowedAdminEmail(email);
};