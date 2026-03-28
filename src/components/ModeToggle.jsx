import { T } from "../tokens/theme";

const MODES = [
  { key: "detailed", label: "상세 해설", icon: "🔍" },
  { key: "summary", label: "핵심 요약", icon: "⚡" },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {MODES.map((m) => (
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
