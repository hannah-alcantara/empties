import { CreateProduct } from "@/utils/supabase/types";

// Dates relative to a fixed reference point so statuses are always correct
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

export const DEMO_PRODUCTS: Omit<CreateProduct, never>[] = [
  // 1. Just opened — 100% remaining
  {
    brand: "CeraVe",
    name: "Hydrating Cleanser",
    type: "Cleanser",
    date_opened: daysAgo(4),
    expiration_date: daysFromNow(361),
    percent_remaining: 100,
    price: 14.99,
    tags: ["drugstore", "gentle", "daily"],
    notes: "Great for morning and evening use.",
  },
  // 2. Just opened — 100% remaining
  {
    brand: "Laneige",
    name: "Water Sleeping Mask",
    type: "Mask",
    date_opened: daysAgo(7),
    expiration_date: daysFromNow(358),
    percent_remaining: 100,
    price: 25.0,
    tags: ["hydrating", "overnight"],
  },
  // 3. Mid-use — 62% remaining
  {
    brand: "The Ordinary",
    name: "Niacinamide 10% + Zinc 1%",
    type: "Serum",
    date_opened: daysAgo(55),
    expiration_date: daysFromNow(125),
    percent_remaining: 62,
    price: 6.99,
    tags: ["brightening", "pore-minimizing"],
  },
  // 4. Mid-use — 45% remaining
  {
    brand: "Kiehl's",
    name: "Midnight Recovery Concentrate",
    type: "Oil",
    date_opened: daysAgo(72),
    expiration_date: daysFromNow(110),
    percent_remaining: 45,
    price: 52.0,
    tags: ["anti-aging", "night"],
    notes: "Apply 2-3 drops before moisturizer.",
  },
  // 5. Almost gone — 28% remaining
  {
    brand: "La Roche-Posay",
    name: "Anthelios UV Mist SPF 50",
    type: "Sunscreen",
    date_opened: daysAgo(88),
    expiration_date: daysFromNow(5),
    percent_remaining: 28,
    price: 38.0,
    tags: ["spf", "daily", "reapplication"],
    notes: "Almost out — remember to restock.",
  },
  // 6. Almost gone — 18% remaining
  {
    brand: "Paula's Choice",
    name: "Skin Perfecting 2% BHA Liquid Exfoliant",
    type: "Exfoliant",
    date_opened: daysAgo(78),
    expiration_date: daysFromNow(22),
    percent_remaining: 18,
    price: 35.0,
    tags: ["chemical-exfoliant", "acne", "bha"],
  },
  // 7. Nearly empty — 5% remaining (urgent)
  {
    brand: "Tatcha",
    name: "The Water Cream",
    type: "Moisturizer",
    date_opened: daysAgo(83),
    expiration_date: daysFromNow(32),
    percent_remaining: 5,
    price: 68.0,
    tags: ["hydrating", "anti-aging"],
    notes: "Scraping the bottom — nearly done!",
  },
  // 8. Project pan — 23% remaining
  {
    brand: "Glow Recipe",
    name: "Watermelon Glow PHA+BHA Pore-Tight Toner",
    type: "Toner",
    date_opened: daysAgo(65),
    expiration_date: daysFromNow(115),
    percent_remaining: 23,
    is_project_pan: true,
    price: 39.0,
    tags: ["hydrating", "brightening"],
    notes: "Project pan goal: finish by end of month.",
  },
];
