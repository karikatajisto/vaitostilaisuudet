export type Lang = "fi" | "sv" | "en";

export const DEFAULT_LANG: Lang = "fi";

export const LANGUAGE_OPTIONS: { code: Lang; label: string }[] = [
  { code: "fi", label: "Suomeksi" },
  { code: "sv", label: "Ruotsiksi" },
  { code: "en", label: "Englanniksi" },
];

export function parseLang(value: string | string[] | undefined): Lang {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "sv" ? "sv" : raw === "en" ? "en" : "fi";
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
    allFields: string;
    fieldsSelected: (count: number) => string;
    timeRange: {
      all: string;
      next7: string;
      next30: string;
    };
    columns: {
      name: string;
      title: string;
      university: string;
      date: string;
      opponent: string;
      tieteenala: string;
      link: string;
    };
    open: string;
    opponentPrefix: string;
    subjectPrefix: string;
    today: string;
    showing: (from: number, to: number, total: number) => string;
    previous: string;
    next: string;
    page: (current: number, total: number) => string;
  };
  dateLocale: string;
  sortLocale: string;
  lastUpdatedLabel: string;
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
      allFields: "Kaikki tieteenalat",
      fieldsSelected: (count) => `${count} tieteenalaa valittu`,
      timeRange: {
        all: "Kaikki tulevat",
        next7: "Seuraavat 7 päivää",
        next30: "Seuraavat 30 päivää",
      },
      columns: {
        name: "Väittelijä",
        title: "Väitöksen aihe",
        university: "Yliopisto",
        date: "Päivämäärä",
        opponent: "Vastaväittäjä",
        tieteenala: "Tieteenala",
        link: "Linkki",
      },
      open: "Avaa",
      opponentPrefix: "Vastaväittäjä: ",
      subjectPrefix: "Oppiaine: ",
      today: "Tänään",
      showing: (from, to, total) => `Näytetään ${from}–${to} / ${total}`,
      previous: "Edellinen",
      next: "Seuraava",
      page: (current, total) => `Sivu ${current} / ${total}`,
    },
    dateLocale: "fi-FI",
    sortLocale: "fi",
    lastUpdatedLabel: "Sivusto päivitetty",
  },
  sv: {
    kicker: "Finländska universitet",
    title: "Disputationer",
    metaTitle: "Disputationer",
    metaDescription: "Kommande och tidigare disputationer vid finländska universitet.",
    tabs: { tulevat: "Kommande", menneet: "Tidigare" },
    emptyMessage: {
      tulevat: "Inga kommande disputationer att visa.",
      menneet: "Inga tidigare disputationer att visa.",
    },
    filteredEmptyMessage: {
      tulevat: "Inga kommande disputationer matchar sökningen.",
      menneet: "Inga tidigare disputationer matchar sökningen.",
    },
    table: {
      searchPlaceholder: "Sök efter namn eller ämne…",
      allUniversities: "Alla universitet",
      all: "Alla",
      universitiesSelected: (count) => `${count} universitet valda`,
      allFields: "Alla vetenskapsområden",
      fieldsSelected: (count) => `${count} vetenskapsområden valda`,
      timeRange: {
        all: "Alla kommande",
        next7: "Nästa 7 dagar",
        next30: "Nästa 30 dagar",
      },
      columns: {
        name: "Doktorand",
        title: "Avhandlingens ämne",
        university: "Universitet",
        date: "Datum",
        opponent: "Opponent",
        tieteenala: "Vetenskapsområde",
        link: "Länk",
      },
      open: "Öppna",
      opponentPrefix: "Opponent: ",
      subjectPrefix: "Ämne: ",
      today: "Idag",
      showing: (from, to, total) => `Visar ${from}–${to} av ${total}`,
      previous: "Föregående",
      next: "Nästa",
      page: (current, total) => `Sida ${current} av ${total}`,
    },
    dateLocale: "sv-SE",
    sortLocale: "sv",
    lastUpdatedLabel: "Webbplatsen uppdaterad",
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
      allFields: "All fields of science",
      fieldsSelected: (count) => `${count} fields selected`,
      timeRange: {
        all: "All upcoming",
        next7: "Next 7 days",
        next30: "Next 30 days",
      },
      columns: {
        name: "Candidate",
        title: "Dissertation topic",
        university: "University",
        date: "Date",
        opponent: "Opponent",
        tieteenala: "Field of science",
        link: "Link",
      },
      open: "Open",
      opponentPrefix: "Opponent: ",
      subjectPrefix: "Subject: ",
      today: "Today",
      showing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
      previous: "Previous",
      next: "Next",
      page: (current, total) => `Page ${current} of ${total}`,
    },
    dateLocale: "en-GB",
    sortLocale: "en",
    lastUpdatedLabel: "Site updated",
  },
};

// dissertations.paaluokka always stores the Finnish canonical name (that's
// what the classifier in the vaitokset repo writes) — this translates it
// for display without touching the stored value. Fixed order for the
// filter boxes, not derived from data, since these six are the only
// possible values regardless of what's currently loaded.
export const PAALUOKKA_ORDER = [
  "Luonnontieteet",
  "Tekniikka",
  "Lääke- ja terveystieteet",
  "Maatalous- ja metsätieteet",
  "Yhteiskuntatieteet",
  "Humanistiset tieteet",
] as const;

export const FIELD_LABELS: Record<Lang, Record<string, string>> = {
  fi: {
    Luonnontieteet: "Luonnontieteet",
    Tekniikka: "Tekniikka",
    "Lääke- ja terveystieteet": "Lääke- ja terveystieteet",
    "Maatalous- ja metsätieteet": "Maatalous- ja metsätieteet",
    Yhteiskuntatieteet: "Yhteiskuntatieteet",
    "Humanistiset tieteet": "Humanistiset tieteet",
  },
  sv: {
    Luonnontieteet: "Naturvetenskaper",
    Tekniikka: "Teknik",
    "Lääke- ja terveystieteet": "Medicin och hälsovetenskaper",
    "Maatalous- ja metsätieteet": "Lantbruks- och skogsvetenskaper",
    Yhteiskuntatieteet: "Samhällsvetenskaper",
    "Humanistiset tieteet": "Humaniora",
  },
  en: {
    Luonnontieteet: "Natural sciences",
    Tekniikka: "Engineering and technology",
    "Lääke- ja terveystieteet": "Medical and health sciences",
    "Maatalous- ja metsätieteet": "Agricultural and forestry sciences",
    Yhteiskuntatieteet: "Social sciences",
    "Humanistiset tieteet": "Humanities",
  },
};
