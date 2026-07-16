import { Suspense } from "react";
import { connection } from "next/server";
import { createSupabaseClient } from "@/app/lib/supabase/client";
import DissertationTable, {
  type DissertationRow,
} from "@/app/components/DissertationTable";

export default async function Home() {
  await connection();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("dissertations")
    .select("id, name, title, university, defense_date, opponent, link")
    .order("defense_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Väitösten haku epäonnistui: ${error.message}`);
  }

  const dissertations = (data ?? []) as DissertationRow[];

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-6xl flex-col gap-8 py-16 px-6 sm:px-16">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Väitöstilaisuudet
        </h1>

        <Suspense fallback={null}>
          {dissertations.length === 0 ? (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Ei väitöksiä näytettäväksi.
            </p>
          ) : (
            <DissertationTable dissertations={dissertations} />
          )}
        </Suspense>
      </main>
    </div>
  );
}
