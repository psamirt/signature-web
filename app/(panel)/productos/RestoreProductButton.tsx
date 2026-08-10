'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { restoreProductAction } from './actions';
import { unwrap } from './unwrap';

export default function RestoreProductButton({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => unwrap(restoreProductAction(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
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
