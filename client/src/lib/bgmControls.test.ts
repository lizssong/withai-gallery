import { describe, expect, it } from "vitest";
import { clampBgmVolume, getEffectiveBgmGain } from "./bgmControls";

describe("BGM 출력 제어", () => {
  it("음량을 0과 1 사이로 안전하게 제한한다", () => {
    expect(clampBgmVolume(-0.2)).toBe(0);
    expect(clampBgmVolume(0.42)).toBe(0.42);
    expect(clampBgmVolume(1.5)).toBe(1);
  });

  it("음소거 상태에서는 어떤 음량 값에서도 출력 게인이 0이다", () => {
    expect(getEffectiveBgmGain(0.72, true)).toBe(0);
    expect(getEffectiveBgmGain(0.72, false)).toBe(0.72);
  });

  it("0으로 설정한 음량도 출력 게인 0으로 처리한다", () => {
    expect(getEffectiveBgmGain(0, false)).toBe(0);
  });
});
