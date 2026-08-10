'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
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
import { trashProductAction } from './actions';
import { unwrap } from './unwrap';

export default function TrashProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => unwrap(trashProductAction(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) mutation.reset();
      }}
    >
      <AlertDialogTrigger
        render={<Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" />}
      >
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {productName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se mueve a la papelera. Podrás restaurarlo o eliminarlo definitivamente desde ahí.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isError && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Eliminando…' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
