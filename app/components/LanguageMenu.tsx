"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildHref, type SearchParams } from "@/app/lib/href";
import { LANGUAGE_OPTIONS, type Lang } from "@/app/lib/i18n";

// Windows' emoji font has no regional-indicator flag glyphs and falls back to
// the raw two-letter code (e.g. "FI"), so flags are drawn as inline SVGs
// instead of emoji to render consistently across platforms.
function FlagIcon({ code }: { code: Lang }) {
  const className = "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10 dark:ring-white/20";
  if (code === "fi") {
    return (
      <svg viewBox="0 0 18 12" className={className} aria-hidden>
        <rect width="18" height="12" fill="#fff" />
        <rect x="5" width="3" height="12" fill="#003580" />
        <rect y="5" width="18" height="2" fill="#003580" />
      </svg>
    );
  }
  if (code === "sv") {
    return (
      <svg viewBox="0 0 16 10" className={className} aria-hidden>
        <rect width="16" height="10" fill="#006aa7" />
        <rect x="5" width="2" height="10" fill="#fecc00" />
        <rect y="4" width="16" height="2" fill="#fecc00" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 36" className={className} aria-hidden>
      <rect width="60" height="36" fill="#00247d" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#cf142b" strokeWidth="2" />
      <path d="M30,0 V36 M0,18 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V36 M0,18 H60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  );
}

export default function LanguageMenu({
  active,
  view,
  params,
}: {
  active: Lang;
  view: string;
  params: SearchParams;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeOption = LANGUAGE_OPTIONS.find((option) => option.code === active) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-black/[.08] bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:border-indigo-300 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-700"
      >
        <FlagIcon code={activeOption.code} />
        {activeOption.label}
        <span aria-hidden className="text-zinc-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 flex min-w-40 flex-col gap-1 rounded-lg border border-black/[.08] bg-white p-1.5 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
          {LANGUAGE_OPTIONS.map((option) => (
            <Link
              key={option.code}
              href={buildHref(params, { view, lang: option.code }, { view: "tulevat", lang: "fi" })}
              onClick={() => setOpen(false)}
              className={
                "flex items-center gap-2 rounded px-2 py-1.5 text-sm " +
                (option.code === active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900")
              }
            >
              <FlagIcon code={option.code} />
              {option.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
