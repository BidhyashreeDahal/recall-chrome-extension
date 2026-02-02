# ContextCue — LinkedIn Context Notes

ContextCue helps you save and recall private notes about LinkedIn profiles.
Add a quick note on a profile, then manage all notes from the extension popup.

## What it does

- Save notes per LinkedIn profile
- View notes later on the same profile
- Search and filter notes in the popup
- Backup/restore notes as a JSON file
- Optional sync across devices via Supabase login

## How it works

- **On LinkedIn:** you see an “Add note / View note” pill on profile pages.
- **In the extension popup:** you can search, filter, export, and import notes.

## Local vs Sync

By default, notes are stored locally in your browser.
If you sign in, notes sync to Supabase so they follow you across devices.

## Dev setup

1) Install dependencies:
```
npm install
```

2) Create `.env` in the project root:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3) Build:
```
npm run build
```

4) Load in Edge/Chrome:
- Go to `chrome://extensions` (or `edge://extensions`)
- Enable Developer Mode
- Load unpacked → select the `dist` folder

## Notes

- This extension only works in desktop browsers.
- No notes leave your device unless you sign in to sync.