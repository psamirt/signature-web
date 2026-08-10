'use server';

import {
  createProduct,
  getProducts,
  getTrashedProducts,
  purgeProduct,
  restoreProduct,
  trashProduct as trashProductApi,
  updateProduct,
  type CreateProductInput,
  type Product,
  type UpdateProductInput,
} from '@/lib/api';
import { run, type ActionResult } from '@/lib/action-result';

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function int(formData: FormData, key: string): number | undefined {
  const value = str(formData, key);
  return value === undefined ? undefined : Number.parseInt(value, 10);
}

export async function getProductsAction(): Promise<Product[]> {
  return getProducts();
}

export async function getTrashedProductsAction(): Promise<Product[]> {
  return getTrashedProducts();
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  const name = str(formData, 'name');
  const slug = str(formData, 'slug');
  const price = str(formData, 'price');
  const sku = str(formData, 'sku');

  if (!name || !slug || !price || !sku) {
    return { ok: false, error: 'Nombre, slug, precio y SKU son obligatorios.' };
  }

  const data: CreateProductInput = {
    name,
    slug,
    price,
    description: str(formData, 'description'),
    priceDecant: str(formData, 'priceDecant'),
    decantsPerBottle: int(formData, 'decantsPerBottle'),
    decantEnabled: formData.get('decantEnabled') === 'on',
    category: str(formData, 'category'),
    imageUrl: str(formData, 'imageUrl'),
    brand: str(formData, 'brand'),
    active: formData.get('active') === 'on',
    inventory: {
      sku,
      sealedUnits: int(formData, 'sealedUnits') ?? 0,
      openDecants: int(formData, 'openDecants') ?? 0,
    },
  };

  return run(() => createProduct(data));
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const priceDecant = str(formData, 'priceDecant');
  const decantsPerBottle = int(formData, 'decantsPerBottle');

  const data: UpdateProductInput = {
    name: str(formData, 'name'),
    slug: str(formData, 'slug'),
    description: str(formData, 'description'),
    price: str(formData, 'price'),
    priceDecant: priceDecant ?? null,
    decantsPerBottle: decantsPerBottle ?? null,
    decantEnabled: formData.get('decantEnabled') === 'on',
    category: str(formData, 'category'),
    imageUrl: str(formData, 'imageUrl'),
    brand: str(formData, 'brand'),
    active: formData.get('active') === 'on',
    inventory: {
      sku: str(formData, 'sku'),
      sealedUnits: int(formData, 'sealedUnits'),
      openDecants: int(formData, 'openDecants'),
    },
  };

  return run(() => updateProduct(id, data));
}

export async function trashProductAction(id: string): Promise<ActionResult> {
  return run(() => trashProductApi(id));
}

export async function restoreProductAction(id: string): Promise<ActionResult> {
  return run(() => restoreProduct(id));
}

export async function purgeProductAction(id: string): Promise<ActionResult> {
  return run(() => purgeProduct(id));
}
