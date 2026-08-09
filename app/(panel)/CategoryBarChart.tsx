'use client';

import type { ComponentProps } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import type { DefaultTooltipContentProps } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

type BarTooltipProps = ComponentProps<typeof Tooltip> &
  Omit<DefaultTooltipContentProps<number, string>, 'accessibilityLayer'>;

/**
 * Barra horizontal con shadcn/Recharts. Colores por categoría validados con
 * el skill dataviz (scripts/validate_palette.js, CVD + contraste) — vienen
 * ya elegidos en `config`, este componente no inventa colores.
 */
export interface BarChartItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

function BarTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as BarChartItem;

  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
        <span className="font-medium text-popover-foreground">{row.label}</span>
        <span className="text-muted-foreground">{row.value}</span>
      </div>
    </div>
  );
}

export default function CategoryBarChart({ items }: { items: BarChartItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay datos.</p>;
  }

  const config: ChartConfig = Object.fromEntries(
    items.map((item) => [item.key, { label: item.label, color: item.color }]),
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={items} layout="vertical" margin={{ left: 0, right: 12 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: 'var(--muted)' }} content={<BarTooltip />} />
        <Bar dataKey="value" radius={4}>
          {items.map((item) => (
            <Cell key={item.key} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
