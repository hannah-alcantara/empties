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
  // 1. Active — CeraVe cleanser, plenty of shelf life left
  {
    brand: "CeraVe",
    name: "Hydrating Cleanser",
    type: "Cleanser",
    date_opened: daysAgo(183),
    expiration_date: daysFromNow(182),
    price: 14.99,
    tags: ["drugstore", "gentle", "daily"],
    notes: "Great for morning and evening use.",
  },
  // 2. Active — The Ordinary serum
  {
    brand: "The Ordinary",
    name: "Niacinamide 10% + Zinc 1%",
    type: "Serum",
    date_opened: daysAgo(113),
    expiration_date: daysFromNow(67),
    price: 6.99,
    tags: ["brightening", "pore-minimizing"],
  },
  // 3. Active — Kiehl's face oil
  {
    brand: "Kiehl's",
    name: "Midnight Recovery Concentrate",
    type: "Oil",
    date_opened: daysAgo(98),
    expiration_date: daysFromNow(84),
    price: 52.0,
    tags: ["anti-aging", "night"],
    notes: "Apply 2-3 drops before moisturizer.",
  },
  // 4. Expiring Soon — critical (≤ 7 days)
  {
    brand: "La Roche-Posay",
    name: "Anthelios UV Mist SPF 50",
    type: "Sunscreen",
    date_opened: daysAgo(360),
    expiration_date: daysFromNow(5),
    price: 38.0,
    tags: ["spf", "daily", "reapplication"],
    notes: "Almost out — remember to restock.",
  },
  // 5. Expiring Soon — moderate (8–30 days)
  {
    brand: "Laneige",
    name: "Water Sleeping Mask",
    type: "Mask",
    date_opened: daysAgo(345),
    expiration_date: daysFromNow(20),
    price: 25.0,
    tags: ["hydrating", "overnight"],
  },
  // 6. Expired
  {
    brand: "Paula's Choice",
    name: "Skin Perfecting 2% BHA Liquid Exfoliant",
    type: "Exfoliant",
    date_opened: daysAgo(400),
    expiration_date: daysAgo(35),
    price: 35.0,
    tags: ["chemical-exfoliant", "acne", "bha"],
  },
  // 7. Finished
  {
    brand: "Glow Recipe",
    name: "Watermelon Glow PHA+BHA Pore-Tight Toner",
    type: "Toner",
    date_opened: daysAgo(410),
    expiration_date: daysAgo(45),
    date_finished: daysAgo(50),
    price: 39.0,
    tags: ["hydrating", "brightening"],
    notes: "Loved this — will definitely repurchase!",
  },
];
