import { ContextNote } from "./types";

export const saveNote = (note: ContextNote): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [note.profileUrl]: note },
      () => resolve()
    );
  });
};

export const loadNote = (profileUrl: string): Promise<ContextNote | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(profileUrl, (result) => {
      resolve(result[profileUrl] ?? null);
    });
  });
};
