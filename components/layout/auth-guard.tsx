"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_BACKEND_URL,
  type AuthSessionResponse,
  type AuthSessionUser,
} from "@/lib/keyra-auth";

const DEV_BYPASS = process.env.NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS === "true";
const HEALTH_TIMEOUT_MS = 12_000;

type AuthStatus = "loading" | "ready" | "error";

type AuthSessionContextValue = {
  hydrated: boolean;
  user: AuthSessionUser | null;
  refreshSession: () => Promise<AuthSessionUser | null>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>(DEV_BYPASS ? "ready" : "loading");
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (DEV_BYPASS) {
      setUser(null);
      return null;
    }

    try {
      const response = await fetch(`${AUTH_BACKEND_URL}/auth/session`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const json = (await response.json()) as AuthSessionResponse;

      if (response.ok && json.authenticated && json.user) {
        setUser(json.user);
        return json.user;
      }
    } catch {
      // Ignore network errors and send the user through the shared login handoff.
    }

    setUser(null);
    return null;
  }, []);

  const verifySession = useCallback(async () => {
    if (DEV_BYPASS) {
      setStatus("ready");
      setErrorMessage(null);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const sessionUser = await refreshSession();
    if (!sessionUser) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
      const res = await fetch("/api/health", {
        signal: controller.signal,
        cache: "no-store",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && body.ok) {
        setStatus("ready");
        return;
      }

      const msg =
        body.error ||
        (res.status === 503
          ? "Database unavailable"
          : `Health check failed (${res.status})`);
      setErrorMessage(msg);
      setStatus("error");
    } catch (e) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "Connection timed out. The server cannot reach the database (check DATABASE_URL on Railway)."
          : e instanceof Error
            ? e.message
            : "Network error";
      setErrorMessage(msg);
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  }, [refreshSession, router]);

  useEffect(() => {
    void verifySession();
  }, [verifySession]);

  const value = useMemo(
    () => ({
      hydrated: status !== "loading",
      user,
      refreshSession,
    }),
    [refreshSession, status, user]
  );

  if (status === "ready") {
    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
  }

  if (status === "error") {
    return (
      <div className="crm-auth-screen">
        <div className="crm-auth-card" style={{ maxWidth: "28rem", textAlign: "left" }}>
          <h1 className="crm-auth-title">CRM unavailable</h1>
          <p className="crm-auth-sub" style={{ marginTop: "12px" }}>
            {errorMessage}
          </p>
          <ul
            className="crm-auth-note"
            style={{ marginTop: "16px", paddingLeft: "1.25rem", listStyle: "disc" }}
          >
            <li>
              <strong>Railway:</strong> <code className="crm-auth-code">DATABASE_URL</code> must
              point to Postgres reachable from the cloud (not a private LAN IP like 192.168.x).
            </li>
            <li>
              Use Railway Postgres or RDS with SSL; set{" "}
              <code className="crm-auth-code">PGSSLMODE=require</code> when needed.
            </li>
            <li>
              For internal demo without DB auth, set{" "}
              <code className="crm-auth-code">NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=true</code> and{" "}
              <strong>redeploy</strong> (Next.js bakes this in at build time).
            </li>
          </ul>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="crm-btn-primary"
              onClick={() => void verifySession()}
            >
              Retry
            </button>
            <button
              type="button"
              className="crm-btn"
              onClick={() => router.replace("/login")}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-auth-screen">
      <p className="crm-auth-sub">Verifying Keyra session…</p>
    </div>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthGuard");
  }

  return context;
}
