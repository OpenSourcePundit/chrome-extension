import { useEffect, useMemo, useState } from "react";

function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  const m = Math.floor(d / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");

  async function refresh() {
    setLoading(true);
    const resp = await chrome.runtime.sendMessage({ type: "GET_HIGHLIGHTS" });
    if (resp?.ok) setItems(resp.data);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function del(id) {
    const resp = await chrome.runtime.sendMessage({
      type: "DELETE_HIGHLIGHT",
      payload: id,
    });
    if (resp?.ok) setItems(resp.data);
  }

  async function summarize() {
    setError(null);
    setSummary("");
    const resp = await chrome.runtime.sendMessage({
      type: "SUMMARIZE_HIGHLIGHTS",
      payload: { ids: [] },
    });
    if (!resp?.ok) {
      setError(resp?.error ?? "Failed to summarize");
      return;
    }
    setSummary(String(resp.data));
  }

  const headerRight = useMemo(
    () => (
      <>
        <button className="btn" onClick={refresh} title="Refresh">
          ↻
        </button>
        <a
          className="btn"
          href="../options/index.html"
          target="_blank"
          rel="noreferrer"
        >
          ⚙️
        </a>
      </>
    ),
    []
  );

  return (
    <div className="app">
      <div className="header">
        <div className="title">Highlights</div>
        {headerRight}
      </div>

      {loading ? (
        <div style={{ padding: 12 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 12 }}>
          No highlights yet. Select text on any page to save.
        </div>
      ) : (
        <div className="list">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <div className="text">“{item.text}”</div>
              <div className="row">
                <a
                  className="meta"
                  href={item.url}
                  title={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {new URL(item.url).hostname}
                </a>
                <div className="meta">{timeAgo(item.createdAt)}</div>
              </div>
              {item.context && (
                <div className="meta" style={{ marginTop: 6 }}>
                  …{item.context}…
                </div>
              )}
              <div className="row" style={{ marginTop: 8 }}>
                <div className="meta" title={item.title}>
                  {item.title}
                </div>
                <button className="btn" onClick={() => del(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        <button className="btn primary" onClick={summarize}>
          Summarize (AI)
        </button>
        {error && (
          <div className="small" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}
        {summary && <div className="codebox">{summary}</div>}
        <div className="small">
          Tip: set your OpenAI API key in Options (⚙️).
        </div>
      </div>
    </div>
  );
}
