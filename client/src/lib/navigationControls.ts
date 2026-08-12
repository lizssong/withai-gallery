import type { CSSProperties } from "react";

/** 이미지 위에서도 탐색 컨트롤이 선명하게 보이도록 공통화한 고대비 스타일입니다. */
export const NAVIGATION_CONTROL_SIZE = 62;

export function getNavigationButtonStyle(available = true): CSSProperties {
  return {
    background: available ? "rgba(8,8,14,0.94)" : "rgba(8,8,14,0.82)",
    border: `2px solid ${available ? "#c9a96e" : "rgba(201,169,110,0.4)"}`,
    color: available ? "#fff1c6" : "rgba(255,241,198,0.55)",
    width: `${NAVIGATION_CONTROL_SIZE}px`,
    height: `${NAVIGATION_CONTROL_SIZE}px`,
    borderRadius: "50%",
    boxShadow: available
      ? "0 12px 30px rgba(0,0,0,0.75), 0 0 0 4px rgba(8,8,14,0.62), 0 0 24px rgba(201,169,110,0.38)"
      : "0 8px 20px rgba(0,0,0,0.58), 0 0 0 3px rgba(8,8,14,0.45)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    touchAction: "manipulation",
  };
}
