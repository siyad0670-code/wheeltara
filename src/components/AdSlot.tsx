import React from 'react';

interface AdSlotProps {
  slotId?: string;
  variant?: 'banner' | 'rectangle';
}

export function AdSlot({ variant = 'banner' }: AdSlotProps) {
  const heightClass = variant === 'rectangle' ? 'min-h-[250px]' : 'min-h-[90px]';

  return (
    <div
      className={`my-6 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-400 ${heightClass}`}
    >
      {/* Replace with Google AdSense <ins className="adsbygoogle"> after approval */}
      <span>Advertisement</span>
    </div>
  );
}