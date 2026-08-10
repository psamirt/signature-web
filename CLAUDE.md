@AGENTS.md

# web/ — panel de gestión de Aura Signature

Ver también [`../CLAUDE.md`](../CLAUDE.md) para cómo encaja esto con `api/`.

Next.js 16, App Router. Tailwind para todo el diseño — UI simple y funcional, no la referencia visual elaborada que se descartó a propósito (el dashboard con gráficos queda para más adelante).

**Stack de datos/UI para todo trabajo nuevo (decidido 2026-08-08):**
- **TanStack Query** (`@tanstack/react-query`, ya en `package.json`) para las llamadas y mutaciones desde el cliente — cachea en el navegador y evita refetch innecesario al navegar entre páginas.
- **shadcn/ui** para componentes — instalar con `npx shadcn@latest add <componente>` en vez de escribir botones/inputs/tablas/diálogos a mano.

Ya no queda código con el patrón viejo: `app/(panel)/productos/` se migró a TanStack Query + shadcn el 2026-08-09 (junto con la papelera). Como referencia usa `app/(panel)/pedidos/` (incluye un caso de subida de archivo a Cloudinary: `ShipOrderDialog.tsx`, `lib/cloudinary.ts`) o `app/(panel)/productos/` (tabs Activos/Papelera, `AlertDialog` de confirmación, formulario de crear/editar con `useMutation`).

## Estructura

- `proxy.ts` (raíz) — el middleware de Next 16 se llama "proxy", no "middleware". Protege todas las rutas excepto `/login` verificando la cookie de sesión con `jose`.
- `app/login/` — página + Server Action de login (compara contra `ADMIN_USERNAME`/`ADMIN_PASSWORD` de env, `timingSafeEqual`) + `logout()`.
- `app/(panel)/` — route group con el shell autenticado (`layout.tsx` con la barra superior). Todo lo que vive acá requiere sesión válida.
  - `app/(panel)/productos/` — CRUD de catálogo + papelera (tabs Activos/Papelera, restaurar y eliminar definitivamente). Ver "Papelera de productos" en `api/CLAUDE.md` para por qué el borrado es soft.
  - `app/(panel)/pedidos/` — listado de pedidos + "marcar enviado" (patrón nuevo: TanStack Query + shadcn + subida a Cloudinary).
- `lib/auth.ts` — firma/verifica el JWT de sesión (`jose`, compatible con el runtime Edge de `proxy.ts`).
- `lib/api.ts` — **server-only**, nunca importar directo desde un Client Component. Adjunta Basic Auth (`API_ADMIN_USER`/`API_ADMIN_PASSWORD`) a cada llamada a la API NestJS. Es la única vía para hablar con `api/` — con TanStack Query, sus funciones se envuelven en Server Actions que sirven de `queryFn`/`mutationFn` (ver patrón abajo).
- `components/ui/` — donde `shadcn` instala los componentes (se crea con `npx shadcn@latest init` la primera vez que se use).

## Patrón para agregar un recurso nuevo al panel (TanStack Query + shadcn)

1. Backend primero: confirma que la API ya expone el CRUD que necesitas (ver `api/CLAUDE.md`). El panel nunca debe inventar lógica de negocio en el frontend — solo llama a la API.
2. Agrega los tipos + helpers server-only en `lib/api.ts` (interfaces + funciones `getXs`/`getX`/`createX`/`updateX`/`deleteX`), igual que las de `Product` ya existentes.
3. Envuelve esos helpers en Server Actions dentro de `app/(panel)/x/actions.ts` (`'use server'`). Los Server Actions son invocables como funciones normales desde código de cliente, no solo desde `<form action>` — por eso son el punto de entrada seguro para TanStack Query: las credenciales de `API_ADMIN_USER`/`API_ADMIN_PASSWORD` nunca salen del servidor.
4. Página de listado como **Client Component** (`'use client'`) que usa `useQuery` con la Server Action de lectura como `queryFn`. Usa `<Suspense>`/estados de loading de shadcn (`Skeleton`) mientras carga.
5. Formularios de crear/editar con `useMutation`, `mutationFn` = la Server Action correspondiente, `onSuccess` invalidando la query (`queryClient.invalidateQueries`) en vez de `revalidatePath`. Usa los componentes de shadcn (`Form`, `Input`, `Button`, `Dialog` si aplica) en vez de construir el formulario a mano.
6. Eliminar: `useMutation` + el componente `AlertDialog` de shadcn para la confirmación, en vez de `confirm()` del navegador.
7. Si algún componente de shadcn que necesitas no está instalado, corre `npx shadcn@latest add <nombre>` — no lo escribas a mano.

**Errores esperados: devolverlos, nunca `throw` desde un Server Action.** Si un Server Action deja propagar un error (ej. un 409 de la API al intentar eliminar un producto con pedidos), Next lo convierte en un 500 opaco con `digest` y el cliente solo ve "Minified React error #441" — el mensaje real nunca llega. El patrón es el de `productos/actions.ts`: las mutaciones devuelven `ActionResult` (`{ ok: true } | { ok: false; error }`) y el cliente lo pasa por `unwrap()` (`productos/unwrap.ts`) para que sí sea un throw dentro de `useMutation` y caiga en `mutation.isError`. Los `queryFn` de lectura pueden propagar normal — ahí `isError` de `useQuery` alcanza.

## Variables de entorno (`.env.local`, ver `.env.local.example`)

`SESSION_SECRET`, `ADMIN_USERNAME`/`ADMIN_PASSWORD` (login del panel), `API_BASE_URL`, `API_ADMIN_USER`/`API_ADMIN_PASSWORD` (deben coincidir con `ADMIN_USER`/`ADMIN_PASSWORD` de `api/.env`).

## Comandos

```bash
pnpm dev      # next dev -p 3001 (3000 lo usa la API)
pnpm build    # valida tipos + build de producción, correrlo antes de dar por terminado un cambio
npx shadcn@latest add <componente>   # instalar un componente de shadcn/ui
```
