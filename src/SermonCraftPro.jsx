import React, { useEffect, useMemo, useRef, useState } from "react";

function safeJSON(raw, fallback = []) {
  try {
    if (!raw) return fallback;
    const text = String(raw).trim();
    const startBracket = text.indexOf("[");
    const startBrace = text.indexOf("{");
    const start =
      startBracket === -1
        ? startBrace
        : startBrace === -1
        ? startBracket
        : Math.min(startBracket, startBrace);

    const endBracket = text.lastIndexOf("]");
    const endBrace = text.lastIndexOf("}");
    const end = Math.max(endBracket, endBrace);

    if (start === -1 || end === -1 || end < start) return fallback;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return fallback;
  }
}

async function callClaude(promptOrOptions, systemPrompt = "", useWeb = false) {
  let prompt = "";
  let mode = useWeb ? "deep" : "fast";

  if (typeof promptOrOptions === "string") {
    prompt = promptOrOptions;
  } else if (promptOrOptions && typeof promptOrOptions === "object") {
    if (Array.isArray(promptOrOptions.messages)) {
      prompt = promptOrOptions.messages
        .map((m) =>
          typeof m === "string"
            ? m
            : `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content || m.text || ""}`
        )
        .join("\n\n");
    } else {
      prompt = promptOrOptions.prompt || "";
    }

    systemPrompt = promptOrOptions.system || systemPrompt || "";
    mode = promptOrOptions.tools && promptOrOptions.tools.length ? "deep" : mode;
  }

  const response = await fetch("/api/sermon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      sys: systemPrompt || "You are a powerful sermon-generating assistant.",
      mode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

async function callClaudeJSON(prompt, systemPrompt = "", useWeb = false) {
  const response = await fetch("/api/forge-json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      sys: systemPrompt || "You are a powerful AI assistant.",
      mode: useWeb ? "deep" : "fast",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  const data = await response.json();
  return data.result || "";
}

function Shell({ title, subtitle, right, children }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          border: "1px solid #2d2d2d",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          background: "#111",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: 6, color: "#b8b8b8", lineHeight: 1.5 }}>{subtitle}</div>
            ) : null}
          </div>
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

function Panel({ title, actions, children }) {
  return (
    <div
      style={{
        border: "1px solid #2d2d2d",
        borderRadius: 16,
        padding: 18,
        background: "#111",
        marginBottom: 16,
      }}
    >
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

function SermonGenerator() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("fast");
  const [loading, setLoading] = useState(false);
  const [sermon, setSermon] = useState("");
  const [error, setError] = useState("");

  async function generateSermon() {
    try {
      setLoading(true);
      setError("");
      setSermon("");

      const response = await fetch("/api/sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          sys: "You are a powerful sermon-generating assistant. Write clearly, biblically, with strong structure and practical application.",
          mode,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        result += decoder.decode(value, { stream: true });
        setSermon(result);
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="Sermon Generator"
      subtitle="Streaming sermon generation using your live Vercel endpoint. Fast mode is cheaper and quicker. Deep mode is richer and slower."
    >
      <Panel title="Prompt">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Write a deep sermon on shalom with strong theological insight, practical application, and a powerful conclusion."
          style={{
            width: "100%",
            minHeight: 160,
            background: "#0b0b0b",
            color: "white",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 14,
            fontSize: 15,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={inputStyle}
          >
            <option value="fast">Fast</option>
            <option value="deep">Deep</option>
          </select>
          <button onClick={generateSermon} disabled={loading || !prompt.trim()} style={buttonStyle}>
            {loading ? "Generating..." : "Generate Sermon"}
          </button>
        </div>
        {error ? <div style={errorStyle}>{error}</div> : null}
      </Panel>

      <Panel
        title="Output"
        actions={
          sermon ? (
            <button style={secondaryButtonStyle} onClick={() => navigator.clipboard.writeText(sermon)}>
              Copy
            </button>
          ) : null
        }
      >
        <div
          style={{
            minHeight: 260,
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            background: "#0b0b0b",
            border: "1px solid #2d2d2d",
            borderRadius: 12,
            padding: 16,
          }}
        >
          {sermon || "Your sermon will appear here."}
        </div>
      </Panel>
    </Shell>
  );
}

function AIPastor() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Peace be with you. I am your AI pastoral companion. Ask about theology, pastoral counsel, sermon direction, or current events through a biblical lens.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveWeb, setLiveWeb] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setLoading(true);

    try {
      const history = messages
        .slice(-8)
        .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.text}`)
        .join("\n\n");

      const response = await callClaude(
        {
          system:
            "You are a pastoral theologian and sermon advisor. Be biblically faithful, pastorally warm, and practically useful. Cite Scripture naturally in the response.",
          messages: [{ role: "user", content: `${history}\n\nUser: ${userInput}` }],
          tools: liveWeb ? ["web"] : [],
        },
        "",
        liveWeb
      );

      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${String(err.message || err)}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="AI Pastor"
      subtitle="Conversational pastoral tool backed by the same Claude endpoint. Live Web simply pushes the request into deep mode."
      right={
        <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#b8b8b8" }}>
          <input type="checkbox" checked={liveWeb} onChange={(e) => setLiveWeb(e.target.checked)} />
          Live Web
        </label>
      }
    >
      <Panel title="Conversation">
        <div
          style={{
            minHeight: 420,
            maxHeight: 520,
            overflowY: "auto",
            background: "#0b0b0b",
            border: "1px solid #2d2d2d",
            borderRadius: 12,
            padding: 16,
          }}
        >
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: m.role === "assistant" ? "#e3c16f" : "#8ab4ff", marginBottom: 6 }}>
                {m.role === "assistant" ? "AI Pastor" : "You"}
              </div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{m.text}</div>
            </div>
          ))}
          {loading ? <div style={{ color: "#b8b8b8" }}>Thinking...</div> : null}
          <div ref={endRef} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            style={{
              ...inputStyle,
              flex: 1,
              minHeight: 90,
              resize: "vertical",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={buttonStyle}>
            Send
          </button>
        </div>
      </Panel>
    </Shell>
  );
}

function Illustrations() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    try {
      setLoading(true);
      setError("");
      setResults([]);

      const sys =
        "You are a master storyteller and homiletician. Return ONLY raw JSON array. No markdown. No backticks.";
      const prompt = `Generate 6 sermon illustrations about: ${topic}

Return ONLY a JSON array.
Each item must be:
{
  "type": "biblical|historical|personal|cultural|object lesson|pastoral",
  "title": "short title",
  "content": "full illustration",
  "bridge": "how to connect it back to the sermon",
  "source": "brief source note"
}`;

      const raw = await callClaudeJSON(prompt, sys, true);
      const parsed = safeJSON(raw, []);
      if (!Array.isArray(parsed) || !parsed.length) {
        throw new Error("Could not parse JSON illustration output.");
      }
      setResults(parsed);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="Illustrations"
      subtitle="This tool uses the JSON endpoint because it needs structured data instead of streamed prose."
    >
      <Panel title="Illustration Prompt">
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Example: forgiveness, perseverance, holiness"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={generate} disabled={loading || !topic.trim()} style={buttonStyle}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        {error ? <div style={errorStyle}>{error}</div> : null}
      </Panel>

      <Panel title="Results">
        {!results.length ? (
          <div style={{ color: "#b8b8b8" }}>No illustrations yet.</div>
        ) : (
          results.map((item, i) => (
            <div key={i} style={{ borderTop: i ? "1px solid #2d2d2d" : "none", paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0 }}>
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              <div style={{ marginTop: 8, color: "#e3c16f" }}>{item.type}</div>
              <div style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{item.content}</div>
              <div style={{ marginTop: 8, color: "#b8b8b8" }}><strong>Bridge:</strong> {item.bridge}</div>
              <div style={{ marginTop: 4, color: "#8f8f8f" }}><strong>Source:</strong> {item.source}</div>
            </div>
          ))
        )}
      </Panel>
    </Shell>
  );
}

function SeriesPlanner() {
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    try {
      setLoading(true);
      setError("");
      setPlan(null);

      const sys =
        "You create sermon series plans. Return ONLY raw JSON object. No markdown. No backticks.";
      const prompt = `Create a ${weeks}-week preaching series plan.

Series name hint: ${name || "none"}
Start date: ${startDate || "not provided"}

Return ONLY JSON in this shape:
{
  "seriesTitle": "string",
  "seriesTagline": "string",
  "overview": "string",
  "weeks": [
    {
      "weekNumber": 1,
      "date": "optional date string",
      "title": "string",
      "passage": "string",
      "bigIdea": "string",
      "culturalConnection": "string",
      "worshipSuggestion": "string"
    }
  ]
}`;

      const raw = await callClaudeJSON(prompt, sys, true);
      const parsed = safeJSON(raw, {});
      if (!parsed || !parsed.seriesTitle) {
        throw new Error("Could not parse JSON series output.");
      }
      setPlan(parsed);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="Series Planner" subtitle="Structured series planning through the JSON endpoint.">
      <Panel title="Series Setup">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Series name (optional)" style={inputStyle} />
          <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={inputStyle}>
            {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n} weeks
              </option>
            ))}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          <button onClick={generatePlan} disabled={loading} style={buttonStyle}>
            {loading ? "Planning..." : "Generate"}
          </button>
        </div>
        {error ? <div style={errorStyle}>{error}</div> : null}
      </Panel>

      {plan ? (
        <>
          <Panel title={plan.seriesTitle}>
            <div style={{ color: "#e3c16f", marginBottom: 8 }}>{plan.seriesTagline}</div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{plan.overview}</div>
          </Panel>

          <Panel title="Weeks">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {(plan.weeks || []).map((w, i) => (
                <div key={i} style={{ border: "1px solid #2d2d2d", borderRadius: 12, padding: 14, background: "#0b0b0b" }}>
                  <div style={{ color: "#e3c16f", fontSize: 12, marginBottom: 4 }}>
                    WEEK {w.weekNumber}{w.date ? ` · ${w.date}` : ""}
                  </div>
                  <div style={{ fontWeight: 700 }}>{w.title}</div>
                  <div style={{ marginTop: 8, color: "#8ab4ff" }}>{w.passage}</div>
                  <div style={{ marginTop: 8, fontStyle: "italic" }}>{w.bigIdea}</div>
                  {w.culturalConnection ? (
                    <div style={{ marginTop: 8, color: "#b8b8b8" }}>
                      <strong>Cultural connection:</strong> {w.culturalConnection}
                    </div>
                  ) : null}
                  {w.worshipSuggestion ? (
                    <div style={{ marginTop: 8, color: "#b8b8b8" }}>
                      <strong>Worship suggestion:</strong> {w.worshipSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : null}
    </Shell>
  );
}

const inputStyle = {
  width: "100%",
  background: "#0b0b0b",
  color: "white",
  border: "1px solid #333",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 15,
};

const buttonStyle = {
  background: "#e3c16f",
  color: "#111",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  background: "#1d1d1d",
  color: "white",
  border: "1px solid #333",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 12,
  color: "#ff8e8e",
  whiteSpace: "pre-wrap",
};

export default function SermonCraftPro() {
  const [nav, setNav] = useState("sermon");

  const tabs = useMemo(
    () => [
      { id: "sermon", label: "Sermon Generator" },
      { id: "pastor", label: "AI Pastor" },
      { id: "illustrations", label: "Illustrations" },
      { id: "series", label: "Series Planner" },
    ],
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #222",
          position: "sticky",
          top: 0,
          background: "#0a0a0a",
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px" }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>SermonCraft Pro</div>
          <div style={{ marginTop: 6, color: "#b8b8b8" }}>
            Clean replacement file. Focused on the core tools and stable endpoint wiring.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setNav(tab.id)}
                style={{
                  ...secondaryButtonStyle,
                  background: nav === tab.id ? "#e3c16f" : "#151515",
                  color: nav === tab.id ? "#111" : "white",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {nav === "sermon" ? <SermonGenerator /> : null}
      {nav === "pastor" ? <AIPastor /> : null}
      {nav === "illustrations" ? <Illustrations /> : null}
      {nav === "series" ? <SeriesPlanner /> : null}
    </div>
  );
}
