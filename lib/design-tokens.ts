/**
 * Design system tokens — see designd.md.
 * Reference CSS variables in components; use uiColors only for canvas/SVG runtimes.
 */
export { uiColors, chartColors } from "./ui-colors";

export const dsTokens = {
  canvas: "var(--ds-canvas)",
  canvasSoft: "var(--ds-canvas-soft)",
  surfaceCard: "var(--ds-surface-card)",
  surfaceStrong: "var(--ds-surface-strong)",
  surfaceDark: "var(--ds-surface-dark)",
  hairline: "var(--ds-hairline)",
  hairlineSoft: "var(--ds-hairline-soft)",
  hairlineStrong: "var(--ds-hairline-strong)",
  ink: "var(--ds-ink)",
  body: "var(--ds-body)",
  muted: "var(--ds-muted)",
  mutedSoft: "var(--ds-muted-soft)",
  onPrimary: "var(--ds-on-primary)",
  onDark: "var(--ds-on-dark)",
  primary: "var(--ds-primary)",
  primaryActive: "var(--ds-primary-active)",
  textLink: "var(--ds-text-link)",
  textLink2: "var(--ds-text-link-2)",
  success: "var(--ds-success)",
  error: "var(--ds-error)",
  warning: "var(--ds-warning)",
  radiusXs: "var(--ds-radius-xs)",
  radiusSm: "var(--ds-radius-sm)",
  radiusMd: "var(--ds-radius-md)",
  radiusLg: "var(--ds-radius-lg)",
  radiusXl: "var(--ds-radius-xl)",
  radiusPill: "var(--ds-radius-pill)",
  shadowSoft: "var(--ds-shadow-soft)",
  fontSans: "var(--font-sans)",
  fontAccent: "var(--font-accent)",
} as const;

export const dsSpacing = {
  xxs: "4px",
  xs: "8px",
  sm: "12px",
  base: "16px",
  md: "20px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
  section: "96px",
} as const;

/** Shared class names — prefer these over ad-hoc Tailwind */
export const dsClasses = {
  btnPrimary: "crm-btn crm-btn-primary ds-btn-primary",
  btnSecondary: "crm-btn ds-btn-secondary",
  btnTertiary: "ds-btn-tertiary",
  btnIcon: "crm-btn-icon ds-btn-icon",
  btnSm: "is-sm",
  card: "crm-card ds-feature-card",
  panel: "ds-panel",
  input: "crm-search ds-text-input",
  inputDense: "crm-search ds-text-input is-dense",
  pageTitle: "crm-page-title",
  pageSub: "crm-page-sub",
  emptyState: "crm-empty-state",
  skeleton: "crm-skeleton",
  numeric: "crm-stat-value ds-numeric",
  textLink: "ds-text-link",
  kicker: "ds-caption-uppercase",
} as const;
