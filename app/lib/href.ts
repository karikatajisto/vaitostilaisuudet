export type SearchParams = { [key: string]: string | string[] | undefined };

// Builds a "/"-relative href from the current query string with the given
// overrides applied, dropping params back to their defaults so the URL
// stays as clean as before the override was applied.
export function buildHref(
  params: SearchParams,
  overrides: Record<string, string>,
  defaults: Record<string, string>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    sp.set(key, Array.isArray(value) ? value[0] : value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    sp.set(key, value);
  }
  for (const [key, value] of Object.entries(defaults)) {
    if (sp.get(key) === value) sp.delete(key);
  }
  const query = sp.toString();
  return query ? `/?${query}` : "/";
}
