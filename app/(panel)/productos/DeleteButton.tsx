'use client';

import { useActionState } from 'react';
import { deleteProductAction } from './actions';

type ActionState = { error?: string } | undefined;

export default function DeleteButton({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<ActionState>(
    () => deleteProductAction(productId),
    undefined,
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
        onClick={(event) => {
          if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
            event.preventDefault();
          }
        }}
      >
        Eliminar
      </button>
      {state?.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
