export interface Inventory {
  id: string;
  productId: string;
  sealedUnits: number;
  openDecants: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  priceDecant: string | null;
  decantsPerBottle: number | null;
  category: string | null;
  imageUrl: string | null;
  brand: string | null;
  active: boolean;
  inventory: Inventory | null;
}

export interface InventoryInput {
  sku: string;
  sealedUnits?: number;
  openDecants?: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  price: string;
  priceDecant?: string;
  decantsPerBottle?: number;
  category?: string;
  imageUrl?: string;
  brand?: string;
  active?: boolean;
  inventory: InventoryInput;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  priceDecant?: string | null;
  decantsPerBottle?: number | null;
  category?: string;
  imageUrl?: string;
  brand?: string;
  active?: boolean;
  inventory?: Partial<InventoryInput>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.API_BASE_URL;
  const user = process.env.API_ADMIN_USER;
  const password = process.env.API_ADMIN_PASSWORD;
  if (!baseUrl || !user || !password) {
    throw new Error('API_BASE_URL/API_ADMIN_USER/API_ADMIN_PASSWORD no configurados.');
  }

  const auth = Buffer.from(`${user}:${password}`).toString('base64');
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Basic ${auth}`,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || `Error ${res.status} al llamar a ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products');
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export function createProduct(data: CreateProductInput): Promise<Product> {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
}
