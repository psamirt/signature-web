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
  /** Interruptor manual: si está en false, no se ofrecen decants aunque haya precio/rendimiento cargado. */
  decantEnabled: boolean;
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
  decantEnabled?: boolean;
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
  decantEnabled?: boolean;
  category?: string;
  imageUrl?: string;
  brand?: string;
  active?: boolean;
  inventory?: Partial<InventoryInput>;
}

export interface OrderItem {
  id: string;
  productId: string;
  presentation: 'frasco' | 'decant';
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string | null;
}

export interface Order {
  id: string;
  code: string;
  status: 'pendiente_pago' | 'pendiente' | 'enviado' | 'cancelado';
  totalAmount: string;
  paymentMethod: string | null;
  /** "shalom" (default) | "otro" — el dueño coordinó la entrega directo con el cliente. */
  deliveryMethod: 'shalom' | 'otro';
  /** Notas libres de la entrega cuando deliveryMethod = "otro". */
  deliveryNotes: string | null;
  shalomAgency: string | null;
  shalomDni: string | null;
  shalomFullName: string | null;
  shalomPhone: string | null;
  shalomDistrict: string | null;
  shalomCity: string | null;
  shalomReceiptUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  customer: OrderCustomer;
  items: OrderItem[];
}

export interface ShipOrderInput {
  /** Obligatorio solo si el pedido se despacha por Shalom (deliveryMethod). */
  shalomReceiptUrl?: string;
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
    const parsed = (() => {
      try {
        return JSON.parse(body) as { message?: string | string[] };
      } catch {
        return undefined;
      }
    })();
    const message = Array.isArray(parsed?.message)
      ? parsed.message.join(', ')
      : parsed?.message;
    throw new ApiError(res.status, message || body || `Error ${res.status} al llamar a ${path}`);
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

export function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders');
}

export function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

export function shipOrder(id: string, data: ShipOrderInput): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/ship`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function cancelOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/cancel`, { method: 'PATCH' });
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: string;
}

export interface AnalyticsOverview {
  totalOrders: number;
  totalRevenue: string;
  ordersByStatus: Record<string, number>;
  abandonedOrders: number;
  topProducts: TopProduct[];
  regularCustomers: number;
  conversionRate: number;
  avgResponseMinutes: number | null;
  escalationRate: number;
}

export function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>('/analytics/overview');
}

export interface LeadInsightSummary {
  conversationId: string;
  customerName: string;
  leadScore: string;
  converted: boolean;
  dropOffReason: string | null;
  summary: string;
  analyzedAt: string;
}

export interface LeadInsights {
  leadScoreCounts: Record<string, number>;
  dropOffReasonCounts: Record<string, number>;
  recent: LeadInsightSummary[];
}

export function getLeadInsights(): Promise<LeadInsights> {
  return apiFetch<LeadInsights>('/analytics/leads');
}

export function runLeadAnalysis(): Promise<{ analyzed: number }> {
  return apiFetch<{ analyzed: number }>('/analytics/run-lead-analysis', { method: 'POST' });
}
