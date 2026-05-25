import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  size?: 16 | 20 | 24;
  className?: string;
  filled?: boolean;
};

const SIZE_CLASS: Record<16 | 20 | 24, string> = {
  16: "crm-icon-16",
  20: "crm-icon-20",
  24: "crm-icon-24",
};

/** Material Symbols Outlined — designd.md TR-10 */
export function MaterialIcon({ name, size = 20, className, filled }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", SIZE_CLASS[size], className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}
