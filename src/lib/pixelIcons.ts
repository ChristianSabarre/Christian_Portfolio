import { ICON_NAMES } from "./icons";

/**
 * Hand-drawn pixel icons, addressable anywhere a lucide icon name is stored
 * (Category.icon, Project.icon) via a "pixel:" id. ProjectIcon resolves both
 * kinds, so admin pickers and renderers need no special cases.
 */
export const PIXEL_ICONS: Record<string, string> = {
  "pixel:webdev": "/sprites/icons/webdev.png",
  "pixel:mobile": "/sprites/icons/mobile.png",
  "pixel:data": "/sprites/icons/data.png",
  "pixel:ai": "/sprites/icons/ai.png",
  "pixel:design": "/sprites/icons/design.png",
  "pixel:other": "/sprites/icons/other.png",
  "pixel:play": "/sprites/icons/play.png",
};

/** Everything a picker can offer: pixel art first, then the lucide set. */
export const ALL_ICON_IDS: string[] = [...Object.keys(PIXEL_ICONS), ...ICON_NAMES];

export function isValidIconId(value: string): boolean {
  return value in PIXEL_ICONS || (ICON_NAMES as readonly string[]).includes(value);
}
