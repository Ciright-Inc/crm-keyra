/**
 * Runtime hex values for canvas/SVG/Recharts — mirrors :root tokens in globals.css.
 * Prefer CSS variables in components; use these only when the API requires a string color.
 */
export const uiColors = {
  canvas: "#ffffff",
  canvasSoft: "#fafafa",
  surfaceCard: "#ffffff",
  surfaceStrong: "#f0f0f3",
  surfaceDark: "#171717",
  hairline: "#f0f0f3",
  hairlineSoft: "#f5f5f7",
  hairlineStrong: "#dcdee0",
  ink: "#171717",
  body: "#60646c",
  muted: "#999999",
  mutedSoft: "#cccccc",
  onPrimary: "#ffffff",
  onDark: "#ffffff",
  primary: "#000000",
  primaryActive: "#1a1a1a",
  textLink: "#0d74ce",
  textLink2: "#476cff",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#ab6400",
  graphStroke: "#c4c8cc",
  rowSelected: "#f5f5f7",
  sidebarLabel: "#b0b4ba",
} as const;

/** Chart series palette (solid only — designd.md §2.10) */
export const chartColors = {
  primary: uiColors.ink,
  secondary: uiColors.body,
  tertiary: uiColors.hairlineStrong,
  series: [uiColors.ink, uiColors.body, uiColors.muted, uiColors.graphStroke, uiColors.hairline],
} as const;
