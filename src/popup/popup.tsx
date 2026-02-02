import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "../shared/supabase";
import { contextNote } from "../shared/types";
import { deleteNote, exportNotes, importNotes, listNotes } from "../shared/storage";

function displayNameFromUrl(url: string) {
  try {
    const u = new URL(url, "https://www.linkedin.com");
    const parts = u.pathname.split("/").filter(Boolean);
    const slug = parts[1] || parts[0] || url;
    return slug.replace(/-/g, " ");
  } catch {
    return url;
  }
}

function profileLink(profileUrl: string) {
  try {
    const u = new URL(profileUrl, "https://www.linkedin.com");
    return u.toString();
  } catch {
    return `https://www.linkedin.com${profileUrl}`;
  }
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState<contextNote[]>([]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Auth state
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.session?.user?.email ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
        refresh();
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load notes
  const refresh = async () => {
    const all = await listNotes();
    // newest first
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(all);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Filtered notes
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      const matchTag = tagFilter ? n.tags.includes(tagFilter) : true;
      const haystack =
        `${n.profileUrl} ${displayNameFromUrl(n.profileUrl)} ${n.tags.join(" ")} ${n.note} ${n.metAt ?? ""}`.toLowerCase();
      const matchText = q ? haystack.includes(q) : true;
      return matchTag && matchText;
    });
  }, [notes, query, tagFilter]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  // Auth actions
  const onSignIn = async () => {
    const value = email.trim();
    if (!value || !password) {
      setStatus("Enter email and password.");
      return;
    }

    setLoading(true);
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({
      email: value,
      password
    });

    if (error) {
      setStatus("Sign-in failed. Check your email or password.");
    } else {
      setStatus("Signed in.");
    }
    setLoading(false);
  };

  const onSignUp = async () => {
    const value = email.trim();
    if (!value || !password) {
      setStatus("Enter email and password.");
      return;
    }

    setLoading(true);
    setStatus("Creating account...");
    const { error } = await supabase.auth.signUp({
      email: value,
      password
    });

    if (error) {
      setStatus("Sign-up failed. Try a different email.");
    } else {
      setStatus("Account created. Check your email to confirm.");
    }
    setLoading(false);
  };

  const onSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setStatus("Signed out.");
    setLoading(false);
  };

  // Export
  const onExport = async () => {
    const data = await exportNotes();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contextcue-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import
  const onImportFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (!Array.isArray(json)) throw new Error("Invalid format");
      await importNotes(json as contextNote[]);
      setStatus("Import complete.");
      refresh();
    } catch {
      setStatus("Import failed. Invalid JSON.");
    }
  };

  const onDelete = async (profileUrl: string) => {
    const ok = confirm("Delete this note?");
    if (!ok) return;
    await deleteNote(profileUrl);
    refresh();
  };

  return (
    <div className="app">
      <div className="top">
        <div className="title">ContextCue</div>
        <div className="actions">
          <button className="btn ghost" onClick={onExport}>
            Backup
          </button>
        </div>
      </div>

      <div className="status">
        {userEmail
          ? "Sync is on for this account."
          : "Saved on this device. Sign in to sync across devices."}
      </div>

      <div className="auth">
        {userEmail ? (
          <div className="auth-logged">
            <div className="email">Signed in as {userEmail}</div>
            <button
              className="btn full"
              onClick={onSignOut}
              disabled={loading}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="auth-logged">
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for sync"
            />
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              type="password"
            />
            <div className="auth-row">
              <button className="btn full" onClick={onSignIn} disabled={loading}>
                Sign in
              </button>
              <button
                className="btn ghost full"
                onClick={onSignUp}
                disabled={loading}
              >
                Create account
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="search-wrap">
        <input
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, tags, notes…"
        />
      </div>

      <div className="tags">
        <button
          className={`chip ${tagFilter === null ? "active" : ""}`}
          onClick={() => setTagFilter(null)}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className={`chip ${tagFilter === t ? "active" : ""}`}
            onClick={() => setTagFilter(tagFilter === t ? null : t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="list">
        {filtered.length === 0 ? (
          <div className="empty">No notes yet. Save one from a profile.</div>
        ) : (
          filtered.map((n) => (
            <div key={n.profileUrl} className="card">
              <div className="card-head">
                <div className="name">{displayNameFromUrl(n.profileUrl)}</div>
                <div className="card-actions">
                  <a
                    className="link"
                    href={profileLink(n.profileUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                  <button
                    className="link danger"
                    onClick={() => onDelete(n.profileUrl)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="meta">{n.profileUrl}</div>
              <div className="note">{n.note || "—"}</div>
            </div>
          ))
        )}
      </div>

      <div className="import">
        <label className="file">
          Restore backup
          <input
            type="file"
            accept="application/json"
            onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {status && <div className="msg">{status}</div>}
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<App />);