"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEV_BYPASS = process.env.NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS === "true";
const HEALTH_TIMEOUT_MS = 12_000;

type AuthStatus = "loading" | "ready" | "error";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>(DEV_BYPASS ? "ready" : "loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifySession = useCallback(async () => {
    if (DEV_BYPASS) {
      setStatus("ready");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

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
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  if (status === "ready") {
    return <>{children}</>;
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
            <button type="button" className="crm-btn-primary" onClick={() => verifySession()}>
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
