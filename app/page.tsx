import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { createSupabaseClient } from "@/app/lib/supabase/client";
import DissertationTable, {
  type DissertationRow,
} from "@/app/components/DissertationTable";
import { DEFAULT_LANG, DICTIONARIES, parseLang, type Dictionary, type Lang } from "@/app/lib/i18n";

type View = "tulevat" | "menneet";
type SearchParams = { [key: string]: string | string[] | undefined };

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "fi", label: "SUOMEKSI" },
  { code: "en", label: "ENGLISH" },
];

// Dates are stored as plain `date` columns (no time zone) representing
// Finnish defence events — compare against "today" in Europe/Helsinki
// rather than the server's UTC date so the tulevat/menneet split doesn't
// flip a few hours early/late around midnight.
function getTodayInHelsinki(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
}

// Builds a "/"-relative href from the current query string with the given
// overrides applied, dropping params back to their implicit defaults so the
// URL stays as clean as it was before language support was added.
function buildHref(params: SearchParams, overrides: Record<string, string>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    sp.set(key, Array.isArray(value) ? value[0] : value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    sp.set(key, value);
  }
  if (sp.get("view") === "tulevat") sp.delete("view");
  if (sp.get("lang") === DEFAULT_LANG) sp.delete("lang");
  const query = sp.toString();
  return query ? `/?${query}` : "/";
}

function Tabs({ active, lang, params, dict }: { active: View; lang: Lang; params: SearchParams; dict: Dictionary }) {
  return (
    <nav className="flex flex-nowrap gap-2 overflow-x-auto border-b border-black/[.08] dark:border-white/[.145]">
      {(["tulevat", "menneet"] as const).map((view) => (
        <Link
          key={view}
          href={buildHref(params, { view, lang })}
          className={
            "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
            (active === view
              ? "border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200")
          }
        >
          {dict.tabs[view]}
        </Link>
      ))}
    </nav>
  );
}

function LanguageSwitch({ active, view, params }: { active: Lang; view: View; params: SearchParams }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium tracking-wide">
      {LANGUAGES.map((language, index) => (
        <span key={language.code} className="flex items-center gap-2">
          {index > 0 && <span className="text-zinc-300 dark:text-zinc-700">/</span>}
          <Link
            href={buildHref(params, { view, lang: language.code })}
            className={
              active === language.code
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            {language.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const dict = DICTIONARIES[parseLang(params.lang)];
  return { title: dict.metaTitle, description: dict.metaDescription };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();
  const params = await searchParams;
  const view: View = params.view === "menneet" ? "menneet" : "tulevat";
  const lang = parseLang(params.lang);
  const dict = DICTIONARIES[lang];

  const supabase = createSupabaseClient();
  const today = getTodayInHelsinki();

  const baseQuery = supabase
    .from("dissertations")
    .select("id, name, title, university, defense_date, opponent, link");

  // Undated rows (rare backfilled records missing a confirmed date) are
  // grouped into menneet rather than dropped from both tabs — an upcoming
  // defence is essentially never announced without a date, so an unknown
  // date is far more likely a historical gap than a future one.
  const { data, error } =
    view === "tulevat"
      ? await baseQuery.gte("defense_date", today).order("defense_date", { ascending: true })
      : await baseQuery
          .or(`defense_date.lt.${today},defense_date.is.null`)
          .order("defense_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Väitösten haku epäonnistui: ${error.message}`);
  }

  const dissertations = (data ?? []) as DissertationRow[];

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-400" />
      <main className="flex w-full max-w-6xl flex-col gap-8 py-16 px-6 sm:px-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium tracking-wide text-indigo-700 uppercase dark:text-indigo-400">
              {dict.kicker}
            </p>
            <LanguageSwitch active={lang} view={view} params={params} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {dict.title}
          </h1>
          <Tabs active={view} lang={lang} params={params} dict={dict} />
        </div>

        <Suspense fallback={null}>
          {dissertations.length === 0 ? (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{dict.emptyMessage[view]}</p>
          ) : (
            <DissertationTable
              key={`${view}-${lang}`}
              dissertations={dissertations}
              defaultSortDirection={view === "tulevat" ? "asc" : "desc"}
              emptyMessage={dict.filteredEmptyMessage[view]}
              lang={lang}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}
