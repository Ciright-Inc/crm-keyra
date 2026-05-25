"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { NAV_ITEMS } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { NAV_ICON_SYMBOLS } from "@/components/ui/nav-icons";

type SidebarProps = {
  /** Fixed overlay drawer (mobile/tablet) */
  variant?: "inline" | "drawer";
  isOpen?: boolean;
  onClose?: () => void;
};

const NAV_SECTIONS: { title: string; hrefs: readonly string[] }[] = [
  {
    title: "Overview",
    hrefs: ["/dashboard"],
  },
  {
    title: "Records",
    hrefs: ["/lead-sources", "/prospects", "/companies", "/contacts"],
  },
  {
    title: "Activity",
    hrefs: [
      "/calls",
      "/communications",
      "/meetings",
      "/proposals",
      "/follow-ups",
    ],
  },
  {
    title: "Pipeline & revenue",
    hrefs: ["/pipeline", "/revenue", "/commission"],
  },
  {
    title: "System",
    hrefs: ["/files", "/ai-activity", "/admin"],
  },
];

function NavSections({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_SECTIONS.map((section) => {
        const items = NAV_ITEMS.filter((item) =>
          (section.hrefs as readonly string[]).includes(item.href)
        );
        if (!items.length) return null;

        return (
          <div key={section.title} className="crm-nav-section">
            <p className="crm-nav-section-label">{section.title}</p>
            <div className="crm-nav-section-links">
              {items.map((item) => {
                const symbol = NAV_ICON_SYMBOLS[item.icon] ?? "dashboard";
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("crm-nav-link", active && "active")}
                    onClick={onNavigate}
                  >
                    <MaterialIcon name={symbol} size={20} />
                    <span className="crm-nav-link-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function Sidebar({
  variant = "inline",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isDrawer = variant === "drawer";
  const skipPathClose = useRef(true);

  useEffect(() => {
    if (!isDrawer || !isOpen) return;
    if (skipPathClose.current) {
      skipPathClose.current = false;
      return;
    }
    onClose?.();
  }, [pathname, isDrawer, isOpen, onClose]);

  if (isDrawer && !isOpen) return null;

  return (
    <aside
      id={isDrawer ? "crm-sidebar-drawer" : undefined}
      className={cn(
        "crm-sidebar",
        isDrawer && "crm-sidebar-drawer is-open",
        !isDrawer && "crm-sidebar-inline"
      )}
      aria-label="Main navigation"
      {...(isDrawer ? { "aria-modal": true as const, role: "dialog" } : {})}
    >
      <div className="crm-sidebar-brand shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1>Keyra CRM</h1>
            <p>crm.keyra.ie</p>
          </div>
          {isDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="crm-btn-icon shrink-0"
            >
              <MaterialIcon name="close" size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="crm-nav crm-scroll" aria-label="CRM modules">
        <NavSections onNavigate={isDrawer ? onClose : undefined} />
      </nav>

      <div className="crm-sidebar-footer shrink-0">
        Ciright Core · Persona RBAC · Audit
      </div>
    </aside>
  );
}
