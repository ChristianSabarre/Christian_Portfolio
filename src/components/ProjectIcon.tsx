import { ICONS, type IconName } from "@/lib/icons";
import { PIXEL_ICONS } from "@/lib/pixelIcons";
import { Box } from "lucide-react";

/**
 * Renders an icon by its stored id — either a hand-drawn pixel icon
 * ("pixel:webdev") or a lucide glyph name ("Code2"). Declared at module scope
 * so the component identity is never created during a parent's render, and
 * unknown ids degrade to a neutral box instead of throwing.
 */
export default function ProjectIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const pixelSrc = name ? PIXEL_ICONS[name] : undefined;
  if (pixelSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny local pixel art; next/image blurs it
      <img
        src={pixelSrc}
        alt=""
        aria-hidden
        className={className}
        style={{ imageRendering: "pixelated" }}
      />
    );
  }
  const Glyph = ICONS[name as IconName] ?? Box;
  return <Glyph className={className} aria-hidden />;
}
