import type { Product } from '@repo/api-contracts';

let mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product A',
    description: 'Description for Product A',
    price: 99.99,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Product B',
    description: 'Description for Product B',
    price: 149.99,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Product C',
    description: 'Description for Product C',
    price: 199.99,
    status: 'archived',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockProductApi = {
  list: async (): Promise<Product[]> => {
    return [...mockProducts];
  },
  get: async (id: string): Promise<Product> => {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },
  create: async (data: {
    name: string;
    description: string;
    price: number;
  }): Promise<Product> => {
    const product: Product = {
      id: String(mockProducts.length + 1),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(product);
    return product;
  },
  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      status?: 'active' | 'archived';
    },
  ): Promise<Product> => {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  },
  archive: async (id: string): Promise<Product> => {
    return mockProductApi.update(id, { status: 'archived' });
  },
  delete: async (id: string): Promise<void> => {
    mockProducts = mockProducts.filter((p) => p.id !== id);
  },
};
