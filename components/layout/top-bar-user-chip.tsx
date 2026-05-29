"use client";

import type { AuthSessionUser } from "@/lib/keyra-auth";
import { getAuthUserDisplayLabel, getAuthUserInitials } from "@/lib/keyra-auth";

type TopBarUserChipProps = {
  user: AuthSessionUser | null | undefined;
};

export function TopBarUserChip({ user }: TopBarUserChipProps) {
  const userLabel = getAuthUserDisplayLabel(user);
  const initials = getAuthUserInitials(user);
  const isVerified = Boolean(String(user?.phone ?? "").trim());

  return (
    <button
      type="button"
      className="crm-topbar-user-btn"
      aria-label={`Account for ${userLabel}`}
    >
      <span className="crm-topbar-user-avatar" aria-hidden="true">
        <span className="crm-topbar-user-initials">{initials}</span>
        {isVerified ? <span className="crm-topbar-user-status" aria-hidden="true" /> : null}
      </span>
      <span className="crm-topbar-user-name">{userLabel}</span>
    </button>
  );
}
