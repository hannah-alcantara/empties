export interface Product {
  id: string;
  brand: string;
  name: string;
  type: string;
  date_opened?: Date | undefined;
  expiration_date?: Date | undefined;
  date_finished?: Date | undefined;
  price?: number | null;
  tags?: string[] | null;
  notes?: string | null;
  // Planned columns — requires schema migration before use
  percent_remaining?: number | null;
  is_project_pan?: boolean | null;
}

export interface CreateProduct {
  brand: string;
  name: string;
  type: string;
  date_opened?: Date | undefined;
  expiration_date?: Date | undefined;
  date_finished?: Date | undefined;
  price?: number | null;
  tags?: string[] | null;
  notes?: string | null;
}

export const SHELF_LIFE_SUGGESTIONS = {
  Cleanser: 12,
  Moisturizer: 12,
  Serum: 6,
  Toner: 12,
  Sunscreen: 12,
  Exfoliant: 12,
  Mask: 12,
  "Eye Cream": 6,
  Treatment: 6,
  Oil: 6,
  Essence: 12,
  Ampoule: 6,
};

export interface ProductUpdate {
  brand?: string;
  name?: string;
  date_opened?: string | null;
  date_finished?: string | null;
  expiration_date?: string | null;
  price?: number | null;
  notes?: string | null;
  tags?: string[] | null;
  percent_remaining?: number | null;
  is_project_pan?: boolean | null;
}

export interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export const ProductTypes = [
  "Cleanser",
  "Moisturizer",
  "Serum",
  "Toner",
  "Sunscreen",
  "Exfoliant",
  "Mask",
  "Eye Cream",
  "Treatment",
  "Oil",
  "Essence",
  "Ampoule",
];
