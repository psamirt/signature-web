import ProductForm from '../ProductForm';
import { createProductAction } from '../actions';

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm mutationFn={createProductAction} submitLabel="Crear producto" />
      </div>
    </div>
  );
}
