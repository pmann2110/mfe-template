import { create } from 'zustand';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@repo/api-contracts';

interface ProductsUIState {
  // Data state
  products: Product[];
  loading: boolean;

  // Dialog state
  dialogOpen: boolean;
  editingProduct: Product | null;

  // Form state
  formData: CreateProductRequest;

  // Actions
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setEditingProduct: (product: Product | null) => void;
  setFormData: (data: CreateProductRequest) => void;
  resetForm: () => void;
}

export const useProductsUIStore = create<ProductsUIState>((set, get) => ({
  // Initial state
  products: [],
  loading: true,
  dialogOpen: false,
  editingProduct: null,
  formData: {
    name: '',
    description: '',
    price: 0,
  },

  // Actions
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),

  openDialog: () => {
    set({ dialogOpen: true });
  },
  closeDialog: () => {
    set({ dialogOpen: false });
  },

  setEditingProduct: (editingProduct) => set({ editingProduct }),

  setFormData: (formData) => set({ formData }),

  resetForm: () => set({
    formData: {
      name: '',
      description: '',
      price: 0,
    },
  }),
}));