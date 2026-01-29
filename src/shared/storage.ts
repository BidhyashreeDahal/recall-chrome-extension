import { contextNote } from "./types.ts";

export const saveNote = (note: contextNote): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [note.profileUrl]: note },
      () => resolve()
    );
  });
};

export const loadNote = (profileUrl: string): Promise<contextNote | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(profileUrl, (result) => {
      resolve(result[profileUrl] ?? null);
    });
  });
};
