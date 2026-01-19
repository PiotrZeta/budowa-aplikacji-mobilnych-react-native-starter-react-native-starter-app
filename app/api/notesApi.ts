import type { Note } from "../state/notesStore";

// Prosty publiczny API do demonstracji komunikacji (GET/POST)
const API_BASE = "https://jsonplaceholder.typicode.com";

type JsonPlaceholderPost = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export async function fetchSeedNotes(): Promise<Note[]> {
  const res = await fetch(`${API_BASE}/posts`);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = (await res.json()) as JsonPlaceholderPost[];

  // Bierzemy kilka rekordów jako "start".
  // Dodajemy datę, żeby lista wyglądała jak realna.
  return data.slice(0, 12).map((p, idx) => {
    const daysAgo = idx;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: String(p.id),
      title: p.title,
      description: p.body,
      createdAt,
      synced: true,
    } satisfies Note;
  });
}

export async function createNoteOnApi(note: Pick<Note, "title" | "description">) {
  // JSONPlaceholder zawsze zwraca sukces (symulacja) – idealne do demo.
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: note.title, body: note.description, userId: 1 }),
  });
  if (!res.ok) throw new Error("Failed to create");
  return (await res.json()) as { id: number };
}

export async function updateNoteOnApi(note: Pick<Note, "id" | "title" | "description">) {
  const res = await fetch(`${API_BASE}/posts/${note.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: note.title, body: note.description }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return (await res.json()) as { id: number };
}
