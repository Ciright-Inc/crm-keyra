export const AUTH_BACKEND_URL =
  process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "https://auth.keyra.ie";

export const KEYRA_GET_STARTED_URL =
  process.env.NEXT_PUBLIC_KEYRA_GET_STARTED_URL || "https://get-started.keyra.ie";

export const CRM_AUTH_RETURN_PARAM = "auth_return";

const CRM_LOGIN_RETURN_URL = process.env.NEXT_PUBLIC_CRM_LOGIN_RETURN_URL || "";
const CRM_POST_AUTH_PATH =
  process.env.NEXT_PUBLIC_CRM_LOGIN_POST_AUTH_PATH || `/login?${CRM_AUTH_RETURN_PARAM}=1`;

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
  const baseUrl =
    CRM_LOGIN_RETURN_URL || (typeof window !== "undefined" ? window.location.origin : "");

  if (!baseUrl) {
    return "";
  }

  const url = new URL(baseUrl);
  url.pathname = "/login";
  url.searchParams.set(CRM_AUTH_RETURN_PARAM, "1");
  return url.toString();
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
