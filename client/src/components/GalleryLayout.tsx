/**
 * GalleryLayout — 공통 헤더 + BGM 제어
 * Design: "Ink & Light" — 먹빛 배경, 골드 포인트
 */
import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { clampBgmVolume, getEffectiveBgmGain } from "@/lib/bgmControls";

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
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  const stateRef = useRef({ volume: 0.42, lastAudibleVolume: 0.42, isMuted: false, isPlaying: false });

  const clearFade = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  const applyOutputGain = useCallback((nextVolume: number, nextMuted: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = nextMuted;
    audio.volume = getEffectiveBgmGain(nextVolume, nextMuted);
  }, []);

  useEffect(() => {
    const audio = new Audio(BGM_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;
    audio.load();

    return () => {
      clearFade();
      audio.pause();
      audio.src = "";
    };
  }, [clearFade]);

  const startBgm = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || stateRef.current.isPlaying) return;
    try {
      clearFade();
      applyOutputGain(0, false);
      await audio.play();
      stateRef.current.isPlaying = true;
      stateRef.current.isMuted = false;
      setIsPlaying(true);
      setIsMuted(false);
      const target = stateRef.current.volume;
      let v = 0;
      const step = target / 40;
      fadeTimerRef.current = setInterval(() => {
        v = Math.min(v + step, target);
        applyOutputGain(v, false);
        if (v >= target) clearFade();
      }, 50);
    } catch {}
  }, [applyOutputGain, clearFade]);

  const stopBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    applyOutputGain(0, true);
    audio.pause();
    audio.currentTime = 0;
    stateRef.current.isPlaying = false;
    setIsPlaying(false);
    setIsMuted(false);
  }, [applyOutputGain, clearFade]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    const newMuted = !stateRef.current.isMuted;
    if (!newMuted && stateRef.current.volume === 0) {
      stateRef.current.volume = stateRef.current.lastAudibleVolume;
      setVolumeState(stateRef.current.lastAudibleVolume);
    }
    stateRef.current.isMuted = newMuted;
    applyOutputGain(stateRef.current.volume, newMuted);
    setIsMuted(newMuted);
  }, [applyOutputGain, clearFade]);

  const setVolume = useCallback((v: number) => {
    clearFade();
    const clamped = clampBgmVolume(v);
    stateRef.current.volume = clamped;
    if (clamped > 0) stateRef.current.lastAudibleVolume = clamped;
    setVolumeState(clamped);
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = clamped === 0;
    stateRef.current.isMuted = nextMuted;
    applyOutputGain(clamped, nextMuted);
    setIsMuted(nextMuted);
  }, [applyOutputGain, clearFade]);

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
  const panelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    if (!showVolume) return;
    const handleClick = (e: Event) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [showVolume]);

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [menuOpen]);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false); }, [location]);

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

      {/* 데스크톱 중앙 네비게이션 */}
      <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5">
        <NavLink href="/gallery" label="갤러리" active={location === "/gallery"} />
        <NavLink href="/exhibitions" label="전시회" active={location.startsWith("/exhibition")} />
        <NavLink href="/artists" label="작가" active={location.startsWith("/artists")} />
        <NavLink href="/epilogue" label="에필로그" active={location === "/epilogue"} />
      </nav>

      {/* 우측: BGM + 마이페이지 + 시즌 */}
      <div className="flex items-center gap-3">
        <AuthButton location={location} />

        {/* 모바일 햄버거 버튼 */}
        {isMobile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="메뉴 열기"
              style={{
                background: "none",
                border: "1px solid rgba(201,169,110,0.3)",
                borderRadius: "3px",
                padding: "6px 9px",
                color: "rgba(201,169,110,0.85)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minWidth: "40px",
                minHeight: "36px",
                justifyContent: "center",
                alignItems: "center",
                touchAction: "manipulation",
              }}
            >
              {menuOpen ? (
                /* X 아이콘 */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* 햄버거 아이콘 */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            {/* 드롭다운 메뉴 */}
            {menuOpen && (
              <div
                className="absolute right-0 top-11"
                style={{
                  background: "rgba(12,10,20,0.98)",
                  border: "1px solid rgba(201,169,110,0.25)",
                  borderRadius: "6px",
                  zIndex: 400,
                  minWidth: "160px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
                  overflow: "hidden",
                }}
              >
                {[
                  { href: "/gallery", label: "갤러리" },
                  { href: "/exhibitions", label: "전시회" },
                  { href: "/artists", label: "작가" },
                  { href: "/epilogue", label: "에필로그" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="no-underline block"
                    style={{
                      padding: "14px 20px",
                      fontSize: "0.95rem",
                      fontFamily: "'Noto Serif KR', serif",
                      color: location === href || (href !== "/" && location.startsWith(href))
                        ? "#c9a96e"
                        : "rgba(240,235,224,0.85)",
                      background: location === href || (href !== "/" && location.startsWith(href))
                        ? "rgba(201,169,110,0.08)"
                        : "transparent",
                      borderBottom: "1px solid rgba(201,169,110,0.08)",
                      letterSpacing: "0.05em",
                      display: "block",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BGM 통합 컨트롤 — 뮤트 버튼 + 볼륨 슬라이더 팝업 */}
        {isPlaying && (
          <div className="relative" ref={panelRef}>
            {/* 뮤트/언뮤트 + 볼륨 팝업 토글 통합 버튼 */}
            <div className="flex items-center gap-1">
              {/* 뮤트 토글 버튼 */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "음악 켜기" : "음악 끄기"}
                style={{
                  background: "none",
                  border: `1px solid ${isMuted ? "rgba(201,169,110,0.2)" : "rgba(201,169,110,0.4)"}`,
                  borderRadius: "3px",
                  padding: "6px 8px",
                  color: isMuted ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.85)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  minWidth: "44px",
                  minHeight: "36px",
                  touchAction: "manipulation",
                }}
              >
                {isMuted ? <MusicOffIcon /> : <MusicOnIcon />}
                <span className="hidden sm:inline" style={{ fontSize: "0.48rem", letterSpacing: "0.12em", color: "inherit" }}>
                  {isMuted ? "OFF" : "ON"}
                </span>
              </button>
              {/* 볼륨 슬라이더 토글 버튼 */}
              <button
                onClick={() => setShowVolume((v) => !v)}
                aria-label="음량 조절"
                style={{
                  background: showVolume ? "rgba(201,169,110,0.12)" : "none",
                  border: "1px solid rgba(201,169,110,0.25)",
                  borderRadius: "3px",
                  padding: "6px 7px",
                  color: "rgba(201,169,110,0.7)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  minWidth: "36px",
                  minHeight: "36px",
                  touchAction: "manipulation",
                }}
              >
                <VolumeIcon muted={isMuted} />
              </button>
            </div>

            {/* 볼륨 슬라이더 팝업 — 가로 방향, 모바일 친화적 */}
            {showVolume && (
              <div
                className="absolute right-0 top-11"
                style={{
                  background: "rgba(12,10,20,0.97)",
                  border: "1px solid rgba(201,169,110,0.3)",
                  borderRadius: "6px",
                  zIndex: 300,
                  padding: "12px 16px",
                  minWidth: "180px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "0.52rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.1em", fontFamily: "sans-serif" }}>
                    음량
                  </span>
                  <span style={{ fontSize: "0.55rem", color: "#c9a96e", fontFamily: "sans-serif", fontWeight: 600 }}>
                    {isMuted ? "OFF" : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                {/* 가로 슬라이더 — 터치 친화적 */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onInput={(e) => setVolume(Number(e.currentTarget.value))}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    height: "20px",
                    accentColor: "#c9a96e",
                    cursor: "pointer",
                    touchAction: "none",
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: "0.4rem", color: "rgba(201,169,110,0.3)", fontFamily: "sans-serif" }}>0</span>
                  <span style={{ fontSize: "0.4rem", color: "rgba(201,169,110,0.3)", fontFamily: "sans-serif" }}>100</span>
                </div>
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
