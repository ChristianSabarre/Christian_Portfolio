import { ICONS, type IconName } from "@/lib/icons";
import { Box } from "lucide-react";

/**
 * Renders an icon by its stored name. Declared at module scope so the icon
 * component identity is never created during a parent's render, and unknown
 * names degrade to a neutral box instead of throwing.
 */
export default function ProjectIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Glyph = ICONS[name as IconName] ?? Box;
  return <Glyph className={className} aria-hidden />;
}
