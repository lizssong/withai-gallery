/**
 * Home — 전시회 초대장 페이지
 * Design: "Ink & Light" — 먹빛 배경, 화선지 카드, 주홍 씰
 * 배경: 전체 작품 자동 슬라이드쇼 (5초 간격 크로스페이드)
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GalleryLayout, useBgm } from "@/components/GalleryLayout";
import { BgmProvider } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

function HomeContent() {
  const [, setLocation] = useLocation();
  const { startBgm } = useBgm();
  const [entering, setEntering] = useState(false);

  // ── 슬라이드쇼 상태 ──────────────────────────────────────────────────────
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  // 모든 작가의 이미지 작품 목록 (슬라이드쇼용)
  const { data: allArtworks } = trpc.gallery.listAllArtworks.useQuery();

  // 슬라이드 이미지 목록 — 이미지 타입 작품만 (서버에서 이미 필터됨)
  const slideImages = (allArtworks ?? []).map((a) => ({
    url: a.thumbnailUrl ?? a.mediaUrl ?? "",
    title: a.titleKo,
  }));

  // 5초마다 슬라이드 전환
  useEffect(() => {
    if (slideImages.length < 2) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPrevIndex(slideIndex);
        setSlideIndex((prev) => (prev + 1) % slideImages.length);
        setFading(false);
      }, 800);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages.length, slideIndex]);

  const handleEnter = async () => {
    setEntering(true);
    await startBgm();
    setTimeout(() => setLocation("/gallery"), 800);
  };

  const currentSlide = slideImages[slideIndex];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* ── 배경 슬라이드쇼 ── */}
      {currentSlide && (
        <div className="fixed inset-0 z-0">
          {/* 현재 슬라이드 */}
          <img
            key={slideIndex}
            src={currentSlide.url}
            alt={currentSlide.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: fading ? 0 : 1,
              transition: "opacity 0.8s cubic-bezier(0.23,1,0.32,1)",
              filter: "brightness(0.22) saturate(0.6)",
            }}
          />
          {/* 다크 오버레이 */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,169,110,0.04) 0%, rgba(12,10,20,0.72) 60%)",
            }}
          />
        </div>
      )}

      {/* 슬라이드쇼 없을 때 기본 배경 */}
      {!currentSlide && (
        <div
          className="fixed inset-0 z-0"
          style={{ background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,169,110,0.06) 0%, #12121e 55%)" }}
        />
      )}

      {/* 배경 파티클 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              background: "rgba(201,169,110,0.25)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* 슬라이드 인디케이터 — 하단 중앙 */}
      {slideImages.length > 1 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
        >
          {slideImages.map((_item, i) => (
            <button
              key={i}
              onClick={() => { setPrevIndex(slideIndex); setSlideIndex(i); }}
              style={{
                width: i === slideIndex ? "20px" : "6px",
                height: "4px",
                borderRadius: "2px",
                background: i === slideIndex ? "#c9a96e" : "rgba(201,169,110,0.3)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── 초대장 카드 ── */}
      <div
        className="relative w-full max-w-md z-10"
        style={{
          background: "linear-gradient(160deg, #f5f0e8 0%, #ede8dc 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.2)",
          padding: "3rem 2.5rem 2.5rem",
          animation: "fadeInUp 0.9s cubic-bezier(0.23,1,0.32,1) both",
        }}
      >
        {/* 씰 스탬프 */}
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, #c0392b 60%, #922b21 100%)",
            boxShadow: "0 4px 16px rgba(192,57,43,0.5)",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>✦</span>
        </div>

        {/* 브랜드 */}
        <div className="text-center mb-6">
          <p
            className="gallery-caption tracking-widest mb-1"
            style={{ fontSize: "0.72rem", color: "#8b7355", letterSpacing: "0.2em" }}
          >
            위드AI솔루션 × AI ART GALLERY
          </p>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(139,115,85,0.4), transparent)",
              margin: "0.75rem 0",
            }}
          />
          <p
            className="gallery-caption tracking-widest"
            style={{ fontSize: "0.65rem", color: "#a08060", letterSpacing: "0.18em" }}
          >
            INVITATION
          </p>
        </div>

        {/* 전시 제목 */}
        <div className="text-center mb-6">
          <h1
            className="gallery-title"
            style={{ fontSize: "1.9rem", color: "#2c1f0e", lineHeight: 1.25, marginBottom: "0.4rem" }}
          >
            AI 아트 컬렉티브
          </h1>
          <p
            className="gallery-caption tracking-widest"
            style={{ fontSize: "0.72rem", color: "#8b7355", letterSpacing: "0.18em" }}
          >
            AI ART COLLECTIVE
          </p>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex: 1, height: "1px", background: "rgba(139,115,85,0.25)" }} />
          <span style={{ color: "#c9a96e", fontSize: "0.7rem" }}>✦</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(139,115,85,0.25)" }} />
        </div>

        {/* 초대 문구 */}
        <p
          className="text-center mb-6 leading-relaxed"
          style={{ fontSize: "0.95rem", color: "#4a3728", fontFamily: "'Noto Serif KR', serif" }}
        >
          10인의 작가가 AI와 함께 그려낸<br />
          상상과 감성의 세계로 초대합니다.
        </p>

        {/* 전시 정보 */}
        <div
          className="mb-6 py-3 px-4"
          style={{ background: "rgba(139,115,85,0.08)", border: "1px solid rgba(139,115,85,0.15)" }}
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "기획", value: "민경 (크리메타쏭)" },
              { label: "참여 작가", value: "10인" },
              { label: "장르", value: "AI 생성 아트" },
              { label: "시즌", value: "SPRING" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="gallery-caption"
                  style={{ fontSize: "0.6rem", color: "#8b7355", letterSpacing: "0.12em", marginBottom: "1px" }}
                >
                  {label}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#2c1f0e", fontFamily: "'Noto Serif KR', serif", fontWeight: 600 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BGM 안내 */}
        <p
          className="text-center gallery-caption mb-4"
          style={{ fontSize: "0.65rem", color: "#a08060", letterSpacing: "0.1em" }}
        >
          ♪ 입장 시 잔잔한 배경음악이 재생됩니다
        </p>

        {/* 입장 버튼 */}
        <button
          onClick={handleEnter}
          disabled={entering}
          className="w-full transition-all duration-300 active:scale-95"
          style={{
            background: entering
              ? "rgba(44,31,14,0.5)"
              : "linear-gradient(135deg, #2c1f0e 0%, #4a3728 100%)",
            color: "#c9a96e",
            border: "1px solid rgba(201,169,110,0.4)",
            padding: "0.9rem",
            letterSpacing: "0.25em",
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.85rem",
            cursor: entering ? "not-allowed" : "pointer",
          }}
        >
          {entering ? "입장 중..." : "전시회 입장하기"}
        </button>

        {/* 전시회 목록 바로가기 */}
        <div className="text-center mt-3">
          <button
            onClick={() => setLocation("/gallery")}
            className="gallery-caption transition-all duration-200 hover:opacity-80"
            style={{
              background: "none",
              border: "1px solid rgba(139,115,85,0.3)",
              color: "#6b5340",
              padding: "7px 18px",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              cursor: "pointer",
              width: "100%",
            }}
          >
            갤러리 더 보기 →
          </button>
        </div>

        {/* 하단 장식 */}
        <div className="text-center mt-3">
          <p
            className="gallery-caption"
            style={{ fontSize: "0.6rem", color: "#b09070", letterSpacing: "0.12em" }}
          >
            CURATED BY MIN-KYUNG · CRIMETASONG
          </p>
        </div>
      </div>
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
