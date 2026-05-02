import { Product } from "@/utils/supabase/types";

export type ExpirationStatus = "fresh" | "soon" | "expiring" | "expired";

export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export function getEffectiveExpiration(product: Product): Date | null {
  if (!product.expiration_date) return null;
  return new Date(product.expiration_date);
}

export function getExpirationStatus(product: Product): ExpirationStatus {
  const exp = getEffectiveExpiration(product);
  if (!exp) return "fresh";
  const days = daysUntil(exp);
  if (days < 0) return "expired";
  if (days <= 7) return "expiring";
  if (days <= 30) return "soon";
  return "fresh";
}
