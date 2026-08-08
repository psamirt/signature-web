import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Panel de gestión</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Por ahora puedes gestionar tu catálogo. El dashboard de métricas llega después.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/productos"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
        >
          <h2 className="font-medium text-zinc-900">Productos</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ver, crear, editar y eliminar perfumes. Ajustar stock.
          </p>
        </Link>
      </div>
    </div>
  );
}
