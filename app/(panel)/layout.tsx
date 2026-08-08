import Link from 'next/link';
import { logout } from '../login/actions';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-zinc-900">Aura Signature</span>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-zinc-900">
              Productos
            </Link>
            <Link href="/pedidos" className="hover:text-zinc-900">
              Pedidos
            </Link>
          </nav>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900">
            Cerrar sesión
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
