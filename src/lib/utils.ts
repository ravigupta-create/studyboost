export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
