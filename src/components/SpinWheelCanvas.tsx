'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_PALETTE, type WheelItem } from '@/data/wheels';

interface SpinWheelCanvasProps {
  items: WheelItem[];
  weightedMode: boolean;
  soundEnabled: boolean;
  spinLabel: string;
  spinningLabel: string;
  onWin: (winner: WheelItem) => void;
  size?: number;
  externalSpinTrigger?: number;
}

function getCryptoRandom(): number {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

export function SpinWheelCanvas({
  items,
  weightedMode,
  soundEnabled,
  spinLabel,
  spinningLabel,
  onWin,
  size = 400,
  externalSpinTrigger = 0,
}: SpinWheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }, [soundEnabled, getAudioContext]);

  const playWinChime = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }, [soundEnabled, getAudioContext]);

  const getSlices = useCallback(() => {
    const valid =
      items.length > 0 ? items : [{ id: 'empty', label: 'Add items', weight: 1 }];
    const totalWeight = valid.reduce(
      (sum, item) => sum + (weightedMode ? Math.max(1, item.weight || 1) : 1),
      0
    );
    let current = 0;
    return valid.map((item, idx) => {
      const w = weightedMode ? Math.max(1, item.weight || 1) : 1;
      const arc = (w / totalWeight) * Math.PI * 2;
      const start = current;
      const end = current + arc;
      current = end;
      return {
        item,
        start,
        end,
        color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      };
    });
  }, [items, weightedMode]);

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 10;
      const slices = getSlices();

      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      slices.forEach((slice) => {
        const startAngle = slice.start + rotation;
        const endAngle = slice.end + rotation;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        const midAngle = (startAngle + endAngle) / 2;
        if (endAngle - startAngle > 0.08) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(midAngle);
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          const fontSize = Math.max(11, Math.min(18, Math.floor(235 / Math.max(6, slices.length))));
          ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 3;
          const text =
            slice.item.label.length > 15
              ? slice.item.label.slice(0, 14) + '…'
              : slice.item.label;
          ctx.fillText(text, radius - 16, 0);
          ctx.restore();
        }
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();
    },
    [getSlices, size]
  );

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const getSliceIndexAtTop = useCallback(
    (rotation: number) => {
      const slices = getSlices();
      const twoPi = Math.PI * 2;
      const localAngle = (((-Math.PI / 2 - rotation) % twoPi) + twoPi) % twoPi;
      return slices.findIndex((s) => localAngle >= s.start && localAngle < s.end);
    },
    [getSlices]
  );

  const handleSpin = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);

    const startRotation = rotationRef.current;
    const extraSpins = (5 + Math.floor(getCryptoRandom() * 4)) * Math.PI * 2;
    const randomOffset = getCryptoRandom() * Math.PI * 2;
    const targetRotation = startRotation + extraSpins + randomOffset;
    const duration = 4500;
    const startTime = performance.now();
    let lastSliceIdx = getSliceIndexAtTop(startRotation);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRotation + (targetRotation - startRotation) * eased;
      rotationRef.current = current;
      drawWheel(current);

      const currentIdx = getSliceIndexAtTop(current);
      if (currentIdx !== lastSliceIdx) {
        lastSliceIdx = currentIdx;
        playTick();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const slices = getSlices();
        const winnerIdx = getSliceIndexAtTop(current);
        const winner = slices[winnerIdx >= 0 ? winnerIdx : 0]?.item;
        if (winner) {
          playWinChime();
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.5 } });
          onWin(winner);
        }
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, items.length, getSliceIndexAtTop, drawWheel, playTick, getSlices, playWinChime, onWin]);

  const lastTriggerRef = useRef(0);

  useEffect(() => {
    if (externalSpinTrigger > lastTriggerRef.current) {
      lastTriggerRef.current = externalSpinTrigger;
      handleSpin();
    }
  }, [externalSpinTrigger, handleSpin]);
  return (
    <div className="flex w-full flex-col items-center justify-center select-none">
      {/* Red Pointer matching mockup */}
      <div
        className="z-10 -mb-3 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow"
        aria-hidden="true"
      />
      <div
        className="relative flex w-full max-w-[350px] items-center justify-center sm:max-w-[380px]"
      >
        <canvas
          ref={canvasRef}
          onClick={handleSpin}
          className="aspect-square h-auto w-full cursor-pointer rounded-full drop-shadow-md transition-transform active:scale-[0.99]"
        />
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || items.length === 0}
          className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-black text-slate-900 shadow-md ring-2 ring-slate-200 transition hover:scale-105 hover:text-orange-600 disabled:opacity-60 sm:h-16 sm:w-16 sm:text-sm"
        >
          {isSpinning ? '•••' : spinLabel}
        </button>
      </div>
    </div>
  );
}