'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { purgeProductAction } from './actions';
import { unwrap } from '@/lib/action-result';

export default function PurgeProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => unwrap(purgeProductAction(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      toast.success(`${productName} se eliminó definitivamente.`);
    },
    // El diálogo se queda abierto en el error a propósito: el motivo se explica
    // en el toast y así el dueño puede reintentar sin volver a buscar la fila.
    onError: (error) => toast.fromError(error),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button size="sm" variant="destructive" />}>
        Eliminar definitivamente
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {productName} definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer: se borra del catálogo para siempre. Los pedidos ya
            cerrados no se pierden — guardan su propia copia del producto y seguirán mostrando qué
            se vendió y a qué precio.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Eliminando…' : 'Eliminar definitivamente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
