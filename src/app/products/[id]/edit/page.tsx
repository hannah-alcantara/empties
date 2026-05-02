"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProductById, updateProduct } from "@/services/productService";
import { Product } from "@/utils/supabase/types";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProductForm from "@/components/product-form";
import { LoadingPage } from "@/components/loading-page";
import { AlertTriangle, Trophy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";


export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await updateProduct(productId, {
        date_finished: format(new Date(), "yyyy-MM-dd"),
        percent_remaining: 0,
      });
      toast.success("Product marked as finished!");
      router.push("/empties");
    } catch {
      toast.error("Failed to finish product");
      setFinishing(false);
    }
  };

  if (loading) return <LoadingPage variant="products" message="Loading product" />;

  if (error || !product) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Card className='w-full max-w-md text-center'>
          <CardContent className='pt-6 space-y-4'>
            <AlertTriangle className='h-10 w-10 text-destructive mx-auto' />
            <p className='text-muted-foreground'>{error || "Product not found"}</p>
            <Button onClick={() => router.push("/products")}>
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alreadyFinished = !!product.date_finished;

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Product</h1>
        <p className='text-muted-foreground'>Update your product details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            mode="edit"
            initialData={product}
            productId={productId}
          />
        </CardContent>
      </Card>

      {!alreadyFinished && (
        <div className="rounded-2xl border-2 border-dashed border-border p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Finished this product?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sets today as the finish date and moves it to your Empties.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setFinishDialogOpen(true)}
          >
            <Trophy className="h-4 w-4" />
            Mark as empty
          </Button>
        </div>
      )}

      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as empty?</DialogTitle>
            <DialogDescription>
              This will set today as the finish date for{" "}
              <span className="font-medium text-foreground">
                {product.brand} — {product.name}
              </span>{" "}
              and move it to your Empties. You can still edit the finish date afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFinishDialogOpen(false)}
              disabled={finishing}
            >
              Cancel
            </Button>
            <Button onClick={handleFinish} disabled={finishing}>
              <Trophy className="h-4 w-4" />
              {finishing ? "Saving…" : "Mark as empty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
