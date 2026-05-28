"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";
import { useAuthSession } from "./auth-guard";
import { getAuthUserDisplayLabel, logoutSharedKeyraSession } from "@/lib/keyra-auth";

type TopBarProps = {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
};

export function TopBar({ menuOpen = false, onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [q, setQ] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    [
      "token",
      "userToken",
      "employeeDetails",
      "employees",
      "mfa",
      "appSessionLogId",
    ].forEach((key) => localStorage.removeItem(key));

    await logoutSharedKeyraSession();

    toast.success("Logged out successfully");
    router.replace("/login");
    router.refresh();
    setLoggingOut(false);
  }

  const userLabel = getAuthUserDisplayLabel(user);

  return (
    <header className="crm-topbar">
      <button
        type="button"
        className="crm-btn-icon crm-menu-toggle"
        onClick={onMenuToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="crm-sidebar-drawer"
      >
        <MaterialIcon name="menu" size={20} />
      </button>
      <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 max-w-md min-w-0">
        <MaterialIcon name="search" size={16} className="crm-muted-text shrink-0" />
        <input
          className="crm-search w-full"
          placeholder="Search companies, contacts, prospects, pipeline…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Global search"
        />
      </form>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm text-[var(--ds-ink)]">{userLabel}</p>
          <p className="crm-topbar-meta">{user?.phone ? "Verified phone access" : "Shared Keyra session"}</p>
        </div>
        <button
          type="button"
          className="crm-btn"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          aria-label="Logout"
        >
          <MaterialIcon name="logout" size={20} />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
