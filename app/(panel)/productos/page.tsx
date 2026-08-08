import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { deleteProductAction } from './actions';
import DeleteButton from './DeleteButton';

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Productos</h1>
        <Link
          href="/productos/nuevo"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Decant</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
                <td className="px-4 py-3 text-zinc-600">{product.category ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-600">S/ {product.price}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {product.priceDecant ? `S/ ${product.priceDecant}` : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {product.inventory
                    ? `${product.inventory.sealedUnits} sellados / ${product.inventory.openDecants} decants`
                    : 'sin inventario'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/productos/${product.id}/editar`}
                      className="text-zinc-600 hover:text-zinc-900"
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        'use server';
                        await deleteProductAction(product.id);
                      }}
                    >
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  Todavía no hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
