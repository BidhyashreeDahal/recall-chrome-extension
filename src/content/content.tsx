import { createRoot } from "react-dom/client";
import { loadNote, saveNote } from "../shared/storage";
import type { contextNote } from "../shared/types";

type Mode = "hidden" | "capture" | "recall";

function getProfileUrlKey() {
  // Stable enough for MVP: profile URL path
  return location.pathname.replace(/\/$/, "");
}

function isProfilePage() {
  return location.pathname.startsWith("/in/");
}


function mount() {
  if (!isProfilePage()) return;

  // Avoid duplicate mounts (SPA)
  if (document.getElementById("recall-root")) return;

  const rootEl = document.createElement("div");
  rootEl.id = "recall-root";
  rootEl.style.position = "fixed";
  rootEl.style.top = "120px";
  rootEl.style.right = "20px";
  rootEl.style.zIndex = "2147483647";
  document.body.appendChild(rootEl);

  createRoot(rootEl).render(<RecallWidget />);
}

function RecallWidget() {
  const profileUrl = getProfileUrlKey();

  // Local UI state (simple)
  let mode: Mode = "hidden";
  let existingNote: contextNote | null = null;

  // Create DOM UI container (no React state to keep content script super stable)
  const container = document.createElement("div");
  container.className = "recall-container";

  const pill = document.createElement("button");
  pill.className = "recall-pill";
  pill.textContent = "Add note";
  pill.style.display = "block";
  pill.onclick = async () => {
    if (!isProfilePage()) return;

    // If note exists -> show recall mode
    const note = await loadNote(profileUrl);
    if (note) {
      existingNote = note;
      showRecall(note);
    } else {
      showCapture();
    }
  };

  const panel = document.createElement("div");
  panel.className = "recall-panel";
  panel.style.display = "none";

  container.appendChild(pill);
  container.appendChild(panel);

  // Attach once
  setTimeout(() => {
    const root = document.getElementById("recall-root");
    if (root && root.childElementCount === 0) root.appendChild(container);
  }, 0);

  // --- UI render helpers ---
  function hidePanel() {
    mode = "hidden";
    panel.style.display = "none";
  }

  function showCapture(prefill?: Partial<contextNote>) {
    mode = "capture";
    panel.style.display = "block";
    panel.classList.remove("recall-mode");
    panel.classList.add("capture-mode");

    const metAt = prefill?.metAt ?? "";
    const tags = (prefill?.tags ?? []).join(", ");
    const note = prefill?.note ?? "";

    panel.innerHTML = `
      <div class="recall-header">
        <div class="recall-title">Add a note</div>
        <button class="recall-x" aria-label="Close">×</button>
      </div>

      <div class="recall-sub">Save context for future-you ✨</div>

      <label class="recall-label">Met at</label>
      <input class="recall-input" id="recall-metat" placeholder="e.g. TorontoJS Meetup" value="${escapeHtml(metAt)}" />

      <label class="recall-label">Tags</label>
      <input class="recall-input" id="recall-tags" placeholder="e.g. recruiter, conference" value="${escapeHtml(tags)}" />

      <label class="recall-label">Note</label>
      <textarea class="recall-textarea" id="recall-note" placeholder="What did you talk about?">${escapeHtml(note)}</textarea>

      <button class="recall-primary" id="recall-save">Save note</button>
    `;

    const closeBtn = panel.querySelector(".recall-x") as HTMLButtonElement;
    closeBtn.onclick = hidePanel;

    const saveBtn = panel.querySelector("#recall-save") as HTMLButtonElement;
    saveBtn.onclick = async () => {
      const metAtEl = panel.querySelector("#recall-metat") as HTMLInputElement;
      const tagsEl = panel.querySelector("#recall-tags") as HTMLInputElement;
      const noteEl = panel.querySelector("#recall-note") as HTMLTextAreaElement;

      const now = Date.now();
      const toSave: contextNote = {
        profileUrl,
        metAt: metAtEl.value.trim() || undefined,
        tags: tagsEl.value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        note: noteEl.value.trim(),
        createdAt: existingNote?.createdAt ?? now,
        updatedAt: now
      };

      await saveNote(toSave);
      existingNote = toSave;

      // Requirement: disappear completely after save
      hidePanel();

      // But keep a subtle “View note” entry point
      pill.textContent = "View note";
      pill.classList.add("has-note");
      pill.style.display = "block";
    };
  }

  function showRecall(note: contextNote) {
    mode = "recall";
    panel.style.display = "block";
    panel.classList.remove("capture-mode");
    panel.classList.add("recall-mode");

    panel.innerHTML = `
      <div class="recall-header">
        <div class="recall-title">Note</div>
        <button class="recall-x" aria-label="Close">×</button>
      </div>

      <div class="recall-card">
        <div class="recall-row">
          <span class="recall-k">Met at</span>
          <span class="recall-v">${note.metAt ? escapeHtml(note.metAt) : "—"}</span>
        </div>
        <div class="recall-row">
          <span class="recall-k">Tags</span>
          <span class="recall-v">${note.tags?.length ? note.tags.map(tagChip).join("") : "—"}</span>
        </div>
        <div class="recall-note">${note.note ? escapeHtml(note.note) : "—"}</div>
      </div>

      <div class="recall-actions">
        <button class="recall-secondary" id="recall-edit">Edit note</button>
        <button class="recall-primary" id="recall-close">Close</button>
      </div>
    `;

    const closeBtn = panel.querySelector(".recall-x") as HTMLButtonElement;
    closeBtn.onclick = hidePanel;

    const doneBtn = panel.querySelector("#recall-close") as HTMLButtonElement;
    doneBtn.onclick = hidePanel;

    const editBtn = panel.querySelector("#recall-edit") as HTMLButtonElement;
    editBtn.onclick = () => showCapture(note);
  }

  function tagChip(t: string) {
    return `<span class="recall-chip">${escapeHtml(t)}</span>`;
  }

  function escapeHtml(str: string) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // --- Startup: load existing note & hook Connect ---
  (async () => {
    // Load note for this profile
    const note = await loadNote(profileUrl);
    if (note) {
      existingNote = note;
      pill.textContent = "View note";
      pill.classList.add("has-note");
    } else {
      pill.textContent = "Add note";
      pill.classList.remove("has-note");
    }
  })();

  // Return null because we’re injecting real DOM ourselves
  return null as any;
}

// Mount immediately if possible, otherwise on load
if (document.readyState === "complete" || document.readyState === "interactive") {
  mount();
} else {
  window.addEventListener("load", mount);
}

let lastHref = location.href;
setInterval(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;

    // Remove old mount on navigation
    const old = document.getElementById("recall-root");
    if (old) old.remove();

    // Remount on new profile pages
    if (isProfilePage()) mount();
  }
}, 700);
