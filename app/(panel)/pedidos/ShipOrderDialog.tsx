'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { unwrap } from '@/lib/action-result';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { shipOrderAction } from './actions';

export default function ShipOrderDialog({
  orderId,
  orderCode,
  deliveryMethod,
}: {
  orderId: string;
  orderCode: string;
  deliveryMethod: 'shalom' | 'otro';
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const receiptRequired = deliveryMethod === 'shalom';

  const mutation = useMutation({
    mutationFn: async () => {
      if (receiptRequired && !file) {
        throw new Error('Selecciona la foto del comprobante de Shalom.');
      }
      const shalomReceiptUrl = file ? await uploadToCloudinary(file) : undefined;
      return unwrap(shipOrderAction(orderId, { shalomReceiptUrl }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
      setFile(null);
      toast.success(`${orderCode} marcado como enviado.`, 'Se le avisó al cliente por WhatsApp.');
    },
    onError: (error) => toast.fromError(error),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Marcar enviado
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar {orderCode} como enviado</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="receipt">
              Foto del comprobante{receiptRequired ? ' de Shalom' : ' (opcional — entrega coordinada directo)'}
            </Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={(receiptRequired && !file) || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Subiendo…' : 'Confirmar envío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
