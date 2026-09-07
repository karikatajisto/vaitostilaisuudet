"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseEnumParam,
  parseListParam,
  parsePageParam,
  syncFilterParams,
} from "@/app/lib/url-filter-state";
import { DICTIONARIES, FIELD_LABELS, PAALUOKKA_ORDER, type Lang } from "@/app/lib/i18n";

export interface DissertationRow {
  id: number;
  name: string;
  title: string | null;
  university: string | null;
  defense_date: string | null;
  opponent: string | null;
  link: string;
  paaluokka: string | null;
  oppiaine: string | null;
}

type SortColumn = "name" | "title" | "university" | "defense_date" | "opponent" | "paaluokka";
type SortDirection = "asc" | "desc";

// Single-select, not multi — the periods are nested (7 days is inside 30),
// so letting more than one be active at once wouldn't mean anything.
type TimeRange = "kaikki" | "tanaan" | "7" | "30";
const TIME_RANGES: TimeRange[] = ["kaikki", "tanaan", "7", "30"];
const DEFAULT_TIME_RANGE: TimeRange = "kaikki";

const PAGE_SIZE = 20;
const SORT_COLUMNS: SortColumn[] = [
  "name",
  "title",
  "university",
  "defense_date",
  "opponent",
  "paaluokka",
];
const DEFAULT_SORT_COLUMN: SortColumn = "defense_date";

function formatDate(date: string | null, locale: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function compareNullable(a: string | null, b: string | null, locale: string) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b, locale);
}

function getTodayInHelsinki(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
}

// Plain UTC day arithmetic on a date-only (no time) string is fine here —
// we only ever add whole days to compare against other date-only strings,
// so there's no time-of-day/DST subtlety to get wrong.
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function matchesTimeRange(defenseDate: string | null, range: TimeRange, today: string): boolean {
  if (range === "kaikki") return true;
  if (!defenseDate) return false;
  if (range === "tanaan") return defenseDate === today;
  return defenseDate >= today && defenseDate <= addDays(today, range === "7" ? 7 : 30);
}

function TodayBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
      {label}
    </span>
  );
}

export default function DissertationTable({
  dissertations,
  defaultSortDirection = "desc",
  emptyMessage,
  lang,
}: {
  dissertations: DissertationRow[];
  defaultSortDirection?: SortDirection;
  emptyMessage: string;
  lang: Lang;
}) {
  const { table: dict, dateLocale, sortLocale } = DICTIONARIES[lang];
  const fieldLabels = FIELD_LABELS[lang];
  const COLUMNS: { key: SortColumn; label: string }[] = [
    { key: "name", label: dict.columns.name },
    { key: "title", label: dict.columns.title },
    { key: "university", label: dict.columns.university },
    { key: "defense_date", label: dict.columns.date },
    { key: "opponent", label: dict.columns.opponent },
    { key: "paaluokka", label: dict.columns.tieteenala },
  ];
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(() =>
    parseListParam(searchParams.get("uni"))
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(() =>
    parseListParam(searchParams.get("field"))
  );
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    parseEnumParam(searchParams.get("range"), TIME_RANGES, DEFAULT_TIME_RANGE)
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>(() =>
    parseEnumParam(searchParams.get("sort"), SORT_COLUMNS, DEFAULT_SORT_COLUMN)
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(() =>
    parseEnumParam(searchParams.get("dir"), ["asc", "desc"], defaultSortDirection)
  );
  const [page, setPage] = useState(() => parsePageParam(searchParams.get("page")));
  const [isUniversityMenuOpen, setIsUniversityMenuOpen] = useState(false);
  const universityMenuRef = useRef<HTMLDivElement>(null);
  const [isFieldMenuOpen, setIsFieldMenuOpen] = useState(false);
  const fieldMenuRef = useRef<HTMLDivElement>(null);
  const [isTimeRangeMenuOpen, setIsTimeRangeMenuOpen] = useState(false);
  const timeRangeMenuRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => getTodayInHelsinki(), []);

  useEffect(() => {
    if (!isUniversityMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!universityMenuRef.current?.contains(event.target as Node)) {
        setIsUniversityMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsUniversityMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUniversityMenuOpen]);

  useEffect(() => {
    if (!isFieldMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!fieldMenuRef.current?.contains(event.target as Node)) {
        setIsFieldMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFieldMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFieldMenuOpen]);

  useEffect(() => {
    if (!isTimeRangeMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!timeRangeMenuRef.current?.contains(event.target as Node)) {
        setIsTimeRangeMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsTimeRangeMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTimeRangeMenuOpen]);

  const universities = useMemo(
    () =>
      Array.from(new Set(dissertations.map((d) => d.university).filter((u): u is string => Boolean(u)))).sort(
        (a, b) => a.localeCompare(b, sortLocale)
      ),
    [dissertations, sortLocale]
  );

  // Split into two layers so the field-of-science box counts reflect
  // search/university/time-range filtering but not the field selection
  // itself — otherwise every count would collapse to the selected boxes'
  // own count the moment you clicked one.
  const filteredBeforeField = useMemo(() => {
    const query = search.trim().toLowerCase();
    return dissertations.filter((d) => {
      const matchesSearch =
        query.length === 0 ||
        d.name.toLowerCase().includes(query) ||
        (d.title ?? "").toLowerCase().includes(query);
      const matchesUniversity =
        selectedUniversities.length === 0 ||
        (d.university !== null && selectedUniversities.includes(d.university));
      const matchesTime = matchesTimeRange(d.defense_date, timeRange, today);
      return matchesSearch && matchesUniversity && matchesTime;
    });
  }, [dissertations, search, selectedUniversities, timeRange, today]);

  const fieldCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of filteredBeforeField) {
      if (d.paaluokka) counts.set(d.paaluokka, (counts.get(d.paaluokka) ?? 0) + 1);
    }
    return counts;
  }, [filteredBeforeField]);

  const filtered = useMemo(() => {
    if (selectedFields.length === 0) return filteredBeforeField;
    return filteredBeforeField.filter((d) => d.paaluokka !== null && selectedFields.includes(d.paaluokka));
  }, [filteredBeforeField, selectedFields]);

  const sorted = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortColumn === "defense_date") {
        return direction * compareNullable(a.defense_date, b.defense_date, sortLocale);
      }
      return direction * compareNullable(a[sortColumn], b[sortColumn], sortLocale);
    });
  }, [filtered, sortColumn, sortDirection, sortLocale]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(column: SortColumn) {
    const direction: SortDirection =
      column === sortColumn ? (sortDirection === "asc" ? "desc" : "asc") : "asc";
    setSortColumn(column);
    setSortDirection(direction);
    const isDefault = column === DEFAULT_SORT_COLUMN && direction === defaultSortDirection;
    syncFilterParams({ sort: isDefault ? null : column, dir: isDefault ? null : direction });
  }

  function toggleUniversity(university: string) {
    const next = selectedUniversities.includes(university)
      ? selectedUniversities.filter((u) => u !== university)
      : [...selectedUniversities, university];
    setSelectedUniversities(next);
    setPage(1);
    syncFilterParams({ uni: next.length > 0 ? next.join(",") : null, page: null });
  }

  function toggleField(field: string) {
    const next = selectedFields.includes(field)
      ? selectedFields.filter((f) => f !== field)
      : [...selectedFields, field];
    setSelectedFields(next);
    setPage(1);
    syncFilterParams({ field: next.length > 0 ? next.join(",") : null, page: null });
  }

  function handleTimeRangeChange(range: TimeRange) {
    setTimeRange(range);
    setPage(1);
    setIsTimeRangeMenuOpen(false);
    syncFilterParams({ range: range === DEFAULT_TIME_RANGE ? null : range, page: null });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    syncFilterParams({ q: value || null, page: null });
  }

  function clearUniversitySelection() {
    setSelectedUniversities([]);
    setPage(1);
    syncFilterParams({ uni: null, page: null });
  }

  function clearFieldSelection() {
    setSelectedFields([]);
    setPage(1);
    syncFilterParams({ field: null, page: null });
  }

  function goToPage(next: number) {
    setPage(next);
    syncFilterParams({ page: next > 1 ? String(next) : null });
  }

  const universityLabel =
    selectedUniversities.length === 0
      ? dict.allUniversities
      : selectedUniversities.length === 1
        ? selectedUniversities[0]
        : dict.universitiesSelected(selectedUniversities.length);

  const fieldLabel =
    selectedFields.length === 0
      ? dict.allFields
      : selectedFields.length === 1
        ? fieldLabels[selectedFields[0]]
        : dict.fieldsSelected(selectedFields.length);

  const timeRangeOptionLabels: Record<TimeRange, string> = {
    kaikki: dict.timeRange.all,
    tanaan: dict.today,
    "7": dict.timeRange.next7,
    "30": dict.timeRange.next30,
  };
  const timeRangeLabel = timeRangeOptionLabels[timeRange];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 sm:max-w-xs"
        />

        <div ref={universityMenuRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsUniversityMenuOpen((open) => !open)}
            aria-expanded={isUniversityMenuOpen}
            className={
              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-black dark:bg-zinc-950 dark:text-zinc-50 sm:min-w-56 " +
              (isUniversityMenuOpen
                ? "border-indigo-400 dark:border-indigo-500"
                : "border-black/[.08] dark:border-white/[.145]")
            }
          >
            {universityLabel}
            <span aria-hidden className="text-zinc-400">▾</span>
          </button>
          {isUniversityMenuOpen && (
            <div className="absolute z-10 mt-2 flex max-h-72 w-full min-w-56 flex-col gap-1 overflow-y-auto rounded-lg border border-black/[.08] bg-white p-2 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
              <label className="flex items-center gap-2 rounded px-2 py-1 text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900">
                <input
                  type="checkbox"
                  checked={selectedUniversities.length === 0}
                  onChange={clearUniversitySelection}
                  className="accent-indigo-600"
                />
                {dict.all}
              </label>
              <hr className="my-1 border-black/[.08] dark:border-white/[.145]" />
              {universities.map((university) => (
                <label
                  key={university}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedUniversities.includes(university)}
                    onChange={() => toggleUniversity(university)}
                    className="accent-indigo-600"
                  />
                  {university}
                </label>
              ))}
            </div>
          )}
        </div>

        <div ref={fieldMenuRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsFieldMenuOpen((open) => !open)}
            aria-expanded={isFieldMenuOpen}
            className={
              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-black dark:bg-zinc-950 dark:text-zinc-50 sm:min-w-56 " +
              (isFieldMenuOpen
                ? "border-indigo-400 dark:border-indigo-500"
                : "border-black/[.08] dark:border-white/[.145]")
            }
          >
            {fieldLabel}
            <span aria-hidden className="text-zinc-400">▾</span>
          </button>
          {isFieldMenuOpen && (
            <div className="absolute z-10 mt-2 flex max-h-72 w-full min-w-56 flex-col gap-1 overflow-y-auto rounded-lg border border-black/[.08] bg-white p-2 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
              <label className="flex items-center gap-2 rounded px-2 py-1 text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900">
                <input
                  type="checkbox"
                  checked={selectedFields.length === 0}
                  onChange={clearFieldSelection}
                  className="accent-indigo-600"
                />
                {dict.all}
              </label>
              <hr className="my-1 border-black/[.08] dark:border-white/[.145]" />
              {PAALUOKKA_ORDER.map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="accent-indigo-600"
                  />
                  {fieldLabels[field]} ({fieldCounts.get(field) ?? 0})
                </label>
              ))}
            </div>
          )}
        </div>

        <div ref={timeRangeMenuRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsTimeRangeMenuOpen((open) => !open)}
            aria-expanded={isTimeRangeMenuOpen}
            className={
              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-black dark:bg-zinc-950 dark:text-zinc-50 sm:min-w-56 " +
              (isTimeRangeMenuOpen
                ? "border-indigo-400 dark:border-indigo-500"
                : "border-black/[.08] dark:border-white/[.145]")
            }
          >
            {timeRangeLabel}
            <span aria-hidden className="text-zinc-400">▾</span>
          </button>
          {isTimeRangeMenuOpen && (
            <div className="absolute z-10 mt-2 flex w-full min-w-56 flex-col gap-1 rounded-lg border border-black/[.08] bg-white p-2 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
              {TIME_RANGES.map((range) => (
                <label
                  key={range}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  <input
                    type="radio"
                    name="time-range"
                    checked={timeRange === range}
                    onChange={() => handleTimeRangeChange(range)}
                    className="accent-indigo-600"
                  />
                  {timeRangeOptionLabels[range]}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-base text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {paginated.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-2xl border border-black/[.08] border-l-4 border-l-indigo-400/70 bg-white p-4 text-sm dark:border-white/[.145] dark:border-l-indigo-500/60 dark:bg-black"
              >
                <p className="font-medium text-black dark:text-zinc-50">{d.name}</p>
                <p className="text-zinc-700 dark:text-zinc-300">{d.title ?? "—"}</p>
                {d.oppiaine && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{dict.subjectPrefix}{d.oppiaine}</p>
                )}
                <p className="flex flex-wrap items-center gap-2 text-zinc-500 dark:text-zinc-500">
                  <span>
                    {d.university ?? "—"}
                    {formatDate(d.defense_date, dateLocale) ? ` · ${formatDate(d.defense_date, dateLocale)}` : ""}
                    {d.paaluokka ? ` · ${fieldLabels[d.paaluokka] ?? d.paaluokka}` : ""}
                  </span>
                  {d.defense_date === today && <TodayBadge label={dict.today} />}
                </p>
                {d.opponent && (
                  <p className="text-zinc-500 dark:text-zinc-500">{dict.opponentPrefix}{d.opponent}</p>
                )}
                <a
                  href={d.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-700 underline underline-offset-4 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {dict.open}
                </a>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.145] sm:block">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  {COLUMNS.map((column) => (
                    <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold text-black dark:text-zinc-50">
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={
                          "flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-300 " +
                          (sortColumn === column.key ? "text-indigo-700 dark:text-indigo-300" : "")
                        }
                      >
                        {column.label}
                        {sortColumn === column.key && (
                          <span aria-hidden>{sortDirection === "asc" ? "▲" : "▼"}</span>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-black dark:text-zinc-50">
                    {dict.columns.link}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-black/[.08] bg-white last:border-b-0 hover:bg-indigo-50/50 dark:border-white/[.145] dark:bg-black dark:hover:bg-indigo-950/20"
                  >
                    <td className="px-4 py-3 font-medium text-black dark:text-zinc-50">{d.name}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {d.title ?? "—"}
                      {d.oppiaine && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{dict.subjectPrefix}{d.oppiaine}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.university ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-2">
                        {formatDate(d.defense_date, dateLocale) ?? "—"}
                        {d.defense_date === today && <TodayBadge label={dict.today} />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.opponent ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {d.paaluokka ? (fieldLabels[d.paaluokka] ?? d.paaluokka) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-700 underline underline-offset-4 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {dict.open}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              {dict.showing(
                (currentPage - 1) * PAGE_SIZE + 1,
                Math.min(currentPage * PAGE_SIZE, sorted.length),
                sorted.length
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-black/[.08] px-3 py-1.5 hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-black/[.08] disabled:hover:text-inherit dark:border-white/[.145] dark:hover:border-indigo-700 dark:hover:text-indigo-300 dark:disabled:hover:border-white/[.145]"
              >
                {dict.previous}
              </button>
              <span>{dict.page(currentPage, totalPages)}</span>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-black/[.08] px-3 py-1.5 hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-black/[.08] disabled:hover:text-inherit dark:border-white/[.145] dark:hover:border-indigo-700 dark:hover:text-indigo-300 dark:disabled:hover:border-white/[.145]"
              >
                {dict.next}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
