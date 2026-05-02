import { createClient } from "@/utils/supabase/client";
import { Product, ProductUpdate } from "@/utils/supabase/types";

const supabase = createClient();

async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("You must be signed in to perform this action.");
  }
  return user;
}

export async function getProducts() {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data;
}

export async function createProduct(
  productData: Omit<Product, "id" | "user_id">
) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("products")
    .insert([{ ...productData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
}

export async function deleteProduct(productId: string) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  return data;
}

export async function getProductById(productId: string) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data;
}

export async function updateProduct(
  productId: string,
  updates: ProductUpdate
) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data;
}
