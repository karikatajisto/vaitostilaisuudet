"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseEnumParam,
  parseListParam,
  parsePageParam,
  syncFilterParams,
} from "@/app/lib/url-filter-state";

export interface DissertationRow {
  id: number;
  name: string;
  title: string | null;
  university: string | null;
  defense_date: string | null;
  opponent: string | null;
  link: string;
}

type SortColumn = "name" | "title" | "university" | "defense_date" | "opponent";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;
const SORT_COLUMNS: SortColumn[] = ["name", "title", "university", "defense_date", "opponent"];
const DEFAULT_SORT_COLUMN: SortColumn = "defense_date";

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: "name", label: "Väittelijä" },
  { key: "title", label: "Väitöksen aihe" },
  { key: "university", label: "Yliopisto" },
  { key: "defense_date", label: "Päivämäärä" },
  { key: "opponent", label: "Vastaväittäjä" },
];

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function compareNullable(a: string | null, b: string | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b, "fi");
}

export default function DissertationTable({
  dissertations,
  defaultSortDirection = "desc",
  emptyMessage = "Ei hakuehtoja vastaavia väitöksiä.",
}: {
  dissertations: DissertationRow[];
  defaultSortDirection?: SortDirection;
  emptyMessage?: string;
}) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(() =>
    parseListParam(searchParams.get("uni"))
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

  const universities = useMemo(
    () =>
      Array.from(new Set(dissertations.map((d) => d.university).filter((u): u is string => Boolean(u)))).sort(
        (a, b) => a.localeCompare(b, "fi")
      ),
    [dissertations]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return dissertations.filter((d) => {
      const matchesSearch =
        query.length === 0 ||
        d.name.toLowerCase().includes(query) ||
        (d.title ?? "").toLowerCase().includes(query);
      const matchesUniversity =
        selectedUniversities.length === 0 ||
        (d.university !== null && selectedUniversities.includes(d.university));
      return matchesSearch && matchesUniversity;
    });
  }, [dissertations, search, selectedUniversities]);

  const sorted = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortColumn === "defense_date") {
        return direction * compareNullable(a.defense_date, b.defense_date);
      }
      return direction * compareNullable(a[sortColumn], b[sortColumn]);
    });
  }, [filtered, sortColumn, sortDirection]);

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

  function goToPage(next: number) {
    setPage(next);
    syncFilterParams({ page: next > 1 ? String(next) : null });
  }

  const universityLabel =
    selectedUniversities.length === 0
      ? "Kaikki yliopistot"
      : selectedUniversities.length === 1
        ? selectedUniversities[0]
        : `${selectedUniversities.length} yliopistoa valittu`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Hae nimellä tai aiheella…"
          className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 sm:max-w-xs"
        />

        <div ref={universityMenuRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsUniversityMenuOpen((open) => !open)}
            aria-expanded={isUniversityMenuOpen}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 sm:min-w-56"
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
                />
                Kaikki
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
                  />
                  {university}
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
                className="flex flex-col gap-2 rounded-2xl border border-black/[.08] bg-white p-4 text-sm dark:border-white/[.145] dark:bg-black"
              >
                <p className="font-medium text-black dark:text-zinc-50">{d.name}</p>
                <p className="text-zinc-700 dark:text-zinc-300">{d.title ?? "—"}</p>
                <p className="text-zinc-500 dark:text-zinc-500">
                  {d.university ?? "—"}
                  {formatDate(d.defense_date) ? ` · ${formatDate(d.defense_date)}` : ""}
                </p>
                {d.opponent && (
                  <p className="text-zinc-500 dark:text-zinc-500">Vastaväittäjä: {d.opponent}</p>
                )}
                <a
                  href={d.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
                >
                  Avaa
                </a>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.145] sm:block">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/[.08] bg-zinc-50 dark:border-white/[.145] dark:bg-zinc-950">
                  {COLUMNS.map((column) => (
                    <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold text-black dark:text-zinc-50">
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        {column.label}
                        {sortColumn === column.key && (
                          <span aria-hidden>{sortDirection === "asc" ? "▲" : "▼"}</span>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-black dark:text-zinc-50">
                    Linkki
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-black/[.08] bg-white last:border-b-0 dark:border-white/[.145] dark:bg-black"
                  >
                    <td className="px-4 py-3 font-medium text-black dark:text-zinc-50">{d.name}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.title ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.university ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {formatDate(d.defense_date) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{d.opponent ?? "—"}</td>
                    <td className="px-4 py-3">
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
                      >
                        Avaa
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Näytetään {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, sorted.length)} / {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-black/[.08] px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.145]"
              >
                Edellinen
              </button>
              <span>
                Sivu {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-black/[.08] px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.145]"
              >
                Seuraava
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
