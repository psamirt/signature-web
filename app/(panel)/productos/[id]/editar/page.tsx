import { notFound } from 'next/navigation';
import ProductForm from '../../ProductForm';
import { updateProductAction } from '../../actions';
import { getProduct } from '@/lib/api';

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);

  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Editar {product.name}</h1>
      <div className="mt-6">
        <ProductForm
          action={updateProductAction.bind(null, id)}
          product={product}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
