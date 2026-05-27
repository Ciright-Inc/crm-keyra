export const AUTH_BACKEND_URL =
  process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "https://auth.keyra.ie";

export const KEYRA_GET_STARTED_URL =
  process.env.NEXT_PUBLIC_KEYRA_GET_STARTED_URL || "https://get-started.keyra.ie";

const CRM_LOGIN_RETURN_URL = process.env.NEXT_PUBLIC_CRM_LOGIN_RETURN_URL || "";
const CRM_POST_AUTH_PATH = process.env.NEXT_PUBLIC_CRM_LOGIN_POST_AUTH_PATH || "/dashboard";

export type AuthSessionUser = {
  id: number;
  phone: string;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  profileComplete?: boolean;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user: AuthSessionUser | null;
};

export function buildCrmLoginReturnUrl() {
  if (CRM_LOGIN_RETURN_URL) {
    return CRM_LOGIN_RETURN_URL;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return new URL(CRM_POST_AUTH_PATH, window.location.origin).toString();
}

export function buildKeyraGetStartedLoginUrl(returnTo?: string) {
  const url = new URL(KEYRA_GET_STARTED_URL);

  if (returnTo) {
    url.searchParams.set("return", returnTo);
  }

  return url.toString();
}

export function getAuthUserDisplayLabel(user: AuthSessionUser | null | undefined) {
  const displayName = String(user?.displayName ?? "").trim();
  if (displayName) return displayName;

  const username = String(user?.username ?? "").trim();
  if (username) return username;

  const phone = String(user?.phone ?? "").trim();
  if (phone) return phone;

  return "Keyra session";
}
