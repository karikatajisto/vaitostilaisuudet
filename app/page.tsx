import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createSupabaseClient } from "@/app/lib/supabase/client";
import DissertationTable, {
  type DissertationRow,
} from "@/app/components/DissertationTable";

type View = "tulevat" | "menneet";

const TABS: { view: View; label: string }[] = [
  { view: "tulevat", label: "Tulevat" },
  { view: "menneet", label: "Menneet" },
];

const EMPTY_MESSAGE_BY_VIEW: Record<View, string> = {
  tulevat: "Ei tulevia väitöksiä näytettäväksi.",
  menneet: "Ei menneitä väitöksiä näytettäväksi.",
};

const FILTERED_EMPTY_MESSAGE_BY_VIEW: Record<View, string> = {
  tulevat: "Ei hakuehtoja vastaavia tulevia väitöksiä.",
  menneet: "Ei hakuehtoja vastaavia menneitä väitöksiä.",
};

// Dates are stored as plain `date` columns (no time zone) representing
// Finnish defence events — compare against "today" in Europe/Helsinki
// rather than the server's UTC date so the tulevat/menneet split doesn't
// flip a few hours early/late around midnight.
function getTodayInHelsinki(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
}

function Tabs({ active }: { active: View }) {
  return (
    <nav className="flex flex-nowrap gap-2 overflow-x-auto border-b border-black/[.08] dark:border-white/[.145]">
      {TABS.map((tab) => (
        <Link
          key={tab.view}
          href={tab.view === "tulevat" ? "/" : `/?view=${tab.view}`}
          className={
            "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium " +
            (active === tab.view
              ? "border-black text-black dark:border-zinc-50 dark:text-zinc-50"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200")
          }
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const params = await searchParams;
  const view: View = params.view === "menneet" ? "menneet" : "tulevat";

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
      <main className="flex w-full max-w-6xl flex-col gap-8 py-16 px-6 sm:px-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Väitöstilaisuudet
          </h1>
          <Tabs active={view} />
        </div>

        <Suspense fallback={null}>
          {dissertations.length === 0 ? (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{EMPTY_MESSAGE_BY_VIEW[view]}</p>
          ) : (
            <DissertationTable
              key={view}
              dissertations={dissertations}
              defaultSortDirection={view === "tulevat" ? "asc" : "desc"}
              emptyMessage={FILTERED_EMPTY_MESSAGE_BY_VIEW[view]}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}
