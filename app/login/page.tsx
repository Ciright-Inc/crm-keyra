"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  AUTH_BACKEND_URL,
  buildCrmLoginReturnUrl,
  buildKeyraGetStartedLoginUrl,
  type AuthSessionResponse,
} from "@/lib/keyra-auth";

export default function LoginPage() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const returnUrl = useMemo(() => buildCrmLoginReturnUrl(), []);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
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

        if (!cancelled && response.ok && json.authenticated) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Let the user continue to the shared Keyra login flow.
      }

      if (!cancelled) {
        setIsCheckingSession(false);
      }
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleContinueToKeyra() {
    if (!returnUrl) {
      setFormMessage("Unable to determine the return URL for Keyra sign-in.");
      return;
    }

    setFormMessage("");
    setIsRedirecting(true);
    window.location.assign(buildKeyraGetStartedLoginUrl(returnUrl));
  }

  async function handleRefreshSession() {
    setFormMessage("");
    setIsCheckingSession(true);

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

      if (response.ok && json.authenticated) {
        router.replace("/dashboard");
        return;
      }

      setFormMessage("No active Keyra session found yet. Finish phone verification first.");
    } catch {
      setFormMessage("Unable to verify your Keyra session right now. Please try again.");
    } finally {
      setIsCheckingSession(false);
      setIsRedirecting(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{ background: "#f5f5f5" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--ds-hairline-strong)]" />
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-[14px] border"
        style={{
          background: "var(--ds-surface-card)",
          borderColor: "var(--ds-hairline-strong)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <section
            className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden p-10 lg:flex"
            style={{
              background: "linear-gradient(180deg, #0f0f10 0%, #171717 100%)",
              color: "var(--ds-on-dark)",
            }}
          >
            <div className="relative">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/12 bg-white/8 text-white">
                  <MaterialIcon name="hub" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.08em] text-white">KEYRA</p>
                  <p className="text-xs text-white/55">CRM Admin Console</p>
                </div>
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/50">
                Keyra Sign In
              </p>
              <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em] text-white">
                Secure access for the Keyra CRM workspace.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/62">
                Sign in with verified phone access through Keyra Get Started and return
                with the same shared Keyra session across Keyra sites.
              </p>
            </div>

            <div className="relative rounded-[12px] border border-white/10 bg-white/4 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-white/52">
                  Session Security
                </span>
                <span className="rounded-full border border-white/10 bg-white px-3 py-1 text-[11px] font-medium text-black">
                  Encrypted
                </span>
              </div>

              <div className="space-y-3">
                {[
                  "Phone verification",
                  "Shared Keyra session",
                  "Protected dashboard return",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-[10px] border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/72"
                  >
                    <span>{item}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 lg:p-12">
            <div className="mx-auto flex min-h-[560px] w-full max-w-md flex-col justify-center">
              <div className="mb-8">
                <div className="mb-6 lg:hidden">
                  <div className="inline-flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-black text-white">
                      <MaterialIcon name="hub" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[0.08em] text-black">KEYRA</p>
                      <p className="text-xs text-[var(--ds-body)]">CRM Admin Console</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ds-body)]">
                  Keyra Sign In
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--ds-ink)]">
                  Continue securely
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ds-body)]">
                  Sign in with your verified phone through Keyra Get Started. Once
                  verified, you will return here with the same shared Keyra session
                  used across Keyra sites.
                </p>
              </div>

              <div className="space-y-5">
                {formMessage ? (
                  <div
                    className="flex items-start gap-3 rounded-[18px] border px-4 py-3 text-sm"
                    style={{
                      borderColor: "rgba(220, 38, 38, 0.18)",
                      background: "rgba(220, 38, 38, 0.06)",
                      color: "#991b1b",
                    }}
                    role="alert"
                  >
                    <MaterialIcon name="error" size={20} className="shrink-0" />
                    <span>{formMessage}</span>
                  </div>
                ) : null}

                <div
                  className="rounded-[12px] border p-5"
                  style={{
                    borderColor: "var(--ds-hairline)",
                    background: "rgba(250, 250, 250, 0.7)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border"
                      style={{
                        borderColor: "var(--ds-hairline)",
                        background: "var(--ds-surface-card)",
                      }}
                    >
                      <MaterialIcon name="shield_lock" size={20} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-[var(--ds-ink)]">
                        Shared Keyra session
                      </p>
                      <p className="text-sm leading-6 text-[var(--ds-body)]">
                        Verify your phone once on `get-started.keyra.ie`, then return here
                        already signed in with the same Keyra identity.
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ds-body)]">
                        30-day session target · logout ends access explicitly
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="crm-btn-primary w-full"
                  disabled={isCheckingSession || isRedirecting}
                  onClick={handleContinueToKeyra}
                >
                  <MaterialIcon
                    name={isCheckingSession || isRedirecting ? "progress_activity" : "phone_iphone"}
                    size={20}
                  />
                  {isCheckingSession
                    ? "Checking session..."
                    : isRedirecting
                      ? "Opening Keyra login..."
                      : "Continue with Keyra phone login"}
                </button>

                <button
                  type="button"
                  className="crm-btn w-full"
                  disabled={isCheckingSession || isRedirecting}
                  onClick={() => void handleRefreshSession()}
                >
                  <MaterialIcon name="refresh" size={20} />
                  I already verified my phone
                </button>
              </div>

              <p className="mt-8 text-center text-xs leading-6 text-[var(--ds-body)]">
                Protected by shared Keyra phone verification and session cookies across
                Keyra sites.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
