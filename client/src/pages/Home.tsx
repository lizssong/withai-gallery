/**
 * Home — 전시회 초대장 페이지
 * Design: "Ink & Light" — 먹빛 배경, 화선지 카드, 주홍 씰
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GalleryLayout, useBgm } from "@/components/GalleryLayout";
import { BgmProvider } from "@/components/GalleryLayout";

function HomeContent() {
  const [, setLocation] = useLocation();
  const { startBgm } = useBgm();
  const [entering, setEntering] = useState(false);

  const handleEnter = async () => {
    setEntering(true);
    await startBgm();
    setTimeout(() => setLocation("/artists"), 800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 ink-bg"
      style={{ background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,169,110,0.06) 0%, #12121e 55%)" }}
    >
      {/* 배경 파티클 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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

      {/* 초대장 카드 */}
      <div
        className="relative w-full max-w-md"
        style={{
          background: "linear-gradient(160deg, #f5f0e8 0%, #ede8dc 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,110,0.2)",
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
            style={{ fontSize: "0.55rem", color: "#8b7355", letterSpacing: "0.25em" }}
          >
            크리메타쏭 × AI ART GALLERY
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
            style={{ fontSize: "0.5rem", color: "#a08060", letterSpacing: "0.2em" }}
          >
            SPRING 2025 — INVITATION
          </p>
        </div>

        {/* 전시 제목 */}
        <div className="text-center mb-6">
          <h1
            className="gallery-title"
            style={{ fontSize: "1.7rem", color: "#2c1f0e", lineHeight: 1.25, marginBottom: "0.4rem" }}
          >
            AI 아트 컬렉티브
          </h1>
          <p
            className="gallery-caption tracking-widest"
            style={{ fontSize: "0.6rem", color: "#8b7355", letterSpacing: "0.2em" }}
          >
            AI ART COLLECTIVE 2025
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
          style={{ fontSize: "0.82rem", color: "#4a3728", fontFamily: "'Noto Serif KR', serif" }}
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
              { label: "시즌", value: "SPRING 2025" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="gallery-caption"
                  style={{ fontSize: "0.45rem", color: "#8b7355", letterSpacing: "0.15em", marginBottom: "1px" }}
                >
                  {label.toUpperCase()}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#2c1f0e", fontFamily: "'Noto Serif KR', serif" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BGM 안내 */}
        <p
          className="text-center gallery-caption mb-4"
          style={{ fontSize: "0.48rem", color: "#a08060", letterSpacing: "0.12em" }}
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
            padding: "0.85rem",
            letterSpacing: "0.25em",
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.7rem",
            cursor: entering ? "not-allowed" : "pointer",
          }}
        >
          {entering ? "입장 중..." : "전시회 입장하기"}
        </button>

        {/* 하단 장식 */}
        <div className="text-center mt-4">
          <p
            className="gallery-caption"
            style={{ fontSize: "0.42rem", color: "#b09070", letterSpacing: "0.15em" }}
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
