import type { CSSProperties } from "react";

/** 이미지 위에서도 탐색 컨트롤이 선명하게 보이도록 공통화한 고대비 스타일입니다. */
export const NAVIGATION_CONTROL_SIZE = 44;

export function getNavigationButtonStyle(available = true): CSSProperties {
  return {
    background: available ? "rgba(8,8,14,0.7)" : "rgba(8,8,14,0.5)",
    border: `1px solid ${available ? "rgba(201,169,110,0.68)" : "rgba(201,169,110,0.32)"}`,
    color: available ? "rgba(255,241,198,0.92)" : "rgba(255,241,198,0.42)",
    width: `${NAVIGATION_CONTROL_SIZE}px`,
    height: `${NAVIGATION_CONTROL_SIZE}px`,
    borderRadius: "50%",
    boxShadow: available
      ? "0 5px 16px rgba(0,0,0,0.5)"
      : "0 4px 12px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    touchAction: "manipulation",
  };
}
