import React from "react";
import { createRoot } from "react-dom/client";

function mount() {
  // Only on profile pages
  if (!location.pathname.startsWith("/in/")) return;

  // Prevent duplicates (LinkedIn SPA)
  if (document.getElementById("recall-root")) return;

  const rootEl = document.createElement("div");
  rootEl.id = "recall-root";
  rootEl.style.position = "fixed";
  rootEl.style.top = "120px";
  rootEl.style.right = "20px";
  rootEl.style.zIndex = "2147483647";

  document.body.appendChild(rootEl);

  createRoot(rootEl).render(
    <button
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        border: "0",
        cursor: "pointer"
      }}
      className="recall-trigger"
    >
      Recall
    </button>
  );
}

// Run after page is ready
window.addEventListener("load", mount);

// LinkedIn SPA navigation support
const obs = new MutationObserver(() => mount());
obs.observe(document.documentElement, { subtree: true, childList: true });
