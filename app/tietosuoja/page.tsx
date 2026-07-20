import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tietosuoja – Väitöstilaisuudet",
  description: "Tietosuojaseloste: mitä tietoa sivusto kokoaa, mistä se on peräisin ja miten sen saa poistettua.",
};

export default function TietosuojaPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-400" />
      <main className="flex w-full max-w-3xl flex-col gap-8 py-16 px-6 sm:px-16">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Etusivulle
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Tietosuojaseloste
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">Päivitetty 20.7.2026</p>
        </div>

        <div className="flex flex-col gap-6 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            Väitöstilaisuudet on harrasteprojekti, joka kokoaa suomalaisten yliopistojen jo julkaisemat
            tiedot väitöstilaisuuksista yhteen löydettävään paikkaan.
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Mitä tietoa kerätään</h2>
            <p>
              Sivusto näyttää ainoastaan tietoja, jotka yliopistot ovat jo itse julkaisseet julkisesti:
              väittelijän nimi, väitöksen aihe, yliopisto, päivämäärä, vastaväittäjä sekä linkki
              alkuperäiseen lähteeseen.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Käyttötarkoitus</h2>
            <p>
              Tietoja kootaan yhteen paikkaan, jotta ne olisi helpompi löytää. Sivustolla ei ole
              kaupallista käyttöä.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Mistä tieto on peräisin</h2>
            <p>
              Tiedot haetaan yliopistojen julkisista RSS-syötteistä ja muista julkisista listauksista
              niiden omilla verkkosivuilla.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Oman nimen tai tietojen poistaminen
            </h2>
            <p>
              Jos haluat oman nimesi tai tietosi pois listalta, ota yhteyttä sähköpostitse osoitteeseen{" "}
              <a
                href="mailto:kari.m.katajisto@gmail.com"
                className="font-medium text-black underline underline-offset-4 dark:text-zinc-50"
              >
                kari.m.katajisto@gmail.com
              </a>
              . Pyyntö käsitellään kohtuullisessa ajassa.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Käyttäjän omat tiedot</h2>
            <p>
              Sivusto ei kerää eikä tallenna mitään sivuston käyttäjien omia henkilötietoja. Sivustolle ei
              voi kirjautua, eikä se käytä evästeitä käytön seurantaan.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
