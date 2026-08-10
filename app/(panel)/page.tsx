'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAnalyticsOverviewAction, getLeadInsightsAction } from './actions';
import CategoryBarChart from './CategoryBarChart';
import RunLeadAnalysisButton from './RunLeadAnalysisButton';

const STATUS_LABEL: Record<string, string> = {
  pendiente_pago: 'Esperando pago',
  pendiente: 'Pagado, falta enviar',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
};

// Colores validados con el skill dataviz (scripts/validate_palette.js).
// Orden fijo, no se reordena si cambian los datos.
const LEAD_SCORE_LABEL: Record<string, { label: string; color: string }> = {
  caliente: { label: 'Caliente', color: '#eb6834' },
  tibio: { label: 'Tibio', color: '#1baf7a' },
  frio: { label: 'Frío', color: '#2a78d6' },
};

const DROP_OFF_REASON_LABEL: Record<string, { label: string; color: string }> = {
  precio: { label: 'Precio', color: '#2a78d6' },
  sin_stock: { label: 'Sin stock', color: '#eb6834' },
  envio: { label: 'Envío', color: '#1baf7a' },
  sin_respuesta: { label: 'No respondió', color: '#eda100' },
  cambio_opinion: { label: 'Cambió de opinión', color: '#e87ba4' },
  otro: { label: 'Otro', color: '#008300' },
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: getAnalyticsOverviewAction,
  });
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['lead-insights'],
    queryFn: getLeadInsightsAction,
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Métricas del negocio, calculadas de tus datos.
      </p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="mt-6 text-sm text-destructive">No se pudieron cargar las métricas.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Pedidos totales" value={String(data.totalOrders)} />
            <StatCard label="Ingresos" value={`S/ ${data.totalRevenue}`} hint="pedidos pagados" />
            <StatCard
              label="Tasa de conversión"
              value={formatPercent(data.conversionRate)}
              hint="conversaciones → pedido"
            />
            <StatCard
              label="Tiempo de respuesta"
              value={data.avgResponseMinutes != null ? `${data.avgResponseMinutes.toFixed(1)} min` : '—'}
              hint="promedio, últimos 30 días"
            />
            <StatCard
              label="Tasa de escalamiento"
              value={formatPercent(data.escalationRate)}
              hint="pidieron un asesor"
            />
            <StatCard label="Clientes regulares" value={String(data.regularCustomers)} hint="2+ pedidos" />
            <StatCard
              label="Pedidos abandonados"
              value={String(data.abandonedOrders)}
              hint="esperando pago +24h"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Pedidos por estado</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.ordersByStatus).map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>{STATUS_LABEL[status] ?? status}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(data.ordersByStatus).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Todavía no hay pedidos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Más vendidos</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Unidades</TableHead>
                      <TableHead>Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((p) => (
                      <TableRow key={p.key}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>S/ {p.revenue}</TableCell>
                      </TableRow>
                    ))}
                    {data.topProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Todavía no hay ventas pagadas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Leads</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Clasificación de conversaciones inactivas hecha por el bot — qué tan cerca estaban
                  de comprar y por qué no cerraron.
                </p>
              </div>
              <RunLeadAnalysisButton />
            </div>

            {leadsLoading ? (
              <Skeleton className="mt-4 h-40 w-full" />
            ) : !leads || leads.recent.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Todavía no hay conversaciones analizadas. Usa el botón de arriba para analizar las
                inactivas hace más de 12 horas.
              </p>
            ) : (
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground">Temperatura de leads</h3>
                  <div className="mt-4">
                    <CategoryBarChart
                      items={Object.entries(leads.leadScoreCounts).map(([key, value]) => ({
                        key,
                        label: LEAD_SCORE_LABEL[key]?.label ?? key,
                        value,
                        color: LEAD_SCORE_LABEL[key]?.color ?? '#898781',
                      }))}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground">Por qué no compraron</h3>
                  <div className="mt-4">
                    <CategoryBarChart
                      items={Object.entries(leads.dropOffReasonCounts).map(([key, value]) => ({
                        key,
                        label: DROP_OFF_REASON_LABEL[key]?.label ?? key,
                        value,
                        color: DROP_OFF_REASON_LABEL[key]?.color ?? '#898781',
                      }))}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-foreground">Conversaciones recientes</h3>
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Lead</TableHead>
                          <TableHead>¿Compró?</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Resumen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.recent.map((r) => (
                          <TableRow key={r.conversationId}>
                            <TableCell className="text-foreground">{r.customerName}</TableCell>
                            <TableCell>{LEAD_SCORE_LABEL[r.leadScore]?.label ?? r.leadScore}</TableCell>
                            <TableCell>{r.converted ? 'Sí' : 'No'}</TableCell>
                            <TableCell>
                              {r.dropOffReason
                                ? (DROP_OFF_REASON_LABEL[r.dropOffReason]?.label ?? r.dropOffReason)
                                : '—'}
                            </TableCell>
                            <TableCell className="max-w-xs text-muted-foreground">{r.summary}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
