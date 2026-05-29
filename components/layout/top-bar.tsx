"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";
import { useAuthSession } from "./auth-guard";
import { logoutSharedKeyraSession } from "@/lib/keyra-auth";
import { TopBarUserChip } from "./top-bar-user-chip";

type TopBarProps = {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
};

export function TopBar({ menuOpen = false, onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const { user, refreshSession } = useAuthSession();
  const [q, setQ] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      void refreshSession();
    }
  }, [refreshSession, user]);

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

    const sharedSessionCleared = await logoutSharedKeyraSession();

    toast.success(
      sharedSessionCleared
        ? "Logged out successfully"
        : "Logged out. Shared session is still clearing.",
    );
    window.location.replace("/login");
  }

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
        <TopBarUserChip user={user} />
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
