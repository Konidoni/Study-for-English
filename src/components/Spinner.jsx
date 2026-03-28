import { T } from "../tokens/theme";

export default function Spinner({ size = 20 }) {
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
