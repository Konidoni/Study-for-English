import { T } from "../tokens/theme";

export default function ParagraphCard({ paragraph, index, mode }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        transition: "all 0.3s",
        borderLeft: `3px solid ${T.accent}`,
      }}
    >
      {/* paragraph number */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
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
        <span
          style={{
            fontSize: 11,
            color: T.textDim,
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          {mode === "detailed" ? "상세 해설 모드" : "핵심 요약 모드"}
        </span>
      </div>

      {/* original text */}
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

      {/* Korean translation */}
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

      {/* summary mode */}
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
            <div style={{ fontWeight: 600, marginBottom: 6, color: T.green }}>
              ⚡ 핵심 포인트
            </div>
            {paragraph.summary}
          </div>
          {paragraph.keyExpressions?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 10,
              }}
            >
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

      {/* detailed mode */}
      {mode === "detailed" && paragraph.detailed && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 13,
              color: T.text,
              lineHeight: 2,
              whiteSpace: "pre-wrap",
            }}
          >
            {paragraph.detailed}
          </div>
        </div>
      )}
    </div>
  );
}
