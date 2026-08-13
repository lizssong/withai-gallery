export function clampBgmVolume(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function getEffectiveBgmGain(volume: number, isMuted: boolean) {
  return isMuted ? 0 : clampBgmVolume(volume);
}
