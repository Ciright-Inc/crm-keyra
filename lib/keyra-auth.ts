const PROD_AUTH_BACKEND_URL = "https://auth.keyra.ie";
const PROD_GET_STARTED_URL = "https://get-started.keyra.ie";
const PROD_RAILWAY_CRM_ORIGIN = "https://crm-keyra-production.up.railway.app";
const LOCAL_AUTH_BACKEND_URL = "http://localhost:4000";
const LOCAL_GET_STARTED_URL = "http://localhost:5173";
const AUTH_PROXY_PATH = "/api/keyra-auth";

function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1";
}

function isKeyraSubdomainHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "keyra.ie" || normalized.endsWith(".keyra.ie");
}

function isRailwayAppHostname(hostname: string) {
  return hostname.toLowerCase().endsWith(".up.railway.app");
}

/** Hosts outside *.keyra.ie must call auth.keyra.ie directly (cross-site credentialed fetch). */
export function isCrossSiteKeyraHost(hostname = typeof window !== "undefined" ? window.location.hostname : "") {
  const normalized = String(hostname ?? "").trim().toLowerCase();
  if (!normalized || isLoopbackHostname(normalized)) return false;
  return !isKeyraSubdomainHostname(normalized);
}

function shouldUseLocalKeyraDefaults() {
  if (typeof window !== "undefined") {
    return isLoopbackHostname(window.location.hostname);
  }

  return process.env.NODE_ENV !== "production";
}

function normalizeConfiguredServiceUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${trimmed === "/" ? "" : trimmed}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function resolveKeyraServiceUrl(
  envValue: string | undefined,
  productionUrl: string,
  localUrl: string,
) {
  const trimmed = String(envValue ?? "").trim();
  if (trimmed) {
    return normalizeConfiguredServiceUrl(trimmed);
  }

  return shouldUseLocalKeyraDefaults() ? localUrl : productionUrl;
}

/**
 * Client auth API base URL (evaluated in the browser when possible).
 *
 * - *.keyra.ie → same-origin `/api/keyra-auth` proxy (session cookie always sent)
 * - *.up.railway.app → direct `https://auth.keyra.ie` (browser sends `.keyra.ie` cookie cross-site)
 * - localhost → direct `http://localhost:4000`
 */
export function resolveClientAuthBackendUrl(): string {
  const envConfigured =
    process.env.NEXT_PUBLIC_KEYRA_AUTH_BACKEND_URL ||
    process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL;

  if (envConfigured?.trim()) {
    return normalizeConfiguredServiceUrl(envConfigured);
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (isKeyraSubdomainHostname(hostname)) {
      return `${window.location.origin}${AUTH_PROXY_PATH}`;
    }

    if (isRailwayAppHostname(hostname) || isCrossSiteKeyraHost(hostname)) {
      return PROD_AUTH_BACKEND_URL;
    }

    if (isLoopbackHostname(hostname)) {
      return LOCAL_AUTH_BACKEND_URL;
    }
  }

  return shouldUseLocalKeyraDefaults() ? LOCAL_AUTH_BACKEND_URL : PROD_AUTH_BACKEND_URL;
}

export const AUTH_BACKEND_URL = resolveKeyraServiceUrl(
  process.env.NEXT_PUBLIC_KEYRA_AUTH_BACKEND_URL ||
    process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL,
  PROD_AUTH_BACKEND_URL,
  LOCAL_AUTH_BACKEND_URL,
);

export const AUTH_BACKEND_TARGET_URL = resolveKeyraServiceUrl(
  process.env.KEYRA_AUTH_BACKEND_URL || process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL,
  PROD_AUTH_BACKEND_URL,
  LOCAL_AUTH_BACKEND_URL,
);

export const AUTH_BACKEND_PROXY_URL = AUTH_PROXY_PATH;

export function authSessionEndpoint() {
  return `${resolveClientAuthBackendUrl()}/auth/session`;
}

export function authLogoutEndpoint() {
  return `${resolveClientAuthBackendUrl()}/auth/logout`;
}

/** @deprecated Prefer authSessionEndpoint() — resolved at call time for Railway vs keyra.ie hosts. */
export const AUTH_SESSION_ENDPOINT = `${AUTH_BACKEND_URL}/auth/session`;

/** @deprecated Prefer authLogoutEndpoint() — resolved at call time for Railway vs keyra.ie hosts. */
export const AUTH_LOGOUT_ENDPOINT = `${AUTH_BACKEND_URL}/auth/logout`;

export const KEYRA_GET_STARTED_URL = resolveKeyraServiceUrl(
  process.env.NEXT_PUBLIC_KEYRA_GET_STARTED_URL,
  PROD_GET_STARTED_URL,
  LOCAL_GET_STARTED_URL,
);

export const CRM_AUTH_RETURN_PARAM = "auth_return";
export const AUTH_RETURN_POLL_MS = 30_000;
export const AUTH_RETURN_RETRY_MS = 800;
export const AUTH_SESSION_SYNC_MS = 2_500;
const AUTH_SESSION_TIMEOUT_MS = 12_000;

const CRM_LOGIN_RETURN_URL = process.env.NEXT_PUBLIC_CRM_LOGIN_RETURN_URL || "";
const CRM_POST_AUTH_PATH =
  process.env.NEXT_PUBLIC_CRM_LOGIN_POST_AUTH_PATH || `/login?${CRM_AUTH_RETURN_PARAM}=1`;

/** Live Railway deploy — used until crm.keyra.ie custom domain is attached. */
export const PROD_RAILWAY_CRM_LOGIN_RETURN_URL = `${PROD_RAILWAY_CRM_ORIGIN}${CRM_POST_AUTH_PATH.startsWith("/") ? CRM_POST_AUTH_PATH : `/${CRM_POST_AUTH_PATH}`}`;

export type AuthSessionUser = {
  id: number;
  phone: string;
  email?: string | null;
  fullName?: string | null;
  username?: string | null;
  displayName?: string | null;
  profileComplete?: boolean;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user: AuthSessionUser | null;
};

type RawAuthSessionUser = Partial<AuthSessionUser> & {
  phone_e164?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  user_name?: string | null;
  preferred_username?: string | null;
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile?: Partial<AuthSessionUser> & {
    phone_e164?: string | null;
    full_name?: string | null;
    display_name?: string | null;
    user_name?: string | null;
    preferred_username?: string | null;
    name?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
};

function pickTrimmedValue(...values: Array<string | number | null | undefined>) {
  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function buildFullName(...parts: Array<string | null | undefined>) {
  const trimmedParts = parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);
  return trimmedParts.join(" ");
}

function collectRawAuthSessionUsers(user: RawAuthSessionUser) {
  const sources = [user];

  if (user.profile && typeof user.profile === "object") {
    sources.push(user.profile);
  }

  return sources;
}

export function normalizeAuthSessionUser(user: unknown): AuthSessionUser | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const raw = user as RawAuthSessionUser;
  const sources = collectRawAuthSessionUsers(raw);
  const id = Number(raw.id);
  const phone = pickTrimmedValue(...sources.flatMap((source) => [source.phone, source.phone_e164]));

  if (!Number.isFinite(id) || !phone) {
    return null;
  }

  const displayName = pickTrimmedValue(
    ...sources.flatMap((source) => [source.displayName, source.display_name, source.name]),
  );
  const fullName = pickTrimmedValue(
    ...sources.flatMap((source) => [
      source.fullName,
      source.full_name,
      buildFullName(source.givenName, source.familyName),
      buildFullName(source.given_name, source.family_name),
      buildFullName(source.firstName, source.lastName),
      buildFullName(source.first_name, source.last_name),
    ]),
  );
  const username = pickTrimmedValue(
    ...sources.flatMap((source) => [source.username, source.user_name, source.preferred_username]),
  );
  const email = pickTrimmedValue(...sources.map((source) => source.email));

  return {
    id,
    phone,
    displayName: displayName || null,
    fullName: fullName || null,
    username: username || null,
    email: email || null,
    profileComplete: typeof raw.profileComplete === "boolean" ? raw.profileComplete : undefined,
  };
}

export function normalizeAuthSessionResponse(payload: unknown): AuthSessionResponse {
  if (!payload || typeof payload !== "object") {
    return { authenticated: false, user: null };
  }

  const raw = payload as { authenticated?: unknown; user?: unknown };
  const user = normalizeAuthSessionUser(raw.user);
  const authenticated = Boolean(raw.authenticated) && Boolean(user);

  return {
    authenticated,
    user: authenticated ? user : null,
  };
}

export function buildCrmLoginReturnUrl() {
  const configured = CRM_LOGIN_RETURN_URL.trim();
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();

    if (isRailwayAppHostname(hostname)) {
      return PROD_RAILWAY_CRM_LOGIN_RETURN_URL;
    }

    return new URL(CRM_POST_AUTH_PATH, window.location.origin).toString();
  }

  if (process.env.NODE_ENV === "production") {
    return PROD_RAILWAY_CRM_LOGIN_RETURN_URL;
  }

  return "";
}

export function buildKeyraGetStartedLoginUrl(returnTo?: string) {
  const url = new URL(KEYRA_GET_STARTED_URL);

  if (returnTo) {
    url.searchParams.set("return", returnTo);
  }

  return url.toString();
}

async function ensureCrossSiteCookieAccess() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (!isCrossSiteKeyraHost(window.location.hostname)) {
    return;
  }

  if (typeof document.requestStorageAccess !== "function") {
    return;
  }

  try {
    await document.requestStorageAccess();
  } catch {
    // Browser denied or feature unavailable — continue with credentialed fetch.
  }
}

export async function fetchSharedKeyraSession() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AUTH_SESSION_TIMEOUT_MS);

  try {
    await ensureCrossSiteCookieAccess();

    const response = await fetch(authSessionEndpoint(), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const json = normalizeAuthSessionResponse((await response.json()) as AuthSessionResponse);
    if (response.ok && json.authenticated && json.user) {
      return json;
    }
  } catch {
    // Let the caller decide whether to retry or redirect.
  } finally {
    window.clearTimeout(timeout);
  }

  return {
    authenticated: false,
    user: null,
  } satisfies AuthSessionResponse;
}

export function getAuthUserDisplayLabel(user: AuthSessionUser | null | undefined) {
  const displayName = String(user?.displayName ?? "").trim();
  if (displayName) return displayName;

  const fullName = String(user?.fullName ?? "").trim();
  if (fullName) return fullName;

  const username = String(user?.username ?? "").trim();
  if (username) return username;

  const email = String(user?.email ?? "").trim();
  if (email) return email;

  const phone = String(user?.phone ?? "").trim();
  if (phone) return phone;

  return "Keyra member";
}

export function getAuthUserInitials(user: AuthSessionUser | null | undefined) {
  const label = getAuthUserDisplayLabel(user);
  if (!label || label === "Keyra member") return "K";

  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }

  return label.slice(0, 2).toUpperCase();
}

async function waitForSharedKeyraSessionLogout(timeoutMs: number, retryMs = 250) {
  const deadline = Date.now() + timeoutMs;

  do {
    const session = await fetchSharedKeyraSession();
    if (!session.authenticated) {
      return true;
    }

    if (Date.now() >= deadline) {
      break;
    }

    await new Promise((resolve) => window.setTimeout(resolve, retryMs));
  } while (true);

  return false;
}

export async function logoutSharedKeyraSession(timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    await ensureCrossSiteCookieAccess();

    await fetch(authLogoutEndpoint(), {
      method: "POST",
      credentials: "include",
      keepalive: true,
      signal: controller.signal,
    });
  } catch {
    // Best effort only. Local navigation should not be blocked by a slow auth backend.
  } finally {
    window.clearTimeout(timer);
  }

  return waitForSharedKeyraSessionLogout(Math.max(timeoutMs, 1500));
}
