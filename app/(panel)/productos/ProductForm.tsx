'use client';

import { useActionState } from 'react';
import type { Product } from '@/lib/api';

type ActionState = { error?: string } | undefined;
type FormAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: FormAction;
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  return (
    <form action={formAction} className="grid max-w-2xl gap-4">
      <Field label="Nombre">
        <input
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
          className={inputClass}
        />
      </Field>

      <Field label="Slug">
        <input
          id="slug"
          name="slug"
          required
          defaultValue={product?.slug}
          onChange={(e) => {
            e.target.dataset.touched = 'true';
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Descripción">
        <textarea
          name="description"
          defaultValue={product?.description ?? ''}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Categoría">
          <input name="category" defaultValue={product?.category ?? ''} className={inputClass} />
        </Field>
        <Field label="Marca">
          <input name="brand" defaultValue={product?.brand ?? ''} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Precio (frasco)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </Field>
        <Field label="Precio (decant)">
          <input
            name="priceDecant"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.priceDecant ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Decants por frasco">
        <input
          name="decantsPerBottle"
          type="number"
          min="1"
          defaultValue={product?.decantsPerBottle ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label="URL de imagen">
        <input
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl ?? ''}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          name="active"
          type="checkbox"
          defaultChecked={product?.active ?? true}
          className="h-4 w-4"
        />
        Activo (visible en el catálogo)
      </label>

      <hr className="my-2 border-border" />
      <h2 className="text-sm font-semibold text-foreground">Inventario</h2>

      <Field label="SKU">
        <input
          name="sku"
          required={!product}
          defaultValue={product?.inventory?.sku}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Frascos sellados">
          <input
            name="sealedUnits"
            type="number"
            min="0"
            defaultValue={product?.inventory?.sealedUnits ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Decants sueltos">
          <input
            name="openDecants"
            type="number"
            min="0"
            defaultValue={product?.inventory?.openDecants ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? 'Guardando…' : submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  'rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-ring';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
