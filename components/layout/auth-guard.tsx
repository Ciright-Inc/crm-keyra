"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEV_BYPASS = process.env.NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS === "true";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(DEV_BYPASS);

  useEffect(() => {
    if (DEV_BYPASS) return;
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setReady(true);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) {
    return (
      <div className="crm-auth-screen">
        <p className="crm-auth-sub">Verifying Keyra session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
