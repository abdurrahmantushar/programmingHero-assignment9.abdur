export const CATEGORIES = [
  "Veg Pizza",
  "Non-Veg Pizza",
  "Sides",
  "Drinks",
  "Desserts",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] =
  CATEGORIES.map((category) => ({ value: category, label: category }));

const LEGACY_CATEGORY_MAP: Record<string, Category> = {
  Veg: "Veg Pizza",
  "Non-Veg": "Non-Veg Pizza",
  "Non Veg": "Non-Veg Pizza",
  Special: "Sides",
  Dessert: "Desserts",
};

const CATEGORY_BY_KEY: Record<string, Category> = {};

for (const category of CATEGORIES) {
  CATEGORY_BY_KEY[category.toLowerCase()] = category;
}

for (const [legacy, canonical] of Object.entries(LEGACY_CATEGORY_MAP)) {
  CATEGORY_BY_KEY[legacy.toLowerCase()] = canonical;
}

export function normalizeCategory(value?: string | null): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim().replace(/\s+/g, " ");

  return CATEGORY_BY_KEY[trimmed.toLowerCase()] || trimmed;
}
