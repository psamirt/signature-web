/**
 * Los errores esperados de la API (ej. 409 al eliminar un producto con un
 * pedido en curso) se devuelven como valor, no con throw: en un Server Action
 * un throw se convierte en un 500 opaco con `digest` y el mensaje real nunca
 * llega al cliente ("Minified React error #441").
 *
 * Del lado del cliente sí conviene un throw, para que `useMutation` lo tome
 * como `onError` y el toast muestre el motivo — eso es lo que hace `unwrap`.
 *
 * Sin dependencias server-only a propósito: lo importan las Server Actions
 * (`run`) y los Client Components (`unwrap`). No devuelve el valor de la API:
 * las mutaciones del panel solo invalidan queries, no lo usan.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Envuelve una llamada a la API en un ActionResult. Usar dentro de 'use server'. */
export async function run(fn: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await fn();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error inesperado.',
    };
  }
}

/** Convierte el ActionResult en throw, para usarlo como `mutationFn`. */
export async function unwrap(promise: Promise<ActionResult>): Promise<void> {
  const result = await promise;
  if (!result.ok) throw new Error(result.error);
}
