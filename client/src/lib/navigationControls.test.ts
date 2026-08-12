import { describe, expect, it } from "vitest";
import { getNavigationButtonStyle, NAVIGATION_CONTROL_SIZE } from "./navigationControls";

describe("navigation control styles", () => {
  it("uses a large, high-contrast control for artwork navigation", () => {
    const style = getNavigationButtonStyle(true);

    expect(NAVIGATION_CONTROL_SIZE).toBeGreaterThanOrEqual(44);
    expect(style.width).toBe("44px");
    expect(style.height).toBe("44px");
    expect(style.background).toBe("rgba(8,8,14,0.7)");
    expect(style.border).toBe("1px solid rgba(201,169,110,0.68)");
    expect(style.boxShadow).toContain("0 5px 16px");
  });

  it("keeps unavailable navigation visibly disabled", () => {
    const style = getNavigationButtonStyle(false);

    expect(style.color).toBe("rgba(255,241,198,0.42)");
    expect(style.border).toContain("rgba(201,169,110,0.32)");
  });
});
