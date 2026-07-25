/**
 * Home — AI 아트 갤러리 시네마틱 입장 화면
 * Design: "Cosmic Gallery" — 풀스크린 작품 슬라이드쇼 + Canvas 파티클 + 웅장한 타이틀
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { GalleryLayout, useBgm, BgmProvider } from "@/components/GalleryLayout";
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

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    // 파티클 생성
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      baseAlpha: number; pulse: number;
      color: string;
    }

    const COLORS = [
      "rgba(201,169,110,",   // 골드
      "rgba(180,140,255,",   // 보라
      "rgba(100,200,255,",   // 청록
      "rgba(255,255,255,",   // 흰
    ];

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: Math.random() * 2.2 + 0.4,
      alpha: 0,
      baseAlpha: Math.random() * 0.6 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // 빛줄기 (레이)
    interface Ray {
      x: number; y: number; angle: number;
      len: number; alpha: number; speed: number;
    }
    const rays: Ray[] = Array.from({ length: 6 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.4,
      angle: (Math.random() - 0.5) * 0.8,
      len: H * (0.4 + Math.random() * 0.4),
      alpha: Math.random() * 0.04 + 0.01,
      speed: (Math.random() - 0.5) * 0.002,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      // 빛줄기
      rays.forEach((r) => {
        r.angle += r.speed;
        const grd = ctx.createLinearGradient(
          r.x, r.y,
          r.x + Math.sin(r.angle) * r.len,
          r.y + Math.cos(r.angle) * r.len
        );
        grd.addColorStop(0, `rgba(201,169,110,${r.alpha * 3})`);
        grd.addColorStop(0.4, `rgba(201,169,110,${r.alpha})`);
        grd.addColorStop(1, "rgba(201,169,110,0)");
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(
          r.x + Math.sin(r.angle) * r.len,
          r.y + Math.cos(r.angle) * r.len
        );
        ctx.strokeStyle = grd;
        ctx.lineWidth = 60 + Math.sin(t) * 20;
        ctx.stroke();
      });

      // 파티클
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        p.pulse += 0.025;
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.pulse));

        // 마우스 인력 (부드럽게 끌림)
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx += dx * force * 0.0003;
          p.vy += dy * force * 0.0003;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        // 경계 처리
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // 글로우 효과
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = p.color + "0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();
        ctx.shadowBlur = 0;

        // 가까운 파티클 연결선
        particles.forEach((p2) => {
          const ddx = p2.x - p.x;
          const ddy = p2.y - p.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 80 && d > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201,169,110,${0.06 * (1 - d / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 3 }}
    />
  );
}

// ── 메인 홈 콘텐츠 ────────────────────────────────────────────────────────────
function HomeContent() {
  const [, setLocation] = useLocation();
  const { startBgm } = useBgm();
  const [entering, setEntering] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // 슬라이드쇼 상태
  const [slideIndex, setSlideIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const { data: allArtworks } = trpc.gallery.listAllArtworks.useQuery();
  const slideImages = (allArtworks ?? []).map((a) => ({
    url: a.mediaUrl ?? a.thumbnailUrl ?? "",
    title: a.titleKo,
  }));

  // 타이틀 등장 애니메이션 트리거
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  // 슬라이드 전환 (6초 간격, 켄번스 효과)
  useEffect(() => {
    if (slideImages.length < 2) return;
    const timer = setInterval(() => {
      const next = (slideIndex + 1) % slideImages.length;
      setNextIndex(next);
      setTransitioning(true);
      setTimeout(() => {
        setSlideIndex(next);
        setNextIndex(null);
        setTransitioning(false);
      }, 1200);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideImages.length, slideIndex]);

  const handleEnter = useCallback(async () => {
    setEntering(true);
    await startBgm();
    setTimeout(() => setLocation("/gallery"), 1000);
  }, [startBgm, setLocation]);

  const cur = slideImages[slideIndex];
  const nxt = nextIndex !== null ? slideImages[nextIndex] : null;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#04040c" }}>

      {/* ── 레이어 1: 배경 슬라이드쇼 (켄번스) ── */}
      {cur && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {/* 현재 슬라이드 */}
          <img
            key={`cur-${slideIndex}`}
            src={cur.url}
            alt={cur.title ?? ""}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: transitioning ? 0 : 1,
              transition: "opacity 1.2s ease-in-out",
              filter: "brightness(0.38) saturate(0.75)",
              transform: "scale(1.06)",
              animation: "kenburns 12s ease-in-out infinite alternate",
            }}
          />
          {/* 다음 슬라이드 (페이드인) */}
          {nxt && (
            <img
              key={`nxt-${nextIndex}`}
              src={nxt.url}
              alt={nxt.title ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: transitioning ? 1 : 0,
                transition: "opacity 1.2s ease-in-out",
                filter: "brightness(0.38) saturate(0.75)",
                transform: "scale(1.06)",
              }}
            />
          )}
        </div>
      )}

      {/* 기본 배경 (이미지 없을 때) */}
      {!cur && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background: "radial-gradient(ellipse 120% 100% at 50% 30%, #1a0a2e 0%, #04040c 70%)",
          }}
        />
      )}

      {/* ── 레이어 2: 그라디언트 오버레이 ── */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,80,200,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,0,0,0.9) 0%, transparent 70%)",
            "linear-gradient(to bottom, rgba(4,4,12,0.3) 0%, rgba(4,4,12,0.1) 40%, rgba(4,4,12,0.7) 80%, rgba(4,4,12,0.95) 100%)",
          ].join(", "),
        }}
      />

      {/* ── 레이어 3: Canvas 파티클 ── */}
      <ParticleCanvas />

      {/* ── 레이어 4: 메인 콘텐츠 ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {/* 상단 브랜드 라인 */}
        <div
          className="flex items-center gap-4 mb-10"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(-20px)",
            transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 0.2s",
          }}
        >
          <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.5)" }} />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              color: "rgba(201,169,110,0.7)",
              textTransform: "uppercase",
            }}
          >
            위드AI솔루션 × AI ART GALLERY
          </span>
          <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.5)" }} />
        </div>

        {/* 메인 타이틀 */}
        <div
          className="text-center mb-4 px-4"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0) scale(1)" : "translateY(30px) scale(0.96)",
            transition: "all 1.4s cubic-bezier(0.23,1,0.32,1) 0.4s",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.8rem, 8vw, 6.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "0.04em",
              background: "linear-gradient(135deg, #f0e6c8 0%, #c9a96e 40%, #e8d5a0 70%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              marginBottom: "0.5rem",
            }}
          >
            AI 아트 컬렉티브
          </h1>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(0.75rem, 2vw, 1rem)",
              letterSpacing: "0.5em",
              color: "rgba(201,169,110,0.55)",
              textTransform: "uppercase",
            }}
          >
            AI ART COLLECTIVE
          </p>
        </div>

        {/* 구분선 */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{
            opacity: revealed ? 1 : 0,
            transition: "opacity 1.2s ease 0.7s",
          }}
        >
          <div
            style={{
              width: "clamp(40px, 8vw, 80px)",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(201,169,110,0.6))",
            }}
          />
          <span style={{ color: "#c9a96e", fontSize: "0.7rem" }}>✦</span>
          <div
            style={{
              width: "clamp(40px, 8vw, 80px)",
              height: "1px",
              background: "linear-gradient(to left, transparent, rgba(201,169,110,0.6))",
            }}
          />
        </div>

        {/* 서브 카피 */}
        <p
          className="text-center mb-12 px-6"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: "clamp(0.9rem, 2.2vw, 1.15rem)",
            color: "rgba(220,210,195,0.75)",
            lineHeight: 1.8,
            letterSpacing: "0.04em",
            maxWidth: "520px",
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(15px)",
            transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 0.9s",
          }}
        >
          10인의 작가가 AI와 함께 그려낸<br />
          <span style={{ color: "rgba(201,169,110,0.85)" }}>상상과 감성의 세계</span>로 초대합니다
        </p>

        {/* 입장 버튼 */}
        <div
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 1.1s",
          }}
        >
          <button
            onClick={handleEnter}
            disabled={entering}
            className="group relative overflow-hidden"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
              letterSpacing: "0.4em",
              color: entering ? "rgba(201,169,110,0.5)" : "#c9a96e",
              background: "transparent",
              border: "1px solid rgba(201,169,110,0.5)",
              padding: "1rem 3rem",
              cursor: entering ? "not-allowed" : "pointer",
              transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
              textTransform: "uppercase",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!entering) {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,169,110,0.1)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,169,110,0.9)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(201,169,110,0.2), inset 0 0 30px rgba(201,169,110,0.05)";
                (e.currentTarget as HTMLButtonElement).style.color = "#e8d5a0";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,169,110,0.5)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.color = "#c9a96e";
            }}
          >
            {/* 버튼 코너 장식 */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "rgba(201,169,110,0.7)" }} />
            {entering ? "ENTERING..." : "ENTER GALLERY"}
          </button>

          {/* 보조 링크 */}
          <div className="text-center mt-5">
            <button
              onClick={() => setLocation("/gallery")}
              style={{
                background: "none",
                border: "none",
                fontFamily: "'Playfair Display', serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                color: "rgba(201,169,110,0.4)",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,169,110,0.75)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,169,110,0.4)"; }}
            >
              갤러리 바로가기 ↓
            </button>
          </div>
        </div>

        {/* 하단 정보 */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{
            opacity: revealed ? 1 : 0,
            transition: "opacity 1.5s ease 1.5s",
          }}
        >
          {/* 슬라이드 인디케이터 */}
          {slideImages.length > 1 && (
            <div className="flex items-center gap-1.5">
              {slideImages.slice(0, Math.min(slideImages.length, 12)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNextIndex(i);
                    setTransitioning(true);
                    setTimeout(() => { setSlideIndex(i); setNextIndex(null); setTransitioning(false); }, 1200);
                  }}
                  style={{
                    width: i === slideIndex ? "18px" : "5px",
                    height: "2px",
                    borderRadius: "1px",
                    background: i === slideIndex ? "rgba(201,169,110,0.8)" : "rgba(201,169,110,0.25)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.58rem",
              letterSpacing: "0.25em",
              color: "rgba(201,169,110,0.3)",
              textTransform: "uppercase",
            }}
          >
            ♪ 입장 시 배경음악이 재생됩니다 &nbsp;·&nbsp; CURATED BY MIN-KYUNG
          </p>
        </div>
      </div>

      {/* 켄번스 + 입장 전환 애니메이션 CSS */}
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.06) translate(0px, 0px); }
          100% { transform: scale(1.12) translate(-10px, -5px); }
        }
        @keyframes enterFlash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <BgmProvider>
      <HomeContent />
    </BgmProvider>
  );
}
