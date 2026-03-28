import { T, fonts } from "../../tokens/theme";
import Spinner from "../../components/Spinner";
import ModeToggle from "../../components/ModeToggle";
import ParagraphCard from "../../components/ParagraphCard";
import NotionSaveModal from "../../components/NotionSaveModal";
import { useArticleAnalyzer } from "./useArticleAnalyzer";

export default function ArticleAnalyzer() {
  const {
    url,
    setUrl,
    mode,
    setMode,
    loading,
    progress,
    article,
    paragraphs,
    error,
    showNotion,
    setShowNotion,
    notionLoading,
    notionDone,
    analyzeArticle,
    handleNotionSave,
  } = useArticleAnalyzer();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
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
      <div
        style={{
          borderBottom: `1px solid ${T.border}`,
          padding: "20px 24px",
          background: T.surface,
        }}
      >
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
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
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

      {/* Main content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        {/* URL input */}
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

        {/* Progress */}
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

        {/* Error */}
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

        {/* Article title */}
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
            <span
              style={{
                fontSize: 12,
                color: T.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {article.source} · {paragraphs.length}개 단락
            </span>
          </div>
        )}

        {/* Paragraph cards */}
        {paragraphs.map((p, i) => (
          <div key={i} style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
            <ParagraphCard paragraph={p} index={i} mode={mode} />
          </div>
        ))}

        {/* Empty state */}
        {!loading && paragraphs.length === 0 && !error && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: T.textDim,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📰</div>
            <p style={{ fontSize: 15, marginBottom: 8 }}>영어 뉴스 기사 URL을 넣어보세요</p>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>
              단락별로 해설 · 번역 · 핵심 표현 정리
              <br />→ 노션 데이터베이스에 바로 아카이빙
            </p>
          </div>
        )}
      </div>

      {/* Notion modal */}
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
