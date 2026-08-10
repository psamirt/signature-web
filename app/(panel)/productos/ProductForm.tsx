'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ActionResult } from './actions';
import { unwrap } from './unwrap';
import type { Product } from '@/lib/api';

export default function ProductForm({
  mutationFn,
  product,
  submitLabel,
}: {
  mutationFn: (formData: FormData) => Promise<ActionResult>;
  product?: Product;
  submitLabel: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => unwrap(mutationFn(formData)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/productos');
    },
    onError: (err: Error) => setError(err.message),
  });

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
      <Field label="Nombre">
        <Input
          name="name"
          required
          defaultValue={product?.name}
          onChange={(e) => {
            if (!product) {
              const slugInput = document.getElementById('slug') as HTMLInputElement | null;
              if (slugInput && !slugInput.dataset.touched) {
                slugInput.value = slugify(e.target.value);
              }
            }
          }}
        />
      </Field>

      <Field label="Slug">
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={product?.slug}
          onChange={(e) => {
            e.target.dataset.touched = 'true';
          }}
        />
      </Field>

      <Field label="Descripción">
        <Textarea name="description" defaultValue={product?.description ?? ''} rows={3} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Categoría">
          <Input name="category" defaultValue={product?.category ?? ''} />
        </Field>
        <Field label="Marca">
          <Input name="brand" defaultValue={product?.brand ?? ''} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Precio (frasco)">
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
          />
        </Field>
        <Field label="Precio (decant)">
          <Input
            name="priceDecant"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.priceDecant ?? ''}
          />
        </Field>
      </div>

      <Field label="Decants por frasco">
        <Input
          name="decantsPerBottle"
          type="number"
          min="1"
          defaultValue={product?.decantsPerBottle ?? ''}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox name="decantEnabled" defaultChecked={product?.decantEnabled ?? true} />
        Habilitado para decants (algunos perfumes se venden solo por frasco)
      </label>

      <Field label="URL de imagen">
        <Input name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ''} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox name="active" defaultChecked={product?.active ?? true} />
        Activo (visible en el catálogo)
      </label>

      <hr className="my-2 border-border" />
      <h2 className="text-sm font-semibold text-foreground">Inventario</h2>

      <Field label="SKU">
        <Input name="sku" required={!product} defaultValue={product?.inventory?.sku} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Frascos sellados">
          <Input
            name="sealedUnits"
            type="number"
            min="0"
            defaultValue={product?.inventory?.sealedUnits ?? 0}
          />
        </Field>
        <Field label="Decants sueltos">
          <Input
            name="openDecants"
            type="number"
            min="0"
            defaultValue={product?.inventory?.openDecants ?? 0}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={mutation.isPending} className="mt-2 w-fit">
        {mutation.isPending ? 'Guardando…' : submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
