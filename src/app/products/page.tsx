"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useProductForm } from "@/components/product-form-provider";
import { Product } from "@/utils/supabase/types";
import { deleteProduct, getProducts, updateProduct } from "@/services/productService";
import ProductCard from "@/components/product-card";
import { isProductFinished, getProductStatus, sortProductsByExpiration } from "@/lib/date-utils";
import { useMemo } from "react";
import { LoadingPage } from "@/components/loading-page";
import { toast } from "sonner";

export default function ProductsPage() {
  const { openAdd } = useProductForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("");


  // Get unique values for filter dropdowns
  const uniqueTypes = useMemo(() => {
    const types = products.map(p => p.type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [products]);

  const uniqueBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [products]);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType && filterType !== "all") {
      filtered = filtered.filter(product => product.type === filterType);
    }

    // Brand filter
    if (filterBrand && filterBrand !== "all") {
      filtered = filtered.filter(product => product.brand === filterBrand);
    }

    // Status filter
    if (filterStatus && filterStatus !== "all") {
      if (filterStatus === "finished") {
        filtered = filtered.filter(product => isProductFinished(product));
      } else {
        filtered = filtered.filter(product => 
          !isProductFinished(product) && getProductStatus(product) === filterStatus
        );
      }
    }

    // Sorting
    if (sortBy && sortBy !== "default") {
      switch (sortBy) {
        case "name":
          filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "brand":
          filtered = [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
          break;
        case "expiration":
          filtered = sortProductsByExpiration([...filtered]);
          break;
        case "newest":
          filtered = [...filtered].sort((a, b) => {
            // Sort by date_opened if available, otherwise keep original order
            const dateA = a.date_opened ? new Date(a.date_opened).getTime() : 0;
            const dateB = b.date_opened ? new Date(b.date_opened).getTime() : 0;
            return dateB - dateA;
          });
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [products, searchTerm, filterType, filterBrand, filterStatus, sortBy]);

  // Separate filtered products into active and finished
  const activeProducts = filteredProducts.filter(product => !isProductFinished(product));
  const finishedProducts = filteredProducts.filter(product => isProductFinished(product));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        console.log(data);
      } catch (error) {
        setError("Failed to load products. Please try again.");
        console.error("Product loading error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogUsage = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newPct = Math.max(0, (product.percent_remaining ?? 100) - 5);
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, percent_remaining: newPct } : p))
    );
    try {
      await updateProduct(productId, { percent_remaining: newPct });
      toast.success(`Logged use — ${newPct}% remaining`);
    } catch {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, percent_remaining: product.percent_remaining } : p))
      );
      toast.error("Failed to log usage. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      // Remove the deleted product from local state
      setProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      );
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  if (loading) return <LoadingPage variant="products" message="Loading products" />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Products</h1>
          <p className='text-muted-foreground'>
            Manage your skincare product collection
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Filter & Search
          </CardTitle>
        </CardHeader>

        {/* Dropdowns for filter */}
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-6'>
            <div className='lg:col-span-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input 
                  placeholder='Search products...' 
                  className='pl-9'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder='Product Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger>
                <SelectValue placeholder='Brand' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="brand">Brand (A-Z)</SelectItem>
                <SelectItem value="expiration">Expiration Date</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear filters button */}
          {(searchTerm || (filterType && filterType !== "all") || (filterBrand && filterBrand !== "all") || (filterStatus && filterStatus !== "all") || (sortBy && sortBy !== "default")) && (
            <div className='flex justify-end mt-4'>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("");
                  setFilterBrand("");
                  setFilterStatus("");
                  setSortBy("");
                }}
                className='flex items-center gap-2'
              >
                <X className='h-4 w-4' />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Tabs */}
      <Tabs defaultValue='active' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='active'>Active</TabsTrigger>
          <TabsTrigger value='finished'>Finished</TabsTrigger>
        </TabsList>

        <TabsContent value='active' className='space-y-4'>
          <Card>
            {activeProducts.length > 0 ? (
              <CardContent className='p-6'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {activeProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} onLogUsage={handleLogUsage} />
                  ))}
                </div>
              </CardContent>
            ) : (
              <CardContent className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <p className='text-muted-foreground'>
                    No active products found
                  </p>
                  <Button className='mt-4' onClick={openAdd}>
                    Add your first product
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value='finished' className='space-y-4'>
          <Card>
            {finishedProducts.length > 0 ? (
              <CardContent className='p-6'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {finishedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} onLogUsage={handleLogUsage} />
                  ))}
                </div>
              </CardContent>
            ) : (
              <CardContent className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <p className='text-muted-foreground'>No finished products</p>
                  <Button className='mt-4' onClick={openAdd}>
                    Add your first product
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
