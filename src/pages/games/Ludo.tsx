import React from 'react';
import { Button } from '@/components/ui/Button';

export default function Ludo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h1 className="text-4xl font-bold text-primary">Člověče, nezlob se!</h1>
      <p className="text-muted max-w-md">
        Legendární stolní hra pro celou rodinu. Hoďte kostkou a dostaňte své figurky do domečku jako první!
      </p>
      <div className="p-8 border border-border/20 rounded-xl bg-surface/50">
        <div className="text-6xl mb-4">🎲</div>
        <Button disabled>Brzy k dispozici</Button>
      </div>
    </div>
  );
}
