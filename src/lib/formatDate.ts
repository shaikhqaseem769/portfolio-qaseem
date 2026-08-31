/**
 * Formats an ISO date string (YYYY-MM or YYYY-MM-DD) into a human-readable
 * short month + year string, e.g. "Jan 2023".
 *
 * Returns the literal string "Present" unchanged.
 */
export function formatDate(dateStr: string): string {
  if (dateStr === 'Present') {
    return 'Present';
  }

  // Parse as a UTC date to avoid timezone-related day-shift issues.
  // Appending "-01" ensures "YYYY-MM" strings parse correctly as a full date.
  const normalized = dateStr.length === 7 ? `${dateStr}-01` : dateStr;
  const date = new Date(`${normalized}T00:00:00Z`);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
