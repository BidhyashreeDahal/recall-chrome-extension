import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "../shared/supabase";

function App() {
  // User input for login
  const [email, setEmail] = useState("");
  // Small status message to guide the user
  const [status, setStatus] = useState<string | null>(null);
  // If logged in, we store their email here
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Prevent double-clicks while a request is running
  const [loading, setLoading] = useState(false);

  // Check login state on load + listen for auth changes
  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.session?.user?.email ?? null);
    });

    // Update UI when auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Send magic link login email
  const onSignIn = async () => {
    const value = email.trim();
    if (!value) {
      setStatus("Enter your email to sign in.");
      return;
    }

    setLoading(true);
    setStatus("Sending login link...");

    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        // This opens the extension popup after the user clicks the email link
        emailRedirectTo: chrome.runtime.getURL("popup.html")
      }
    });

    if (error) {
      setStatus("Sign-in failed. Try again.");
    } else {
      setStatus("Check your email for the login link.");
    }
    setLoading(false);
  };

  // Sign out
  const onSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setStatus("Signed out.");
    setLoading(false);
  };

  return (
    <div style={{ padding: 12, width: 320, fontFamily: "system-ui" }}>
      <h3 style={{ margin: 0 }}>ContextCue</h3>

      {/* Show sync status */}
      <p style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
        {userEmail
          ? "Sync is on for this account."
          : "Notes are saved locally. Sign in to sync."}
      </p>

      {/* Logged in UI */}
      {userEmail ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{userEmail}</div>
          <button
            style={{
              marginTop: 8,
              border: 0,
              borderRadius: 999,
              padding: "8px 10px",
              fontWeight: 800,
              cursor: "pointer",
              background: "#0a66c2",
              color: "#fff",
              width: "100%"
            }}
            onClick={onSignOut}
            disabled={loading}
          >
            Sign out
          </button>
        </div>
      ) : (
        // Logged out UI
        <div style={{ marginTop: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.2)",
              fontSize: 12
            }}
          />
          <button
            style={{
              marginTop: 8,
              border: 0,
              borderRadius: 999,
              padding: "8px 10px",
              fontWeight: 800,
              cursor: "pointer",
              background: "#0a66c2",
              color: "#fff",
              width: "100%"
            }}
            onClick={onSignIn}
            disabled={loading}
          >
            Send login link
          </button>
        </div>
      )}

      {/* Small helper text */}
      {status && (
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>
          {status}
        </div>
      )}
    </div>
  );
}

// Note: popup.html uses <div id="app">
createRoot(document.getElementById("app")!).render(<App />);