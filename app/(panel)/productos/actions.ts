'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/lib/api';

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

export async function createProductAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = str(formData, 'name');
  const slug = str(formData, 'slug');
  const price = str(formData, 'price');
  const sku = str(formData, 'sku');

  if (!name || !slug || !price || !sku) {
    return { error: 'Nombre, slug, precio y SKU son obligatorios.' };
  }

  const data: CreateProductInput = {
    name,
    slug,
    price,
    description: str(formData, 'description'),
    priceDecant: str(formData, 'priceDecant'),
    decantsPerBottle: int(formData, 'decantsPerBottle'),
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

  try {
    await createProduct(data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error al crear el producto.' };
  }

  revalidatePath('/productos');
  redirect('/productos');
}

export async function updateProductAction(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const priceDecant = str(formData, 'priceDecant');
  const decantsPerBottle = int(formData, 'decantsPerBottle');

  const data: UpdateProductInput = {
    name: str(formData, 'name'),
    slug: str(formData, 'slug'),
    description: str(formData, 'description'),
    price: str(formData, 'price'),
    priceDecant: priceDecant ?? null,
    decantsPerBottle: decantsPerBottle ?? null,
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

  try {
    await updateProduct(id, data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error al editar el producto.' };
  }

  revalidatePath('/productos');
  redirect('/productos');
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidatePath('/productos');
}
