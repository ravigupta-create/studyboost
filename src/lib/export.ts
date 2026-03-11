export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToAnki(cards: { front: string; back: string }[]): string {
  return cards.map(c => `${c.front}\t${c.back}`).join('\n');
}

export function exportToCSV(headers: string[], rows: string[][]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

export function shareViaURL(data: unknown): string {
  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded;
}

export function loadFromURL(encoded: string): unknown {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
