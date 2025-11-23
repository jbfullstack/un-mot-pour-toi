export function todayFranceDateString() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now); // "YYYY-MM-DD"
}
