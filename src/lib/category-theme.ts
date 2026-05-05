export type ThemeColor = "coral" | "sun" | "mint" | "sky" | "violet";

export interface CategoryTheme {
  color: ThemeColor;
}

export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  "Cleanser":    { color: "sky" },
  "Moisturizer": { color: "mint" },
  "Serum":       { color: "coral" },
  "Toner":       { color: "violet" },
  "Sunscreen":   { color: "sun" },
  "Exfoliant":   { color: "coral" },
  "Mask":        { color: "violet" },
  "Eye Cream":   { color: "sky" },
  "Treatment":   { color: "mint" },
  "Oil":         { color: "sun" },
  "Essence":     { color: "violet" },
  "Ampoule":     { color: "coral" },
};

const DEFAULT_THEME: CategoryTheme = { color: "sky" };

export function getTheme(type: string): CategoryTheme {
  return CATEGORY_THEME[type] ?? DEFAULT_THEME;
}

export const TINT_BG: Record<ThemeColor, string> = {
  coral:  "bg-tint-coral",
  sun:    "bg-tint-sun",
  mint:   "bg-tint-mint",
  sky:    "bg-tint-sky",
  violet: "bg-tint-violet",
};

export const BRAND_BG: Record<ThemeColor, string> = {
  coral:  "bg-brand-coral",
  sun:    "bg-brand-sun",
  mint:   "bg-brand-mint",
  sky:    "bg-brand-sky",
  violet: "bg-brand-violet",
};

export const BRAND_TEXT: Record<ThemeColor, string> = {
  coral:  "text-brand-coral",
  sun:    "text-brand-sun",
  mint:   "text-brand-mint",
  sky:    "text-brand-sky",
  violet: "text-brand-violet",
};
