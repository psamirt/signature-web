'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProductsAction, getTrashedProductsAction } from './actions';
import TrashProductButton from './TrashProductButton';
import RestoreProductButton from './RestoreProductButton';
import PurgeProductButton from './PurgeProductButton';
import type { Product } from '@/lib/api';

export default function ProductosPage() {
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

      <Tabs defaultValue="activos" className="mt-6">
        <TabsList>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="papelera">Papelera</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ActiveProductsTable />
        </TabsContent>
        <TabsContent value="papelera" className="mt-4">
          <TrashedProductsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActiveProductsTable() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProductsAction,
  });

  return (
    <TableShell isLoading={isLoading} isError={isError} errorMessage="No se pudo cargar la lista de productos.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Decant</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-foreground">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.category ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">S/ {product.price}</TableCell>
              <TableCell className="text-muted-foreground">
                {!product.decantEnabled
                  ? 'Deshabilitado'
                  : product.priceDecant
                    ? `S/ ${product.priceDecant}`
                    : '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.inventory
                  ? `${product.inventory.sealedUnits} sellados / ${product.inventory.openDecants} decants`
                  : 'sin inventario'}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    product.active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {product.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" render={<Link href={`/productos/${product.id}/editar`} />}>
                    Editar
                  </Button>
                  <TrashProductButton productId={product.id} productName={product.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products?.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Todavía no hay productos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableShell>
  );
}

function TrashedProductsTable() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', 'trash'],
    queryFn: getTrashedProductsAction,
  });

  return (
    <TableShell isLoading={isLoading} isError={isError} errorMessage="No se pudo cargar la papelera.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Eliminado el</TableHead>
            <TableHead>Al restaurar</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product: Product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-foreground">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.category ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.deletedAt ? new Date(product.deletedAt).toLocaleDateString('es-PE') : '—'}
              </TableCell>
              {/* Restaurar devuelve el producto como estaba: saber si vuelve
                  activo importa, porque eso lo republica en el feed de Meta. */}
              <TableCell className="text-xs text-muted-foreground">
                {product.active ? 'Vuelve visible en el catálogo' : 'Vuelve oculto (inactivo)'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <RestoreProductButton productId={product.id} productName={product.name} />
                  <PurgeProductButton productId={product.id} productName={product.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                La papelera está vacía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableShell>
  );
}

function TableShell({
  isLoading,
  isError,
  errorMessage,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      {isLoading ? (
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : isError ? (
        <p className="p-6 text-center text-sm text-destructive">{errorMessage}</p>
      ) : (
        children
      )}
    </div>
  );
}
