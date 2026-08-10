'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { restoreProductAction } from './actions';
import { unwrap } from '@/lib/action-result';

export default function RestoreProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => unwrap(restoreProductAction(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${productName} volvió al catálogo.`);
    },
    onError: (error) => toast.fromError(error),
  });

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <RotateCcw className="size-4" />
      {mutation.isPending ? 'Restaurando…' : 'Restaurar'}
    </Button>
  );
}
