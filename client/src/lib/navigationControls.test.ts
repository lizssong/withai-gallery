import { describe, expect, it } from "vitest";
import { getNavigationButtonStyle, NAVIGATION_CONTROL_SIZE } from "./navigationControls";

describe("navigation control styles", () => {
  it("uses a large, high-contrast control for artwork navigation", () => {
    const style = getNavigationButtonStyle(true);

    expect(NAVIGATION_CONTROL_SIZE).toBeGreaterThanOrEqual(60);
    expect(style.width).toBe("62px");
    expect(style.height).toBe("62px");
    expect(style.background).toBe("rgba(8,8,14,0.94)");
    expect(style.border).toBe("2px solid #c9a96e");
    expect(style.boxShadow).toContain("0 0 24px");
  });

  it("keeps unavailable navigation visibly disabled", () => {
    const style = getNavigationButtonStyle(false);

    expect(style.color).toBe("rgba(255,241,198,0.55)");
    expect(style.border).toContain("rgba(201,169,110,0.4)");
  });
});
