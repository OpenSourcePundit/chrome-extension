import { useEffect, useState } from "react";
import { getApiKey, setApiKey } from "../shared/storage";

export default function Options() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const k = await getApiKey();
      if (k) setKey(k);
    })();
  }, []);

  async function save() {
    await setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div
      style={{
        font: "14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: 16,
      }}
    >
      <h2>Website Highlight Saver — Options</h2>
      <p>
        Store your <strong>OpenAI API Key</strong> for the Summarize feature.
        Your key is saved in <code>chrome.storage.sync</code>.
      </p>
      <label>
        API Key
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          style={{
            width: "100%",
            padding: 8,
            marginTop: 6,
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
      </label>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={save}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: "#111827",
            color: "#f9fafb",
          }}
        >
          Save
        </button>
        {saved && <span style={{ color: "#059669" }}>Saved ✓</span>}
      </div>
    </div>
  );
}
