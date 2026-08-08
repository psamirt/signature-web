import ProductForm from '../ProductForm';
import { createProductAction } from '../actions';

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm action={createProductAction} submitLabel="Crear producto" />
      </div>
    </div>
  );
}
