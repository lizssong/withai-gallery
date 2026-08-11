/**
 * Home — AI 아트 갤러리 시네마틱 입장 화면
 * Design: "Cosmic Gallery" — 풀스크린 슬라이드쇼 + Canvas 파티클 + 타이핑 효과 + 화이트 플래시 + 작가 티커
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { BgmProvider, useBgm } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

// ── Canvas 파티클 시스템 ──────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    interface Particle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; baseAlpha: number; pulse: number; color: string; }
    const COLORS = ["rgba(201,169,110,", "rgba(180,140,255,", "rgba(100,200,255,", "rgba(255,255,255,"];
    const particles: Particle[] = Array.from({ length: 130 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: Math.random() * 2.2 + 0.4, alpha: 0,
      baseAlpha: Math.random() * 0.6 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    interface Ray { x: number; y: number; angle: number; len: number; alpha: number; speed: number; }
    const rays: Ray[] = Array.from({ length: 6 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.4,
      angle: (Math.random() - 0.5) * 0.8,
      len: H * (0.4 + Math.random() * 0.4),
      alpha: Math.random() * 0.04 + 0.01,
      speed: (Math.random() - 0.5) * 0.002,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;
      rays.forEach((r) => {
        r.angle += r.speed;
        const grd = ctx.createLinearGradient(r.x, r.y, r.x + Math.sin(r.angle) * r.len, r.y + Math.cos(r.angle) * r.len);
        grd.addColorStop(0, `rgba(201,169,110,${r.alpha * 3})`);
        grd.addColorStop(0.4, `rgba(201,169,110,${r.alpha})`);
        grd.addColorStop(1, "rgba(201,169,110,0)");
        ctx.beginPath(); ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + Math.sin(r.angle) * r.len, r.y + Math.cos(r.angle) * r.len);
        ctx.strokeStyle = grd; ctx.lineWidth = 60 + Math.sin(t) * 20; ctx.stroke();
      });
      const mx = mouseRef.current.x; const my = mouseRef.current.y;
      particles.forEach((p) => {
        p.pulse += 0.025;
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const dx = mx - p.x; const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) { const f = (180 - dist) / 180; p.vx += dx * f * 0.0003; p.vy += dy * f * 0.0003; }
        p.vx *= 0.98; p.vy *= 0.98; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.shadowBlur = p.size * 4; ctx.shadowColor = p.color + "0.8)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")"; ctx.fill(); ctx.shadowBlur = 0;
        particles.forEach((p2) => {
          const ddx = p2.x - p.x; const ddy = p2.y - p.y; const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 80 && d > 0) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201,169,110,${0.06 * (1 - d / 80)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMouseMove); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 3 }} />;
}

// ── 타이핑 효과 훅 ────────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 80, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ── 작가 이름 티커 ────────────────────────────────────────────────────────────
function ArtistTicker({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const repeated = [...names, ...names, ...names];
  return (
    <div
      className="fixed left-0 right-0 overflow-hidden"
      style={{ bottom: "52px", zIndex: 8, maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
    >
      <div
        style={{
          display: "flex",
          gap: "0",
          animation: "ticker 28s linear infinite",
          whiteSpace: "nowrap",
        }}
      >
        {repeated.map((name, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(201,169,110,0.38)",
              textTransform: "uppercase",
              padding: "0 2rem",
            }}
          >
            {name}
            <span style={{ color: "rgba(201,169,110,0.18)", marginLeft: "2rem" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 메인 홈 콘텐츠 ────────────────────────────────────────────────────────────
function HomeContent() {
  const [, setLocation] = useLocation();
  const { startBgm } = useBgm();
  const [entering, setEntering] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // 슬라이드쇼
  const [slideIndex, setSlideIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const { data: allArtworks } = trpc.gallery.listAllArtworks.useQuery();
  const { data: artistsData } = trpc.gallery.listArtists.useQuery();

  const slideImages = (allArtworks ?? []).map((a) => ({
    url: a.mediaUrl ?? a.thumbnailUrl ?? "",
    title: a.titleKo,
  }));

  const artistNames = (artistsData ?? []).map((a) => a.name ?? a.nameEn ?? "");

  // 타이핑 효과 — 두 줄 타이틀
  const line1 = "AI아트작가 전시회";
  const line2 = "위드AI솔루션 · AI올인원과정 1기";
  const { displayed: typed1, done: done1 } = useTypewriter(line1, 90, 700);
  const { displayed: typed2, done: _done2 } = useTypewriter(line2, 60, done1 ? 200 : 99999);

  // 등장 애니메이션
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  // 슬라이드 전환
  useEffect(() => {
    if (slideImages.length < 2) return;
    const timer = setInterval(() => {
      const next = (slideIndex + 1) % slideImages.length;
      setNextIndex(next);
      setTransitioning(true);
      setTimeout(() => { setSlideIndex(next); setNextIndex(null); setTransitioning(false); }, 1200);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideImages.length, slideIndex]);

  // 입장 — 화이트 플래시 후 이동
  const handleEnter = useCallback(async () => {
    if (entering) return;
    setEntering(true);
    await startBgm();
    // 화이트 플래시 시작
    setFlashActive(true);
    setTimeout(() => setLocation("/gallery"), 900);
  }, [entering, startBgm, setLocation]);

  const cur = slideImages[slideIndex];
  const nxt = nextIndex !== null ? slideImages[nextIndex] : null;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#04040c" }}>

      {/* ── 화이트 플래시 오버레이 ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 100,
          background: "white",
          opacity: flashActive ? 1 : 0,
          transition: flashActive ? "opacity 0.5s ease-in" : "none",
        }}
      />

      {/* ── 레이어 1: 배경 슬라이드쇼 ── */}
      {cur && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <img
            key={`cur-${slideIndex}`}
            src={cur.url}
            alt={cur.title ?? ""}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: transitioning ? 0 : 1,
              transition: "opacity 1.2s ease-in-out",
              filter: "brightness(0.35) saturate(0.7)",
              animation: "kenburns 14s ease-in-out infinite alternate",
            }}
          />
          {nxt && (
            <img
              key={`nxt-${nextIndex}`}
              src={nxt.url}
              alt={nxt.title ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: transitioning ? 1 : 0,
                transition: "opacity 1.2s ease-in-out",
                filter: "brightness(0.35) saturate(0.7)",
              }}
            />
          )}
        </div>
      )}
      {!cur && (
        <div className="absolute inset-0" style={{ zIndex: 1, background: "radial-gradient(ellipse 120% 100% at 50% 30%, #1a0a2e 0%, #04040c 70%)" }} />
      )}

      {/* ── 레이어 2: 그라디언트 오버레이 ── */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,80,200,0.18) 0%, transparent 60%)",
            "linear-gradient(to bottom, rgba(4,4,12,0.25) 0%, rgba(4,4,12,0.05) 35%, rgba(4,4,12,0.65) 80%, rgba(4,4,12,0.96) 100%)",
          ].join(", "),
        }}
      />

      {/* ── 레이어 3: Canvas 파티클 ── */}
      <ParticleCanvas />

      {/* ── 레이어 4: 메인 콘텐츠 ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>

        {/* 브랜드 라인 */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(-16px)", transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 0.2s" }}
        >
          <div style={{ width: "36px", height: "1px", background: "rgba(201,169,110,0.45)" }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.6rem", letterSpacing: "0.32em", color: "rgba(201,169,110,0.6)", textTransform: "uppercase" }}>
            위드AI솔루션 × AI ART GALLERY
          </span>
          <div style={{ width: "36px", height: "1px", background: "rgba(201,169,110,0.45)" }} />
        </div>

        {/* 메인 타이틀 — 타이핑 효과 */}
        <div
          className="text-center mb-3 px-4"
          style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.8s ease 0.5s", minHeight: "clamp(4rem, 12vw, 9rem)" }}
        >
          {/* 1행: AI아트작가 전시회 */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 7vw, 5.8rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "0.04em",
              background: "linear-gradient(135deg, #f0e6c8 0%, #c9a96e 40%, #e8d5a0 70%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.3rem",
              minHeight: "1.2em",
            }}
          >
            {typed1}
            {/* 커서 */}
            {!done1 && (
              <span style={{ WebkitTextFillColor: "rgba(201,169,110,0.8)", animation: "blink 0.7s step-end infinite" }}>|</span>
            )}
          </h1>

          {/* 2행: 위드AI솔루션 · AI올인원과정 1기 */}
          <h2
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: "clamp(0.95rem, 2.5vw, 1.6rem)",
              fontWeight: 400,
              letterSpacing: "0.12em",
              color: "rgba(201,169,110,0.75)",
              minHeight: "1.4em",
            }}
          >
            {done1 ? typed2 : ""}
            {done1 && !_done2 && (
              <span style={{ color: "rgba(201,169,110,0.6)", animation: "blink 0.7s step-end infinite" }}>|</span>
            )}
          </h2>
        </div>

        {/* 구분선 */}
        <div
          className="flex items-center gap-4 mb-7"
          style={{ opacity: done1 ? 1 : 0, transition: "opacity 1s ease 0.3s" }}
        >
          <div style={{ width: "clamp(30px, 6vw, 70px)", height: "1px", background: "linear-gradient(to right, transparent, rgba(201,169,110,0.55))" }} />
          <span style={{ color: "#c9a96e", fontSize: "0.65rem" }}>✦</span>
          <div style={{ width: "clamp(30px, 6vw, 70px)", height: "1px", background: "linear-gradient(to left, transparent, rgba(201,169,110,0.55))" }} />
        </div>

        {/* 서브 카피 */}
        <p
          className="text-center mb-10 px-6"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
            color: "rgba(220,210,195,0.7)",
            lineHeight: 1.85,
            letterSpacing: "0.04em",
            maxWidth: "480px",
            opacity: done1 ? 1 : 0,
            transform: done1 ? "translateY(0)" : "translateY(12px)",
            transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.2s",
          }}
        >
          AI와 함께 그려낸 작가들의 상상과 감성,<br />
          <span style={{ color: "rgba(201,169,110,0.8)" }}>그 빛나는 세계</span>로 초대합니다
        </p>

        {/* ENTER GALLERY 버튼 */}
        <div
          style={{
            opacity: done1 ? 1 : 0,
            transform: done1 ? "translateY(0)" : "translateY(16px)",
            transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.4s",
          }}
        >
          <button
            onClick={handleEnter}
            disabled={entering}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)",
              letterSpacing: "0.42em",
              color: entering ? "rgba(201,169,110,0.4)" : "#c9a96e",
              background: "transparent",
              border: "1px solid rgba(201,169,110,0.5)",
              padding: "1rem 3.2rem",
              cursor: entering ? "not-allowed" : "pointer",
              transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
              textTransform: "uppercase",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!entering) {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "rgba(201,169,110,0.1)";
                b.style.borderColor = "rgba(201,169,110,0.9)";
                b.style.boxShadow = "0 0 35px rgba(201,169,110,0.22), inset 0 0 30px rgba(201,169,110,0.06)";
                b.style.color = "#e8d5a0";
                b.style.letterSpacing = "0.48em";
              }
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "transparent";
              b.style.borderColor = "rgba(201,169,110,0.5)";
              b.style.boxShadow = "none";
              b.style.color = "#c9a96e";
              b.style.letterSpacing = "0.42em";
            }}
          >
            {/* 코너 장식 */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            {entering ? "ENTERING  ···" : "ENTER  GALLERY"}
          </button>

          {/* 갤러리 바로가기 */}
          <div className="text-center mt-5">
            <button
              onClick={() => setLocation("/gallery")}
              style={{
                background: "none", border: "none",
                fontFamily: "'Playfair Display', serif",
                fontSize: "0.6rem", letterSpacing: "0.28em",
                color: "rgba(201,169,110,0.35)", cursor: "pointer",
                textTransform: "uppercase", transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,169,110,0.7)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,169,110,0.35)"; }}
            >
              갤러리 바로가기  ↓
            </button>
          </div>
        </div>
      </div>

      {/* ── 작가 이름 티커 ── */}
      <div
        style={{
          opacity: done1 ? 1 : 0,
          transition: "opacity 1.5s ease 1s",
        }}
      >
        <ArtistTicker names={artistNames.length > 0 ? artistNames : ["MIN-KYUNG", "AI ART COLLECTIVE", "위드AI솔루션", "AI올인원과정 1기"]} />
      </div>

      {/* ── 하단 정보 ── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 9, opacity: revealed ? 1 : 0, transition: "opacity 2s ease 2s" }}
      >
        {/* 슬라이드 인디케이터 */}
        {slideImages.length > 1 && (
          <div className="flex items-center gap-1.5">
            {slideImages.slice(0, Math.min(slideImages.length, 14)).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setNextIndex(i); setTransitioning(true);
                  setTimeout(() => { setSlideIndex(i); setNextIndex(null); setTransitioning(false); }, 1200);
                }}
                style={{
                  width: i === slideIndex ? "16px" : "4px", height: "2px", borderRadius: "1px",
                  background: i === slideIndex ? "rgba(201,169,110,0.75)" : "rgba(201,169,110,0.22)",
                  border: "none", cursor: "pointer", transition: "all 0.4s ease", padding: 0,
                }}
              />
            ))}
          </div>
        )}
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(201,169,110,0.28)", textTransform: "uppercase" }}>
          ♪ 입장 시 배경음악이 재생됩니다
        </p>
      </div>

      {/* 애니메이션 CSS */}
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.06) translate(0px, 0px); }
          100% { transform: scale(1.13) translate(-12px, -6px); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <HomeContent />
  );
}
