export function toLocaleTime(time: string): string {
  const date = new Date(time);
  const timeString = date.toLocaleTimeString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${timeString}.${ms}`;
}
