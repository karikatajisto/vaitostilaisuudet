export type Lang = "fi" | "en";

export const DEFAULT_LANG: Lang = "fi";

export function parseLang(value: string | string[] | undefined): Lang {
  return value === "en" ? "en" : "fi";
}

export interface Dictionary {
  kicker: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tabs: { tulevat: string; menneet: string };
  emptyMessage: { tulevat: string; menneet: string };
  filteredEmptyMessage: { tulevat: string; menneet: string };
  table: {
    searchPlaceholder: string;
    allUniversities: string;
    all: string;
    universitiesSelected: (count: number) => string;
    columns: {
      name: string;
      title: string;
      university: string;
      date: string;
      opponent: string;
      link: string;
    };
    open: string;
    opponentPrefix: string;
    today: string;
    showing: (from: number, to: number, total: number) => string;
    previous: string;
    next: string;
    page: (current: number, total: number) => string;
  };
  dateLocale: string;
  sortLocale: string;
}

export const DICTIONARIES: Record<Lang, Dictionary> = {
  fi: {
    kicker: "Suomalaiset yliopistot",
    title: "Väitöstilaisuudet",
    metaTitle: "Väitöstilaisuudet",
    metaDescription: "Suomalaisten yliopistojen tulevat ja pidetyt väitöstilaisuudet.",
    tabs: { tulevat: "Tulevat", menneet: "Menneet" },
    emptyMessage: {
      tulevat: "Ei tulevia väitöksiä näytettäväksi.",
      menneet: "Ei menneitä väitöksiä näytettäväksi.",
    },
    filteredEmptyMessage: {
      tulevat: "Ei hakuehtoja vastaavia tulevia väitöksiä.",
      menneet: "Ei hakuehtoja vastaavia menneitä väitöksiä.",
    },
    table: {
      searchPlaceholder: "Hae nimellä tai aiheella…",
      allUniversities: "Kaikki yliopistot",
      all: "Kaikki",
      universitiesSelected: (count) => `${count} yliopistoa valittu`,
      columns: {
        name: "Väittelijä",
        title: "Väitöksen aihe",
        university: "Yliopisto",
        date: "Päivämäärä",
        opponent: "Vastaväittäjä",
        link: "Linkki",
      },
      open: "Avaa",
      opponentPrefix: "Vastaväittäjä: ",
      today: "Tänään",
      showing: (from, to, total) => `Näytetään ${from}–${to} / ${total}`,
      previous: "Edellinen",
      next: "Seuraava",
      page: (current, total) => `Sivu ${current} / ${total}`,
    },
    dateLocale: "fi-FI",
    sortLocale: "fi",
  },
  en: {
    kicker: "Finnish universities",
    title: "Dissertation defences",
    metaTitle: "Dissertation defences",
    metaDescription: "Upcoming and past dissertation defences at Finnish universities.",
    tabs: { tulevat: "Upcoming", menneet: "Past" },
    emptyMessage: {
      tulevat: "No upcoming defences to show.",
      menneet: "No past defences to show.",
    },
    filteredEmptyMessage: {
      tulevat: "No upcoming defences match your search.",
      menneet: "No past defences match your search.",
    },
    table: {
      searchPlaceholder: "Search by name or topic…",
      allUniversities: "All universities",
      all: "All",
      universitiesSelected: (count) => `${count} universities selected`,
      columns: {
        name: "Candidate",
        title: "Dissertation topic",
        university: "University",
        date: "Date",
        opponent: "Opponent",
        link: "Link",
      },
      open: "Open",
      opponentPrefix: "Opponent: ",
      today: "Today",
      showing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
      previous: "Previous",
      next: "Next",
      page: (current, total) => `Page ${current} of ${total}`,
    },
    dateLocale: "en-GB",
    sortLocale: "en",
  },
};
