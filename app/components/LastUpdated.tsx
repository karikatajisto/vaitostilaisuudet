export default function LastUpdated({
  value,
  label,
  dateLocale,
}: {
  value: string;
  label: string;
  dateLocale: string;
}) {
  const formatted = new Date(value).toLocaleString(dateLocale, {
    timeZone: "Europe/Helsinki",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <p className="shrink-0 self-start text-xs text-zinc-400 dark:text-zinc-500">
      {label} {formatted}
    </p>
  );
}
