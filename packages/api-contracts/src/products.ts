export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  status?: 'active' | 'archived';
}

export interface ProductApi {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product>;
  create(data: CreateProductRequest): Promise<Product>;
  update(id: string, data: UpdateProductRequest): Promise<Product>;
  archive(id: string): Promise<Product>;
  delete(id: string): Promise<void>;
}
