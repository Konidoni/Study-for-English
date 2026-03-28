import { useState } from "react";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const NOTION_MCP = "https://mcp.notion.com/mcp";

// API 키를 앱 상태로 관리 (아티팩트 환경용)
let _apiKey = "";

const T = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  card: "#222222",
  border: "#333333",
  text: "#E8E4DF",
  textDim: "#9A948C",
  accent: "#E8A84C",
  accentDim: "#B8793A",
  green: "#5CB77A",
  red: "#D45B5B",
  blue: "#5B8FD4",
  tag: "#2A2520",
};

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');`;

async function callClaude(messages, tools = [], mcpServers = []) {
  if (!_apiKey) throw new Error("API 키를 먼저 입력해 주세요.");

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages,
  };
  if (tools.length) body.tools = tools;
  if (mcpServers.length) body.mcp_servers = mcpServers;

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": _apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }

  return res.json();
}

function extractText(data) {
  if (!data?.content) return "";
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${T.border}`,
        borderTopColor: T.accent,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {[
        { key: "detailed", label: "상세 해설", icon: "🔍" },
        { key: "summary", label: "핵심 요약", icon: "⚡" },
      ].map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          style={{
            padding: "8px 16px",
            background: mode === m.key ? T.accent : "transparent",
            color: mode === m.key ? T.bg : T.textDim,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: mode === m.key ? 600 : 400,
            transition: "all 0.2s",
          }}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  );
}

function ParagraphCard({ paragraph, index, mode }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        borderLeft: `3px solid ${T.accent}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            background: T.accent,
            color: T.bg,
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          P{index + 1}
        </span>
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'Noto Sans KR', sans-serif" }}>
          {mode === "detailed" ? "상세 해설 모드" : "핵심 요약 모드"}
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 15,
          lineHeight: 1.7,
          color: T.text,
          marginBottom: 16,
          padding: "14px 16px",
          background: "rgba(232,168,76,0.06)",
          borderRadius: 8,
          borderLeft: `2px solid ${T.accentDim}`,
        }}
      >
        {paragraph.original}
      </div>

      <div
        style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 14,
          lineHeight: 1.8,
          color: T.textDim,
          marginBottom: 16,
          paddingLeft: 16,
        }}
      >
        📝 {paragraph.translation}
      </div>

      {mode === "summary" && paragraph.summary && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 13,
              color: T.text,
              lineHeight: 1.8,
              padding: "12px 16px",
              background: "rgba(92,183,122,0.08)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6, color: T.green }}>⚡ 핵심 포인트</div>
            {paragraph.summary}
          </div>
          {paragraph.keyExpressions?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {paragraph.keyExpressions.map((expr, i) => (
                <span
                  key={i}
                  style={{
                    background: T.tag,
                    color: T.accent,
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {expr}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "detailed" && paragraph.detailed && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 13,
            color: T.text,
            lineHeight: 2,
            whiteSpace: "pre-wrap",
          }}
        >
          {paragraph.detailed}
        </div>
      )}
    </div>
  );
}

function NotionSaveModal({ onClose, onSave, loading }) {
  const [dbUrl, setDbUrl] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 28,
          width: "90%",
          maxWidth: 460,
        }}
      >
        <h3
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: T.text,
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          📦 노션 데이터베이스에 저장
        </h3>
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 13,
            color: T.textDim,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          저장할 노션 데이터베이스의 URL을 붙여넣어 주세요.
          <br />
          (데이터베이스 페이지를 열고 주소창에서 복사)
        </p>
        <input
          value={dbUrl}
          onChange={(e) => setDbUrl(e.target.value)}
          placeholder="https://www.notion.so/…"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.text,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              color: T.textDim,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Noto Sans KR', sans-serif",
            }}
          >
            취소
          </button>
          <button
            onClick={() => onSave(dbUrl)}
            disabled={!dbUrl.trim() || loading}
            style={{
              padding: "10px 20px",
              background: dbUrl.trim() ? T.accent : T.border,
              border: "none",
              borderRadius: 8,
              color: T.bg,
              fontSize: 13,
              fontWeight: 600,
              cursor: dbUrl.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Noto Sans KR', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading && <Spinner size={14} />}
            {loading ? "저장 중…" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticleAnalyzer() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [article, setArticle] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [error, setError] = useState("");
  const [showNotion, setShowNotion] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionDone, setNotionDone] = useState(false);

  function saveApiKey() {
    if (!apiKey.trim()) return;
    _apiKey = apiKey.trim();
    setApiKeySet(true);
  }

  async function analyzeArticle() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setParagraphs([]);
    setArticle(null);
    setNotionDone(false);

    try {
      setProgress("기사를 가져오는 중...");
      const fetchRes = await callClaude(
        [
          {
            role: "user",
            content: `Fetch this article URL and extract its content: ${url}

Return ONLY a JSON object (no markdown, no backticks) with this structure:
{
  "title": "article title",
  "source": "publication name",
  "paragraphs": ["paragraph 1 text", "paragraph 2 text", …]
}

Split the article body into its natural paragraphs. Skip navigation, ads, footers. Only include the main article content.`,
          },
        ],
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const fetchText = extractText(fetchRes);
      let articleData;
      try {
        articleData = JSON.parse(fetchText.replace(/```json|```/g, "").trim());
      } catch {
        setError("기사 파싱에 실패했어요. URL을 다시 확인해 주세요.");
        setLoading(false);
        return;
      }

      setArticle(articleData);
      setProgress(`"${articleData.title}" — 분석 시작...`);

      const analyzed = [];
      for (let i = 0; i < articleData.paragraphs.length; i += 2) {
        const batch = articleData.paragraphs.slice(i, i + 2);
        setProgress(
          `분석 중... (${Math.min(i + 2, articleData.paragraphs.length)}/${articleData.paragraphs.length} 단락)`
        );

        const batchPrompt = batch
          .map((p, j) => `— Paragraph ${i + j + 1} —\n${p}`)
          .join("\n\n");

        const analysisRes = await callClaude([
          {
            role: "user",
            content: `You are a bilingual (English-Korean) article analyst and English tutor.

Analyze these paragraphs. Return ONLY a JSON array (no markdown, no backticks).

For each paragraph:
{
  "original": "the original English paragraph text",
  "translation": "자연스러운 한국어 번역",
  "summary": "핵심 포인트를 한국어로 2-3문장",
  "keyExpressions": ["영어표현1 = 한국어뜻", "영어표현2 = 한국어뜻", "영어표현3 = 한국어뜻"],
  "detailed": "상세 해설:\n\n1) 주요 단어/표현 설명\n2) 문장 구조\n3) 활용 예문 1-2개\n4) 자연스러운 한국어 해석"
}

Paragraphs:
${batchPrompt}`,
          },
        ]);

        try {
          const parsed = JSON.parse(extractText(analysisRes).replace(/```json|```/g, "").trim());
          analyzed.push(...parsed);
        } catch {
          batch.forEach((p) =>
            analyzed.push({ original: p, translation: "(분석 실패)", summary: "", keyExpressions: [], detailed: "" })
          );
        }
      }

      setParagraphs(analyzed);
      setProgress("");
    } catch (e) {
      setError(`오류가 발생했어요: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotionSave(dbUrl) {
    setNotionLoading(true);
    try {
      let content = `# ${article?.title || "Article Analysis"}\n\n`;
      content += `**Source:** ${article?.source || ""}\n**URL:** ${url}\n**분석일:** ${new Date().toLocaleDateString("ko-KR")}\n\n---\n\n`;
      paragraphs.forEach((p, i) => {
        content += `## 단락 ${i + 1}\n\n> ${p.original}\n\n**번역:** ${p.translation}\n\n`;
        if (p.summary) content += `**핵심:** ${p.summary}\n\n`;
        if (p.keyExpressions?.length) content += `**주요 표현:** ${p.keyExpressions.join(" | ")}\n\n`;
        if (p.detailed) content += `**상세 해설:**\n${p.detailed}\n\n`;
        content += `---\n\n`;
      });

      const notionRes = await callClaude(
        [
          {
            role: "user",
            content: `Add a new page to this Notion database: ${dbUrl}

Title: "${article?.title || "Article Analysis"}"
URL property: ${url}
Source: ${article?.source || ""}
Date: ${new Date().toISOString().split("T")[0]}

Page content:
${content}`,
          },
        ],
        [],
        [{ type: "url", url: NOTION_MCP, name: "notion-mcp" }]
      );

      const responseText = extractText(notionRes);
      if (responseText.toLowerCase().includes("error") && !responseText.toLowerCase().includes("created")) {
        throw new Error(responseText.slice(0, 200));
      }
      setNotionDone(true);
      setShowNotion(false);
    } catch (e) {
      alert(`노션 저장 실패: ${e.message}`);
    } finally {
      setNotionLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{`
        ${fonts}
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        input::placeholder { color: ${T.textDim}; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "20px 24px", background: T.surface }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: T.accent }}>◆</span> Article Analyzer
            </h1>
            <p style={{ fontSize: 12, color: T.textDim, margin: "4px 0 0" }}>
              뉴스 기사 → 한영 병행 단락별 해설 → 노션 아카이빙
            </p>
          </div>
          {paragraphs.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ModeToggle mode={mode} onChange={setMode} />
              <button
                onClick={() => setShowNotion(true)}
                style={{
                  padding: "8px 16px",
                  background: notionDone ? T.green : "transparent",
                  border: `1px solid ${notionDone ? T.green : T.border}`,
                  borderRadius: 8,
                  color: notionDone ? T.bg : T.text,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontWeight: 500,
                }}
              >
                {notionDone ? "✓ 저장됨" : "📦 노션 저장"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        {/* API Key input */}
        {!apiKeySet && (
          <div
            style={{
              marginBottom: 24,
              padding: 20,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 13, color: T.textDim, margin: "0 0 12px", lineHeight: 1.6 }}>
              🔑 Anthropic API 키를 입력하세요.{" "}
              <span style={{ color: T.accent }}>console.anthropic.com</span> 에서 발급받을 수 있어요.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                placeholder="sk-ant-..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.text,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                }}
              />
              <button
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                style={{
                  padding: "10px 18px",
                  background: apiKey.trim() ? T.accent : T.border,
                  border: "none",
                  borderRadius: 8,
                  color: T.bg,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: apiKey.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {apiKeySet && (
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => { setApiKeySet(false); _apiKey = ""; }}
              style={{
                fontSize: 11,
                color: T.textDim,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              🔑 API 키 변경
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeArticle()}
            placeholder="뉴스 기사 URL을 붙여넣으세요"
            style={{
              flex: 1,
              padding: "14px 16px",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              color: T.text,
              fontSize: 14,
              fontFamily: "'Noto Sans KR', sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={analyzeArticle}
            disabled={loading || !url.trim()}
            style={{
              padding: "14px 24px",
              background: url.trim() && !loading ? T.accent : T.border,
              border: "none",
              borderRadius: 10,
              color: T.bg,
              fontSize: 14,
              fontWeight: 600,
              cursor: url.trim() && !loading ? "pointer" : "not-allowed",
              fontFamily: "'Noto Sans KR', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            {loading && <Spinner size={16} />}
            {loading ? "분석 중" : "분석 시작"}
          </button>
        </div>

        {progress && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(232,168,76,0.08)",
              border: `1px solid rgba(232,168,76,0.2)`,
              borderRadius: 8,
              fontSize: 13,
              color: T.accent,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Spinner size={14} />
            {progress}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(212,91,91,0.1)",
              border: `1px solid rgba(212,91,91,0.3)`,
              borderRadius: 8,
              fontSize: 13,
              color: T.red,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {article && (
          <div style={{ marginBottom: 24, animation: "fadeIn 0.4s ease" }}>
            <h2
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 6px",
                lineHeight: 1.4,
              }}
            >
              {article.title}
            </h2>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              {article.source} · {paragraphs.length}개 단락
            </span>
          </div>
        )}

        {paragraphs.map((p, i) => (
          <div key={i} style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
            <ParagraphCard paragraph={p} index={i} mode={mode} />
          </div>
        ))}

        {!loading && paragraphs.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.textDim }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📰</div>
            <p style={{ fontSize: 15, marginBottom: 8 }}>영어 뉴스 기사 URL을 넣어보세요</p>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>
              단락별로 해설 · 번역 · 핵심 표현 정리
              <br />→ 노션 데이터베이스에 바로 아카이빙
            </p>
          </div>
        )}
      </div>

      {showNotion && (
        <NotionSaveModal
          onClose={() => setShowNotion(false)}
          onSave={handleNotionSave}
          loading={notionLoading}
        />
      )}
    </div>
  );
}
