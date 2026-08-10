'use client';

import { toast as sonner } from 'sonner';

/**
 * Único punto de entrada a los toasts del panel. No llames a `sonner` directo
 * desde un componente: centralizarlo acá permite cambiar duraciones, estilos,
 * posición o incluso la librería sin tocar cada pantalla.
 *
 * Los mensajes de error de la API ya vienen redactados para el usuario final
 * (ver los `ConflictException`/`BadRequestException` de `api/`), así que se
 * muestran tal cual; `fallback` cubre el caso de un error sin mensaje útil.
 */

/** Duraciones distintas a propósito: un error hay que alcanzar a leerlo. */
const DURATION = {
  success: 3000,
  error: 6000,
  info: 4000,
} as const;

export function useToast() {
  return {
    success(message: string, description?: string) {
      sonner.success(message, { description, duration: DURATION.success });
    },

    error(message: string, description?: string) {
      sonner.error(message, { description, duration: DURATION.error });
    },

    info(message: string, description?: string) {
      sonner.info(message, { description, duration: DURATION.info });
    },

    /**
     * Para errores que vienen de un catch/`useMutation.onError`, donde lo que
     * hay es un `unknown`. Evita repetir el `instanceof Error` en cada pantalla.
     */
    fromError(error: unknown, fallback = 'Algo salió mal. Intenta de nuevo.') {
      const message =
        error instanceof Error && error.message ? error.message : fallback;
      sonner.error(message, { duration: DURATION.error });
    },
  };
}
