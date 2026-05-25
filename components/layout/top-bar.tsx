"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

type TopBarProps = {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
};

export function TopBar({ menuOpen = false, onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
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
      <span className="crm-topbar-meta hidden sm:inline">
        Enterprise · Internal Only
      </span>
    </header>
  );
}
