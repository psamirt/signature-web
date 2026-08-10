import type { ActionResult } from './actions';

/**
 * Los Server Actions devuelven el error como valor (ver actions.ts). Del lado
 * del cliente sí conviene un throw, para que useMutation lo tome como onError.
 */
export async function unwrap(promise: Promise<ActionResult>): Promise<void> {
  const result = await promise;
  if (!result.ok) throw new Error(result.error);
}
