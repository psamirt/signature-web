'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getOrdersAction } from './actions';
import ShipOrderDialog from './ShipOrderDialog';
import type { Order } from '@/lib/api';

const STATUS_LABEL: Record<Order['status'], string> = {
  pendiente_pago: 'Esperando pago',
  pendiente: 'Pagado, falta enviar',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
};

const STATUS_CLASS: Record<Order['status'], string> = {
  pendiente_pago: 'bg-amber-100 text-amber-700',
  pendiente: 'bg-blue-100 text-blue-700',
  enviado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-zinc-100 text-zinc-500',
};

export default function PedidosPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrdersAction,
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Pedidos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Pedidos cerrados por el bot o por ti. A las 5pm, lleva los pagados a Shalom y márcalos
        como enviados.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <p className="p-6 text-center text-sm text-red-600">
            No se pudo cargar la lista de pedidos.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-zinc-900">{order.code}</TableCell>
                  <TableCell>
                    {order.customer.name}
                    {order.customer.phone && (
                      <span className="block text-xs text-zinc-400">{order.customer.phone}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {order.items
                      .map((item) => `${item.quantity}× ${item.product.name} (${item.presentation})`)
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-zinc-600">S/ {order.totalAmount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_CLASS[order.status]}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString('es-PE')}
                  </TableCell>
                  <TableCell>
                    {order.status === 'pendiente' && (
                      <ShipOrderDialog orderId={order.id} orderCode={order.code} />
                    )}
                    {order.status === 'enviado' && order.shalomReceiptUrl && (
                      <a
                        href={order.shalomReceiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-zinc-600 underline hover:text-zinc-900"
                      >
                        Ver comprobante
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orders?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-400">
                    Todavía no hay pedidos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
