import React from 'react';
import { Button } from '@/components/ui/Button';

export default function Chess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h1 className="text-4xl font-bold text-primary">Šachy</h1>
      <p className="text-muted max-w-md">
        Královská hra. Změřte své strategické myšlení proti ostatním hráčům nebo umělé inteligenci.
      </p>
      <div className="p-8 border border-border/20 rounded-xl bg-surface/50">
        <div className="text-6xl mb-4">♟️</div>
        <Button disabled>Brzy k dispozici</Button>
      </div>
    </div>
  );
}
