// Tiny demo-only store: queued productions survive navigation within the
// session so "Start production" / "Make now" show up in the workspace list.

export interface QueuedProduction {
  domainId: string;
  title: string;
  note?: string;
}

const KEY = "fbs-queued-productions";

export function getQueued(): QueuedProduction[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addQueued(item: QueuedProduction) {
  const list = getQueued();
  list.unshift(item);
  sessionStorage.setItem(KEY, JSON.stringify(list));
}
