import { useState } from "react";
import { T } from "../tokens/theme";
import Spinner from "./Spinner";

export default function NotionSaveModal({ onClose, onSave, loading }) {
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
