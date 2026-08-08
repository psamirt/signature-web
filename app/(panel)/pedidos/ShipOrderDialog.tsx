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
import { uploadToCloudinary } from '@/lib/cloudinary';
import { shipOrderAction } from './actions';

export default function ShipOrderDialog({ orderId, orderCode }: { orderId: string; orderCode: string }) {
  const [open, setOpen] = useState(false);
  const [shalomCode, setShalomCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Selecciona la foto del comprobante de Shalom.');
      const shalomReceiptUrl = await uploadToCloudinary(file);
      return shipOrderAction(orderId, { shalomCode, shalomReceiptUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
      setShalomCode('');
      setFile(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
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
            <Label htmlFor="shalomCode">Código de Shalom</Label>
            <Input
              id="shalomCode"
              value={shalomCode}
              onChange={(e) => setShalomCode(e.target.value)}
              placeholder="Ej. SH-2026-4821"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="receipt">Foto del comprobante de Shalom</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={!shalomCode || !file || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Subiendo…' : 'Confirmar envío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
