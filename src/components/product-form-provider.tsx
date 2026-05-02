"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProductForm from "@/components/product-form";
import { Product } from "@/utils/supabase/types";

// ─── Context ─────────────────────────────────────────────────────────────────

type ProductFormContextType = {
  openAdd: () => void;
  openEdit: (product: Product, onSaved?: () => void) => void;
};

const ProductFormContext = createContext<ProductFormContextType>({
  openAdd: () => {},
  openEdit: () => {},
});

export function useProductForm() {
  return useContext(ProductFormContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProductFormProvider({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const editOnSaved = useRef<(() => void) | undefined>(undefined);
  const router = useRouter();

  const handleAddClose = () => {
    setAddOpen(false);
    router.refresh();
  };

  const handleEditClose = () => {
    setEditOpen(false);
    editOnSaved.current?.();
    editOnSaved.current = undefined;
    router.refresh();
  };

  const openEdit = (product: Product, onSaved?: () => void) => {
    setEditProduct(product);
    editOnSaved.current = onSaved;
    setEditOpen(true);
  };

  return (
    <ProductFormContext.Provider value={{ openAdd: () => setAddOpen(true), openEdit }}>
      {children}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) handleAddClose(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Add a new product to your shelf.
            </DialogDescription>
          </DialogHeader>
          <ProductForm mode="add" onClose={handleAddClose} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editProduct && (
        <Dialog open={editOpen} onOpenChange={(open) => { if (!open) handleEditClose(); }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update details for {editProduct.brand} — {editProduct.name}.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              mode="edit"
              initialData={editProduct}
              productId={editProduct.id}
              onClose={handleEditClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </ProductFormContext.Provider>
  );
}
