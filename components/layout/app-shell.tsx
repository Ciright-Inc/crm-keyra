"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!mobileNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNav]);

  return (
    <div className="crm-layout" data-surface="dashboard" data-density="comfortable">
      {/* Desktop: in-flow sidebar, full viewport height */}
      <div className="crm-sidebar-slot" aria-hidden={mobileNav}>
        <Sidebar />
      </div>

      {/* Mobile / tablet: drawer + backdrop */}
      <button
        type="button"
        className={mobileNav ? "crm-sidebar-backdrop is-visible" : "crm-sidebar-backdrop"}
        aria-label="Close menu"
        aria-hidden={!mobileNav}
        tabIndex={mobileNav ? 0 : -1}
        onClick={() => setMobileNav(false)}
      />
      <Sidebar
        variant="drawer"
        isOpen={mobileNav}
        onClose={() => setMobileNav(false)}
      />

      <div className="crm-main">
        <TopBar
          menuOpen={mobileNav}
          onMenuToggle={() => setMobileNav((open) => !open)}
        />
        <main className="crm-content crm-scroll">{children}</main>
      </div>
    </div>
  );
}
