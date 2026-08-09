'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { runLeadAnalysisAction } from './actions';

export default function RunLeadAnalysisButton() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: runLeadAnalysisAction,
    onSuccess: ({ analyzed }) => {
      setLastResult(
        analyzed === 0
          ? 'No había conversaciones inactivas nuevas para analizar.'
          : `Se analizaron ${analyzed} conversación${analyzed === 1 ? '' : 'es'}.`,
      );
      queryClient.invalidateQueries({ queryKey: ['lead-insights'] });
    },
    onError: (err: Error) => setLastResult(`Error: ${err.message}`),
  });

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? 'Analizando…' : 'Analizar conversaciones inactivas ahora'}
      </Button>
      {lastResult && <span className="text-sm text-muted-foreground">{lastResult}</span>}
    </div>
  );
}
