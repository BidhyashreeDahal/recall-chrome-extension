import { contextNote } from "./types";
import { supabase } from "./supabase";

const saveNoteLocal = (note: contextNote): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [note.profileUrl]: note }, () => resolve());
  });
};

const loadNoteLocal = (profileUrl: string): Promise<contextNote | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(profileUrl, (result) => {
      resolve(result[profileUrl] ?? null);
    });
  });
};

const getUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user?.id ?? null;
};

const toRow = (note: contextNote, userId: string) => ({
  user_id: userId,
  profile_url: note.profileUrl,
  met_at: note.metAt ?? null,
  tags: note.tags ?? [],
  note: note.note,
  created_at: new Date(note.createdAt).toISOString(),
  updated_at: new Date(note.updatedAt).toISOString()
});

const toNote = (row: {
  profile_url: string;
  met_at: string | null;
  tags: string[] | null;
  note: string;
  created_at: string;
  updated_at: string;
}): contextNote => ({
  profileUrl: row.profile_url,
  metAt: row.met_at ?? undefined,
  tags: row.tags ?? [],
  note: row.note,
  createdAt: Date.parse(row.created_at),
  updatedAt: Date.parse(row.updated_at)
});

export const saveNote = async (note: contextNote): Promise<void> => {
  const userId = await getUserId();
  if (!userId) {
    await saveNoteLocal(note);
    return;
  }

  const { error } = await supabase
    .from("notes")
    .upsert(toRow(note, userId), {
      onConflict: "user_id,profile_url"
    });

  if (error) {
    await saveNoteLocal(note);
  }
};

export const loadNote = (profileUrl: string): Promise<contextNote | null> => {
  return (async () => {
    const userId = await getUserId();
    if (!userId) return loadNoteLocal(profileUrl);

    const { data, error } = await supabase
      .from("notes")
      .select("profile_url, met_at, tags, note, created_at, updated_at")
      .eq("user_id", userId)
      .eq("profile_url", profileUrl)
      .maybeSingle();

    if (error || !data) return loadNoteLocal(profileUrl);
    return toNote(data);
  })();
};
