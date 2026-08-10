import Link from 'next/link';
import { getProducts } from '@/lib/api';
import DeleteButton from './DeleteButton';

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Productos</h1>
        <Link
          href="/productos/nuevo"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
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
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.category ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">S/ {product.price}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {!product.decantEnabled
                    ? 'Deshabilitado'
                    : product.priceDecant
                      ? `S/ ${product.priceDecant}`
                      : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.inventory
                    ? `${product.inventory.sealedUnits} sellados / ${product.inventory.openDecants} decants`
                    : 'sin inventario'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/productos/${product.id}/editar`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Editar
                    </Link>
                    <DeleteButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
