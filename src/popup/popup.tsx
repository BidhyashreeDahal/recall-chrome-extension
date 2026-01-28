import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 12, width: 280, fontFamily: "system-ui" }}>
      <h3 style={{ margin: 0 }}>Recall</h3>
      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
        Popup search comes in Week 2.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
