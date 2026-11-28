'use client';

import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { compressToEncodedURIComponent } from 'lz-string';
import type { WheelItem } from '@/data/wheels';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WheelItem[];
  locale: string;
  labels: {
    embedTitle: string;
    shareUrlLabel: string;
    embedCodeLabel: string;
    copy: string;
    copied: string;
    close: string;
  };
}

export function EmbedModal({
  isOpen,
  onClose,
  items,
  locale,
  labels,
}: EmbedModalProps) {
  const [copiedField, setCopiedField] = useState<'share' | 'embed' | null>(null);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://wheeltara.com';
  const payload = compressToEncodedURIComponent(
    JSON.stringify(items.map((i) => ({ l: i.label, w: i.weight })))
  );
  const shareUrl = `${origin}/${locale}/?data=${payload}`;
  const embedUrl = `${origin}/${locale}/embed/?data=${payload}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="580" style="border:0;border-radius:12px;" loading="lazy" allowfullscreen title="WheelTara Spin Wheel"></iframe>\n<p style="font-size:12px;text-align:center;margin-top:6px;">Powered by <a href="https://wheeltara.com/${locale}/" target="_blank" rel="noopener">WheelTara Spin Wheel</a></p>`;

  const handleCopy = async (text: string, field: 'share' | 'embed') => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{labels.embedTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {labels.shareUrlLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700"
              />
              <button
                type="button"
                onClick={() => handleCopy(shareUrl, 'share')}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
              >
                {copiedField === 'share' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedField === 'share' ? labels.copied : labels.copy}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {labels.embedCodeLabel}
            </label>
            <textarea
              readOnly
              rows={4}
              value={iframeCode}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={() => handleCopy(iframeCode, 'embed')}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              {copiedField === 'embed' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedField === 'embed' ? labels.copied : labels.copy}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}