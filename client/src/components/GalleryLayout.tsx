/**
 * GalleryLayout — 공통 헤더 + BGM 제어
 * Design: "Ink & Light" — 먹빛 배경, 골드 포인트
 */
import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

const BGM_URL = "/manus-storage/gallery-piano-bgm_accd858b.mp3";

// ── BGM Context ─────────────────────────────────────────────────────────────
interface BgmContextType {
  startBgm: () => void;
  stopBgm: () => void;
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const BgmContext = createContext<BgmContextType>({
  startBgm: () => {},
  stopBgm: () => {},
  isMuted: false,
  isPlaying: false,
  toggleMute: () => {},
  volume: 0.42,
  setVolume: () => {},
});

export const useBgm = () => useContext(BgmContext);

// ── BgmProvider ──────────────────────────────────────────────────────────────
export function BgmProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  // ref로 최신값 항상 참조 (클로저 문제 방지)
  const volumeRef = useRef(0.42);
  const isMutedRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio(BGM_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;
    audio.load();
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const clearFade = useCallback(() => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  const fadeVolume = useCallback((target: number, ms = 1500) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    const start = audio.volume;
    const diff = target - start;
    const steps = 40;
    let step = 0;
    fadeTimerRef.current = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, start + diff * (step / steps)));
      if (step >= steps) clearFade();
    }, ms / steps);
  }, [clearFade]);

  const startBgm = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isPlaying) return;
    try {
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);
      setIsMuted(false);
      isMutedRef.current = false;
      fadeVolume(volumeRef.current, 2000);
    } catch {}
  }, [isPlaying, fadeVolume]);

  const stopBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    audio.volume = 0;
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(false);
      isMutedRef.current = false;
    }, 1100);
  }, [clearFade]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade(); // 진행 중인 페이드 즉시 중단
    const newMuted = !isMutedRef.current;
    isMutedRef.current = newMuted;
    audio.volume = newMuted ? 0 : volumeRef.current;
    setIsMuted(newMuted);
  }, [clearFade]);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    const audio = audioRef.current;
    if (!audio) return;
    clearFade(); // 진행 중인 페이드 즉시 중단
    if (!isMutedRef.current) {
      audio.volume = v; // 뮤트 상태가 아닐 때만 즉시 반영
    }
    if (v === 0) {
      isMutedRef.current = true;
      setIsMuted(true);
    } else if (isMutedRef.current && v > 0) {
      // 슬라이더로 0에서 올리면 자동 언뮤트
      isMutedRef.current = false;
      setIsMuted(false);
    }
  }, [clearFade]);

  return (
    <BgmContext.Provider value={{ startBgm, stopBgm, isMuted, isPlaying, toggleMute, volume, setVolume }}>
      {children}
    </BgmContext.Provider>
  );
}

// ── GalleryHeader ────────────────────────────────────────────────────────────
export function GalleryHeader() {
  const [location] = useLocation();
  const { isMuted, isPlaying, toggleMute, volume, setVolume } = useBgm();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{ borderBottom: "1px solid rgba(201,169,110,0.15)", background: "rgba(18,18,30,0.85)", backdropFilter: "blur(12px)" }}
    >
      {/* 로고 */}
      <Link href="/" className="flex items-center no-underline">
        <img
          src="/manus-storage/withaisolution-logo_fbd1919e.png"
          alt="위드AI솔루션"
          className="h-8 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)", maxWidth: "160px" }}
        />
      </Link>

      {/* 중앙 네비게이션 */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5">
        <NavLink href="/gallery" label="갤러리" active={location === "/gallery"} />
        <NavLink href="/exhibitions" label="전시회" active={location.startsWith("/exhibition")} />
        <NavLink href="/artists" label="작가" active={location.startsWith("/artists")} />
        <NavLink href="/epilogue" label="에필로그" active={location === "/epilogue"} />
      </nav>

      {/* 우측: BGM + 마이페이지 + 시즌 */}
      <div className="flex items-center gap-3">
        <AuthButton location={location} />
        {isPlaying && (
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              background: "none",
              border: `1px solid ${isMuted ? "rgba(201,169,110,0.2)" : "rgba(201,169,110,0.4)"}`,
              borderRadius: "2px",
              padding: "3px 8px",
              color: isMuted ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.85)",
            }}
            aria-label={isMuted ? "음악 켜기" : "음악 끄기"}
          >
            {isMuted ? <MusicOffIcon /> : <MusicOnIcon />}
            <span className="gallery-caption hidden sm:inline" style={{ fontSize: "0.5rem", letterSpacing: "0.15em", color: "inherit" }}>
              {isMuted ? "MUTED" : "♪ BGM"}
            </span>
          </button>
        )}
        {isPlaying && (
          <div className="relative">
            <button
              onClick={() => setShowVolume((v) => !v)}
              className="flex items-center transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{ background: "none", border: "none", color: "rgba(201,169,110,0.65)", cursor: "pointer", padding: "4px 5px" }}
              aria-label="음량 조절"
            >
              <VolumeIcon muted={isMuted} />
            </button>
            {showVolume && (
              <div
                className="absolute right-0 top-9 flex flex-col items-center gap-2 p-3"
                style={{ background: "rgba(12,10,20,0.96)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "4px", zIndex: 200, minWidth: "52px" }}
              >
                <span className="gallery-caption" style={{ fontSize: "0.44rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.08em" }}>
                  {Math.round(volume * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="volume-slider"
                  style={{ writingMode: "vertical-lr" as const, direction: "rtl" as const, width: "4px", height: "72px", cursor: "pointer", accentColor: "#c9a96e" }}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}

// ── AuthButton ───────────────────────────────────────────────────────────────
function AuthButton({ location }: { location: string }) {
  const { data: user } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.href = "/",
  });

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="gallery-caption transition-all duration-200 no-underline"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: location === "/admin" ? "#c9a96e" : "rgba(201,169,110,0.7)",
              borderBottom: location === "/admin" ? "1px solid rgba(201,169,110,0.5)" : "1px solid transparent",
              paddingBottom: "2px",
            }}
          >
            ADMIN
          </Link>
        )}
        <Link
          href="/my"
          className="gallery-caption transition-all duration-200 no-underline"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: location === "/my" ? "#c9a96e" : "rgba(240,235,224,0.65)",
            borderBottom: location === "/my" ? "1px solid rgba(201,169,110,0.5)" : "1px solid transparent",
            paddingBottom: "2px",
          }}
        >
          MY
        </Link>
        <button
          onClick={() => logout.mutate()}
          className="gallery-caption transition-all duration-200 hover:opacity-70"
          style={{
            background: "none",
            border: "none",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: "rgba(240,235,224,0.5)",
            cursor: "pointer",
            paddingBottom: "2px",
          }}
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <a
      href={getLoginUrl()}
      className="gallery-caption transition-all duration-200 no-underline hover:opacity-80"
      style={{
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        color: "rgba(240,235,224,0.7)",
        border: "1px solid rgba(201,169,110,0.3)",
        padding: "4px 10px",
      }}
    >
      LOGIN
    </a>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="gallery-caption transition-all duration-200 no-underline"
      style={{
        fontSize: "0.82rem",
        letterSpacing: "0.12em",
        color: active ? "#c9a96e" : "rgba(240,235,224,0.75)",
        borderBottom: active ? "1px solid rgba(201,169,110,0.6)" : "1px solid transparent",
        paddingBottom: "2px",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </Link>
  );
}

// ── GalleryLayout ────────────────────────────────────────────────────────────
export function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen ink-bg">
      {/* 배경 빛 효과 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,169,110,0.05) 0%, transparent 70%)" }}
      />
      <GalleryHeader />
      <main className="pt-14">{children}</main>
    </div>
  );
}

// ── 아이콘 ───────────────────────────────────────────────────────────────────
function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MusicOnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function MusicOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
