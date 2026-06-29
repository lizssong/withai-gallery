/**
 * GalleryLayout — 공통 헤더 + BGM 제어
 * Design: "Ink & Light" — 먹빛 배경, 골드 포인트
 */
import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

const BGM_URL = "/manus-storage/gallery-bgm_b9e12943.mp3";

// ── BGM Context ─────────────────────────────────────────────────────────────
interface BgmContextType {
  startBgm: () => void;
  stopBgm: () => void;
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
}

const BgmContext = createContext<BgmContextType>({
  startBgm: () => {},
  stopBgm: () => {},
  isMuted: false,
  isPlaying: false,
  toggleMute: () => {},
});

export const useBgm = () => useContext(BgmContext);

// ── BgmProvider ──────────────────────────────────────────────────────────────
export function BgmProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(BGM_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;
    audio.load();
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const fadeVolume = useCallback((target: number, ms = 1500) => {
    const audio = audioRef.current;
    if (!audio) return;
    const start = audio.volume;
    const diff = target - start;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, start + diff * (step / steps)));
      if (step >= steps) clearInterval(timer);
    }, ms / steps);
  }, []);

  const startBgm = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isPlaying) return;
    try {
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);
      setIsMuted(false);
      fadeVolume(0.42, 2000);
    } catch {}
  }, [isPlaying, fadeVolume]);

  const stopBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeVolume(0, 1000);
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(false);
    }, 1100);
  }, [fadeVolume]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      fadeVolume(prev ? 0.42 : 0, 600);
      return !prev;
    });
  }, [fadeVolume]);

  return (
    <BgmContext.Provider value={{ startBgm, stopBgm, isMuted, isPlaying, toggleMute }}>
      {children}
    </BgmContext.Provider>
  );
}

// ── GalleryHeader ────────────────────────────────────────────────────────────
export function GalleryHeader() {
  const [location] = useLocation();
  const { isMuted, isPlaying, toggleMute } = useBgm();
  const isHome = location === "/";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{ borderBottom: "1px solid rgba(201,169,110,0.15)", background: "rgba(18,18,30,0.85)", backdropFilter: "blur(12px)" }}
    >
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/gallery-logo-Re7k64PmePnMojqyRhyB4a.webp"
          alt="갤러리 로고"
          className="w-7 h-7 object-contain"
        />
        <span className="gallery-caption gold-text tracking-widest hidden sm:block" style={{ fontSize: "0.65rem" }}>
          AI ART COLLECTIVE
        </span>
      </Link>

      {/* 중앙 네비게이션 */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5">
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
        <span className="gallery-caption gold-text tracking-widest" style={{ fontSize: "0.55rem" }}>
          SPRING 2025
        </span>
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
        <Link
          href="/my"
          className="gallery-caption transition-all duration-200 no-underline"
          style={{
            fontSize: "0.5rem",
            letterSpacing: "0.15em",
            color: location === "/my" ? "#c9a96e" : "rgba(240,235,224,0.5)",
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
            fontSize: "0.5rem",
            letterSpacing: "0.15em",
            color: "rgba(240,235,224,0.35)",
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
        fontSize: "0.5rem",
        letterSpacing: "0.15em",
        color: "rgba(240,235,224,0.45)",
        border: "1px solid rgba(201,169,110,0.2)",
        padding: "3px 8px",
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
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: active ? "#c9a96e" : "rgba(240,235,224,0.5)",
        borderBottom: active ? "1px solid rgba(201,169,110,0.5)" : "1px solid transparent",
        paddingBottom: "2px",
      }}
    >
      {label.toUpperCase()}
    </Link>
  );
}

// ── GalleryLayout ────────────────────────────────────────────────────────────
export function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <BgmProvider>
      <div className="min-h-screen ink-bg">
        {/* 배경 빛 효과 */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,169,110,0.05) 0%, transparent 70%)" }}
        />
        <GalleryHeader />
        <main className="pt-14">{children}</main>
      </div>
    </BgmProvider>
  );
}

// ── 아이콘 ───────────────────────────────────────────────────────────────────
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
