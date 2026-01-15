import { useEffect, useState } from 'react';
import './globals.css';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@repo/ui';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '@repo/api-contracts';
import { mockProductApi } from './data/mock-products';
import type { Session as CoreSession } from '@repo/auth-core';
import { getShellStore } from '@repo/stores';
import { useProductsUIStore } from './state/products-ui-store';

interface ProductsAppProps {
  session: CoreSession | null;
}

export default function ProductsApp({ session }: ProductsAppProps) {
  // Use Zustand store for UI state
  const {
    products,
    loading,
    dialogOpen,
    editingProduct,
    formData,
    setProducts,
    setLoading,
    openDialog,
    closeDialog,
    setEditingProduct,
    setFormData,
    resetForm,
  } = useProductsUIStore();

  // Local state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission check based on session
  const canWrite = session?.user?.permissions?.includes('product:write') || false;

  // Form validation
  const isFormValid = formData.name.trim() && formData.description.trim() && formData.price > 0;

  useEffect(() => {
    console.log('[products-remote][ui] dialogOpen changed:', dialogOpen);
  }, [dialogOpen]);

  useEffect(() => {
    console.log('[products-remote][ui] mounted', {
      canWrite,
      hasSession: !!session,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await mockProductApi.list();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('[products-remote][cta] handleCreate()');
    setEditingProduct(null);
    resetForm();
    openDialog();
  };

  const handleEdit = (product: Product) => {
    console.log('[products-remote][cta] handleEdit()', product);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
    });
    openDialog();
  };

  const handleArchive = async (id: string) => {
    console.log('[products-remote][cta] handleArchive()', id);
    try {
      const productToArchive = products.find(p => p.id === id);
      await mockProductApi.archive(id);
      getShellStore().getState().addNotification({
        type: 'info',
        title: 'Product Archived',
        message: `${productToArchive?.name || 'Product'} has been archived.`,
      });
      await loadProducts();
    } catch (error) {
      console.error('Failed to archive product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('[products-remote][cta] handleDelete()', id);
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const productToDelete = products.find(p => p.id === id);
      await mockProductApi.delete(id);
      getShellStore().getState().addNotification({
        type: 'warning',
        title: 'Product Deleted',
        message: `${productToDelete?.name || 'Product'} has been removed.`,
      });
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleSubmit = async () => {
    console.log('[products-remote][cta] handleSubmit()', {
      isFormValid,
      isEdit: !!editingProduct,
      formData,
    });
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await mockProductApi.update(
          editingProduct.id,
          formData as UpdateProductRequest,
        );
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'Product Updated',
          message: `${formData.name} has been updated successfully.`,
        });
      } else {
        await mockProductApi.create(formData);
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'Product Created',
          message: `${formData.name} has been created successfully.`,
        });
      }
      closeDialog();
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
            <div className="h-6 w-72 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="h-7 w-32 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-40 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-24 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage products and inventory
          </p>
        </div>
        {canWrite && (
          <Button 
            onClick={() => {
              console.log('[products-remote][click] Add Product button clicked');
              handleCreate();
            }}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        )}
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Product Catalog
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} in inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-inner">
                <svg className="h-12 w-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {canWrite 
                  ? 'Get started by creating your first product to build your catalog.' 
                  : 'Products will appear here when they are added to the inventory.'}
              </p>
              {canWrite && (
                <Button onClick={handleCreate} size="lg" className="gap-2 shadow-md">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b bg-muted/40">
                    <TableHead className="font-bold text-foreground/90">Product Name</TableHead>
                    <TableHead className="font-bold text-foreground/90">Description</TableHead>
                    <TableHead className="font-bold text-foreground/90">Price</TableHead>
                    <TableHead className="font-bold text-foreground/90">Status</TableHead>
                    <TableHead className="font-bold text-foreground/90 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow 
                      key={product.id} 
                      className="hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20 transition-all duration-200 group border-b"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-semibold text-foreground py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate" title={product.description}>
                        {product.description}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-xl text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.status === 'active' ? 'default' : 'outline'}
                          className={`capitalize shadow-sm font-medium ${
                            product.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800' 
                              : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${
                            product.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`} />
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {canWrite && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                className="hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                              {product.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchive(product.id)}
                                  className="hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
                                >
                                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  Archive
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          console.log('[products-remote][ui] Dialog onOpenChange:', open);
          return open ? openDialog() : closeDialog();
        }}
      >
        <DialogContent className="shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product information below.'
                : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter product name"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description *
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">
                Price (USD) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="pl-7 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isFormValid}
              className="gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
