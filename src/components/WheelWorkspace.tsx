'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { decompressFromEncodedURIComponent } from 'lz-string';
import {
  Maximize2,
  Minimize2,
  Share2,
  Shuffle,
  ArrowDownAZ,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Play,
  Users,
  Trophy,
} from 'lucide-react';
import { SpinWheelCanvas } from './SpinWheelCanvas';
import { EmbedModal } from './EmbedModal';
import type { WheelItem } from '@/data/wheels';

interface WheelWorkspaceProps {
  initialItems: string[];
  locale: string;
  embedOnly?: boolean;
}

const WHEEL_THEMES: Record<string, { name: string; colors: string[] }> = {
  classic: {
    name: 'Classic',
    colors: ['#FBBF24', '#84CC16', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#10B981'],
  },
  sunset: {
    name: 'Sunset',
    colors: ['#EA580C', '#F59E0B', '#DC2626', '#FB923C', '#E11D48', '#FBBF24'],
  },
  ocean: {
    name: 'Ocean',
    colors: ['#0284C7', '#0D9488', '#2563EB', '#06B6D4', '#0F766E', '#38BDF8'],
  },
  pastel: {
    name: 'Pastel',
    colors: ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'],
  },
};

function buildItems(labels: string[], themeKey: string): WheelItem[] {
  const palette = WHEEL_THEMES[themeKey]?.colors || WHEEL_THEMES.classic.colors;
  return labels.map((label, idx) => ({
    id: `${idx}-${label}`,
    label,
    weight: 1,
    color: palette[idx % palette.length],
  }));
}

export function WheelWorkspace({
  initialItems,
  locale,
  embedOnly = false,
}: WheelWorkspaceProps) {
  const t = useTranslations('UI');
  const searchParams = useSearchParams();

  const [theme] = useState<string>('classic');
  const [rawText, setRawText] = useState<string>(() => initialItems.join('\n'));
  const [items, setItems] = useState<WheelItem[]>(() => buildItems(initialItems, 'classic'));
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [eliminationMode, setEliminationMode] = useState(false);
  const [weightedMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [history, setHistory] = useState<Array<{ label: string; time: string }>>([]);
  const [copiedResults, setCopiedResults] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);

  const handleTextChange = (text: string) => {
    setRawText(text);
    const lines = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const palette = WHEEL_THEMES[theme].colors;
    setItems((prev) =>
      lines.map((label, idx) => ({
        id: `${idx}-${label}`,
        label,
        weight: prev[idx]?.label === label ? prev[idx].weight : 1,
        color: palette[idx % palette.length],
      }))
    );
  };

  useEffect(() => {
    const encoded = searchParams.get('data');
    if (!encoded) return;
    try {
      const json = decompressFromEncodedURIComponent(encoded);
      if (!json) return;
      const parsed = JSON.parse(json) as Array<{ l: string; w?: number }>;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const safe = parsed.slice(0, 150);
        const palette = WHEEL_THEMES.classic.colors;
        setRawText(safe.map((p) => String(p.l).slice(0, 80)).join('\n'));
        setItems(
          safe.map((p, idx) => ({
            id: `${idx}-${p.l}`,
            label: String(p.l).slice(0, 80),
            weight: Number(p.w) > 0 ? Number(p.w) : 1,
            color: palette[idx % palette.length],
          }))
        );
      }
    } catch {
      // Ignore malformed URL data
    }
  }, [searchParams]);

  const handleShuffle = () => {
    const lines = rawText.split('\n').map((s) => s.trim()).filter(Boolean);
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    handleTextChange(lines.join('\n'));
  };

  const handleSort = () => {
    const lines = rawText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    handleTextChange(lines.join('\n'));
  };

  const handleClear = () => {
    setRawText('');
    setItems([]);
  };

  const handleWin = (won: WheelItem) => {
    setWinner(won);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [{ label: won.label, time }, ...prev].slice(0, 100));
  };

  const handleRemoveWinner = () => {
    if (!winner) return;
    const remaining = items.filter((item) => item.id !== winner.id);
    setItems(remaining);
    setRawText(remaining.map((i) => i.label).join('\n'));
    setWinner(null);
  };

  const handleCopyResults = async () => {
    const text = history.map((h, i) => `${history.length - i}. ${h.label} (${h.time})`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedResults(true);
    setTimeout(() => setCopiedResults(false), 2000);
  };

  if (embedOnly) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-3">
        <SpinWheelCanvas
          items={items}
          weightedMode={weightedMode}
          soundEnabled={soundEnabled}
          spinLabel={t('spin')}
          spinningLabel={t('spinning')}
          onWin={handleWin}
          size={360}
        />
        {winner && (
          <div className="mt-4 rounded-xl bg-slate-900 px-6 py-3 text-center text-white shadow-lg">
            <p className="text-xs uppercase opacity-75">{t('winner')}</p>
            <p className="text-xl font-bold">{winner.label}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto bg-white p-4'
            : 'grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-8'
        }
      >
        <div
          className={`flex flex-col items-center ${
            isFullscreen ? 'w-full max-w-xl' : 'lg:col-span-6'
          }`}
        >
          <SpinWheelCanvas
            items={items}
            weightedMode={weightedMode}
            soundEnabled={soundEnabled}
            spinLabel={t('spin')}
            spinningLabel={t('spinning')}
            onWin={handleWin}
            size={isFullscreen ? 460 : 380}
            externalSpinTrigger={spinTrigger}
          />

          <div className="mt-3 flex w-full justify-end gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-orange-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
              {t('sound')}
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            </button>
            <button
              type="button"
              onClick={() => setIsEmbedOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5 text-orange-600" />
              {t('share')}
            </button>
          </div>
        </div>

        {!isFullscreen && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-5 lg:col-span-6">
            <div className="mb-3 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('entries')}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-2 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'entries'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                {t('entries')} ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('results')}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-2 text-xs font-bold transition sm:text-sm ${
                  activeTab === 'results'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trophy className="h-4 w-4" />
                {t('history')} ({history.length})
              </button>
            </div>

            {activeTab === 'entries' ? (
              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={t('bulkPlaceholder')}
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm leading-snug text-slate-900 outline-none focus:border-orange-500 focus:bg-white sm:h-48 sm:p-3"
                />

                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    {t('shuffle')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSort}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowDownAZ className="h-3.5 w-3.5" />
                    {t('sort')}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('clearHistory')}
                  </button>
                </div>

                <label className="mt-2.5 flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  <span>{t('eliminationMode')}</span>
                  <input
                    type="checkbox"
                    checked={eliminationMode}
                    onChange={(e) => setEliminationMode(e.target.checked)}
                    className="h-4 w-4 accent-orange-600"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setSpinTrigger((c) => c + 1)}
                  disabled={items.length === 0}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-base font-extrabold tracking-wide text-white shadow-md shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-white" />
                  {t('spin')}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  {history.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyResults}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {copiedResults ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedResults ? t('copied') : t('copy')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistory([])}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      >
                        {t('clearHistory')}
                      </button>
                    </>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="py-10 text-center text-xs text-slate-400">{t('noHistory')}</p>
                ) : (
                  <ol className="max-h-56 space-y-2 overflow-y-auto text-sm">
                    {history.map((h, i) => {
                      const avatars = ['🦊', '🐼', '🦁', '🐯', '🐨', '🐸', '🦄', '🐙'];
                      const colors = [
                        'bg-orange-100 text-orange-700',
                        'bg-emerald-100 text-emerald-700',
                        'bg-sky-100 text-sky-700',
                        'bg-pink-100 text-pink-700',
                        'bg-amber-100 text-amber-700',
                      ];
                      const avatar = avatars[h.label.length % avatars.length];
                      const badgeColor = colors[i % colors.length];
                      return (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="w-6 shrink-0 text-xs font-extrabold text-orange-600">
                              #{history.length - i}
                            </span>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${badgeColor}`}>
                              {i === 0 ? '🏆' : avatar}
                            </span>
                            <span className="truncate font-semibold text-slate-900">
                              {h.label}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">
                            {h.time}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-[modalPop_0.38s_ease-out_forwards] rounded-[2rem] border border-white/70 bg-white/85 p-3 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] backdrop-blur-md">
            {/* Top Glossy Orange Bar */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-5 py-3 text-white shadow-md shadow-orange-500/30 ring-1 ring-white/40">
              <span className="text-2xl drop-shadow-sm" aria-hidden="true">🏆</span>
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="WheelTara"
                  className="h-7 w-7 rounded-full bg-white object-contain p-0.5 shadow-sm"
                />
                <span className="text-lg font-extrabold tracking-tight">
                  WheelTara
                </span>
              </div>
              <span className="w-7" aria-hidden="true" />
            </div>

            {/* Inner Frosted Celebration Card */}
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 px-6 py-8 text-center shadow-inner">
              {/* Static Celebration Emojis */}
              <span className="pointer-events-none absolute top-3 left-4 -rotate-12 text-2xl select-none" aria-hidden="true">🥳</span>
              <span className="pointer-events-none absolute top-2 left-1/4 text-xl select-none" aria-hidden="true">😂</span>
              <span className="pointer-events-none absolute top-2 right-1/4 text-xl select-none" aria-hidden="true">✨</span>
              <span className="pointer-events-none absolute top-3 right-4 rotate-12 text-2xl select-none" aria-hidden="true">🤩</span>
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 -rotate-6 text-xl select-none" aria-hidden="true">😍</span>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rotate-12 text-xl select-none" aria-hidden="true">🔥</span>
              <span className="pointer-events-none absolute bottom-4 left-5 -rotate-12 text-2xl select-none" aria-hidden="true">🎉</span>
              <span className="pointer-events-none absolute right-5 bottom-4 rotate-12 text-2xl select-none" aria-hidden="true">🎊</span>

              {/* Subtle Golden Glow Behind Winner Name */}
              <div className="pointer-events-none absolute inset-x-10 top-1/3 h-14 rounded-full bg-amber-300/25 blur-xl" aria-hidden="true" />

              <p className="relative z-10 bg-gradient-to-b from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-xs font-black tracking-widest text-transparent uppercase">
                {t('winner')}
              </p>

              {/* 3D Metallic Winner Name + Mirror Reflection */}
              <div className="relative z-10 mt-2 flex flex-col items-center">
                <h3 className="break-words bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_4px_10px_rgba(15,23,42,0.22)] sm:text-5xl">
                  {winner.label}
                </h3>
                <span
                  aria-hidden="true"
                  className="pointer-events-none -mt-2.5 max-w-full scale-y-[-0.55] truncate bg-gradient-to-b from-slate-900/40 to-transparent bg-clip-text text-4xl font-black tracking-tight text-transparent opacity-30 blur-[0.6px] select-none sm:text-5xl"
                >
                  {winner.label}
                </span>
              </div>

              <p className="relative z-10 mt-1 text-sm font-medium text-slate-500">
                You spun and landed on the winning spot!
              </p>

              <div className="relative z-10 mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                {eliminationMode && (
                  <button
                    type="button"
                    onClick={handleRemoveWinner}
                    className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
                  >
                    {t('removeWinner')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setWinner(null)}
                  className="cursor-pointer rounded-full bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/30 transition hover:brightness-105 active:scale-[0.98]"
                >
                  {t('keepWinner')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     
      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        items={items}
        locale={locale}
        labels={{
          embedTitle: t('embedTitle'),
          shareUrlLabel: t('shareUrlLabel'),
          embedCodeLabel: t('embedCodeLabel'),
          copy: t('copy'),
          copied: t('copied'),
          close: t('close'),
        }}
      />
    </>
  );
}