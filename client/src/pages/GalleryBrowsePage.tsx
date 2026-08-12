/**
 * GalleryBrowsePage — 갤러리 둘러보기
 * 모든 작가의 작품을 마소너리(Masonry) 그리드로 전시
 * 클릭 시 풀스크린 라이트박스 뷰어 오픈
 */
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { GalleryLayout } from "@/components/GalleryLayout";
import ZoomableImage from "@/components/ZoomableImage";
import { getNavigationButtonStyle } from "@/lib/navigationControls";

interface Artwork {
  id: number;
  artistId: number;
  titleKo: string | null;
  titleEn: string | null;
  description: string | null;
  medium: string | null;
  mediaType: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  aiPrompt: string | null;
  tags: string | null;
}

// ── 라이트박스 ────────────────────────────────────────────────────────────────
function Lightbox({
  artwork,
  artworks,
  onClose,
  onPrev,
  onNext,
}: {
  artwork: Artwork;
  artworks: Artwork[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const idx = artworks.findIndex((a) => a.id === artwork.id);

  // 키보드 탐색
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const copyPrompt = () => {
    if (!artwork.aiPrompt) return;
    navigator.clipboard.writeText(artwork.aiPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const parsedTags: string[] = (() => {
    try { return JSON.parse(artwork.tags ?? "[]"); } catch { return []; }
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(8,8,16,0.96)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-70"
        style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e" }}
        aria-label="닫기"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* 이전 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          ...getNavigationButtonStyle(),
          gap: "1px",
        }}
        aria-label="이전 작품"
        title="이전 작품"
      >
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span style={{ fontSize: "0.48rem", lineHeight: 1, fontWeight: 700, letterSpacing: "0.08em" }}>이전</span>
      </button>

      {/* 다음 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          ...getNavigationButtonStyle(),
          gap: "1px",
        }}
        aria-label="다음 작품"
        title="다음 작품"
      >
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ fontSize: "0.48rem", lineHeight: 1, fontWeight: 700, letterSpacing: "0.08em" }}>다음</span>
      </button>

      {/* 메인 콘텐츠 */}
      <div
        className="relative flex flex-col lg:flex-row gap-0 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
        style={{ borderRadius: "4px", border: "1px solid rgba(201,169,110,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 영역 — ZoomableImage */}
        <ZoomableImage
          src={artwork.mediaUrl ?? ""}
          alt={artwork.titleKo ?? ""}
          className="flex-1 min-h-0"
          style={{ background: "#0a0a14", maxHeight: "90vh", minHeight: "300px" }}
        />

        {/* 정보 패널 */}
        <div
          className="lg:w-72 flex flex-col overflow-y-auto"
          style={{ background: "rgba(12,12,22,0.98)", borderLeft: "1px solid rgba(201,169,110,0.12)", padding: "28px 22px" }}
        >
          {/* 번호 */}
          <p className="gallery-caption mb-3" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(201,169,110,0.5)" }}>
            {String(idx + 1).padStart(2, "0")} / {String(artworks.length).padStart(2, "0")}
          </p>

          {/* 제목 */}
          <h2 className="mb-1 leading-snug" style={{ fontFamily: "'Noto Serif KR', serif", fontSize: "1.15rem", color: "#f0ebe0", fontWeight: 500 }}>
            {artwork.titleKo ?? artwork.titleEn ?? "Untitled"}
          </h2>
          {artwork.titleEn && artwork.titleKo && (
            <p className="gallery-caption mb-4" style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(201,169,110,0.6)" }}>
              {artwork.titleEn}
            </p>
          )}

          {/* 미디엄 */}
          {artwork.medium && (
            <p className="mb-4" style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.45)", fontStyle: "italic" }}>
              {artwork.medium}
            </p>
          )}

          {/* 설명 */}
          {artwork.description && (
            <p className="mb-5 leading-relaxed" style={{ fontSize: "0.82rem", color: "rgba(240,235,224,0.7)", lineHeight: 1.75 }}>
              {artwork.description}
            </p>
          )}

          {/* 태그 */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {parsedTags.map((tag) => (
                <span
                  key={tag}
                  className="gallery-caption"
                  style={{
                    fontSize: "0.6rem", letterSpacing: "0.08em",
                    padding: "2px 8px",
                    border: "1px solid rgba(201,169,110,0.25)",
                    color: "rgba(201,169,110,0.7)",
                    borderRadius: "2px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* AI 프롬프트 */}
          {artwork.aiPrompt && (
            <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}>
              <button
                onClick={() => setShowPrompt((p) => !p)}
                className="flex items-center gap-2 mb-2 transition-all hover:opacity-80"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <span className="gallery-caption" style={{ fontSize: "0.62rem", letterSpacing: "0.15em", color: "rgba(201,169,110,0.7)" }}>
                  AI PROMPT
                </span>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="2"
                  style={{ transform: showPrompt ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showPrompt && (
                <div className="relative">
                  <p
                    className="leading-relaxed pr-8"
                    style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.5)", lineHeight: 1.7, fontStyle: "italic" }}
                  >
                    {artwork.aiPrompt}
                  </p>
                  <button
                    onClick={copyPrompt}
                    className="absolute top-0 right-0 transition-all hover:opacity-80"
                    style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#c9a96e" : "rgba(201,169,110,0.45)" }}
                    title="프롬프트 복사"
                  >
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 인디케이터 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {artworks.map((a, i) => (
          <div
            key={a.id}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? "20px" : "6px",
              height: "6px",
              background: i === idx ? "#c9a96e" : "rgba(201,169,110,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── 마소너리 카드 ──────────────────────────────────────────────────────────────
function ArtworkCard({ artwork, onClick }: { artwork: Artwork; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const parsedTags: string[] = (() => {
    try { return JSON.parse(artwork.tags ?? "[]"); } catch { return []; }
  })();

  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      style={{
        borderRadius: "3px",
        border: "1px solid rgba(201,169,110,0.1)",
        breakInside: "avoid",
        marginBottom: "12px",
        transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s",
        transform: hovered ? "scale(1.015)" : "scale(1)",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.7)" : "0 2px 12px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <img
        src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""}
        alt={artwork.titleKo ?? ""}
        className="w-full block"
        style={{ display: "block" }}
        loading="lazy"
      />

      {/* 호버 오버레이 */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4"
        style={{
          background: "linear-gradient(to top, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.4) 50%, transparent 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        <h3
          className="leading-snug mb-1"
          style={{ fontFamily: "'Noto Serif KR', serif", fontSize: "0.95rem", color: "#f0ebe0", fontWeight: 500 }}
        >
          {artwork.titleKo ?? artwork.titleEn ?? "Untitled"}
        </h3>
        {artwork.medium && (
          <p style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.75)", fontStyle: "italic", marginBottom: "6px" }}>
            {artwork.medium}
          </p>
        )}
        {parsedTags.slice(0, 3).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {parsedTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="gallery-caption"
                style={{
                  fontSize: "0.55rem", letterSpacing: "0.06em",
                  padding: "1px 6px",
                  border: "1px solid rgba(201,169,110,0.3)",
                  color: "rgba(201,169,110,0.8)",
                  borderRadius: "2px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* 확대 아이콘 */}
        <div
          className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full"
          style={{ background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.35)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2">
            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function GalleryBrowsePage() {
  const [, navigate] = useLocation();
  const { data: artworks = [], isLoading } = trpc.gallery.listAllArtworks.useQuery();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | string>("all");

  // 태그 목록 수집
  const allTags = Array.from(
    new Set(
      artworks.flatMap((a) => {
        try { return JSON.parse(a.tags ?? "[]") as string[]; } catch { return []; }
      })
    )
  ).slice(0, 12);

  // 필터링
  const filtered = filter === "all"
    ? artworks
    : artworks.filter((a) => {
        try {
          const tags = JSON.parse(a.tags ?? "[]") as string[];
          return tags.includes(filter);
        } catch { return false; }
      });

  // 3열 마소너리 분배
  const cols: Artwork[][] = [[], [], []];
  filtered.forEach((a, i) => cols[i % 3].push(a));

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevArtwork = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);
  const nextArtwork = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  return (
    <GalleryLayout>
      <div className="min-h-screen" style={{ background: "#0c0c18" }}>
        {/* 히어로 헤더 */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-6"
          style={{
            paddingTop: "80px",
            paddingBottom: "48px",
            background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,169,110,0.08) 0%, transparent 70%)",
          }}
        >
          <p
            className="gallery-caption mb-3"
            style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "rgba(201,169,110,0.6)" }}
          >
            AI ART COLLECTIVE
          </p>
          <h1
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "#f0ebe0",
              fontWeight: 400,
              letterSpacing: "0.05em",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            갤러리 둘러보기
          </h1>
          <p style={{ fontSize: "0.88rem", color: "rgba(240,235,224,0.5)", maxWidth: "480px", lineHeight: 1.8 }}>
            AI와 함께 탄생한 작품들을 자유롭게 감상하세요.<br />
            작품을 클릭하면 상세 정보와 AI 프롬프트를 확인할 수 있습니다.
          </p>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mt-6">
            <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
            <div style={{ width: "5px", height: "5px", background: "#c9a96e", transform: "rotate(45deg)" }} />
            <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
          </div>
        </div>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 px-6 pb-8">
            <button
              onClick={() => setFilter("all")}
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                fontSize: "0.65rem", letterSpacing: "0.12em",
                padding: "5px 14px",
                border: `1px solid ${filter === "all" ? "rgba(201,169,110,0.7)" : "rgba(201,169,110,0.2)"}`,
                color: filter === "all" ? "#c9a96e" : "rgba(201,169,110,0.5)",
                background: filter === "all" ? "rgba(201,169,110,0.08)" : "transparent",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              ALL
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{
                  fontSize: "0.65rem", letterSpacing: "0.12em",
                  padding: "5px 14px",
                  border: `1px solid ${filter === tag ? "rgba(201,169,110,0.7)" : "rgba(201,169,110,0.2)"}`,
                  color: filter === tag ? "#c9a96e" : "rgba(201,169,110,0.5)",
                  background: filter === tag ? "rgba(201,169,110,0.08)" : "transparent",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* 작품 수 */}
        <div className="text-center pb-6">
          <span className="gallery-caption" style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(201,169,110,0.4)" }}>
            {isLoading ? "로딩 중..." : `${filtered.length} WORKS`}
          </span>
        </div>

        {/* 마소너리 그리드 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(201,169,110,0.2)", borderTopColor: "#c9a96e" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p style={{ color: "rgba(240,235,224,0.3)", fontSize: "0.9rem" }}>작품이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 데스크톱: 3열 마소너리 */}
            <div className="hidden md:flex gap-3 px-6 pb-16" style={{ alignItems: "flex-start" }}>
              {cols.map((col, ci) => (
                <div key={ci} className="flex-1">
                  {col.map((artwork) => {
                    const globalIdx = filtered.findIndex((a) => a.id === artwork.id);
                    return (
                      <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        onClick={() => openLightbox(globalIdx)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 모바일: 2열 그리드 */}
            <div className="md:hidden grid grid-cols-2 gap-2 px-3 pb-16">
              {filtered.map((artwork, idx) => (
                <div
                  key={artwork.id}
                  className="relative overflow-hidden cursor-pointer"
                  style={{ borderRadius: "3px", border: "1px solid rgba(201,169,110,0.1)" }}
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""}
                    alt={artwork.titleKo ?? ""}
                    className="w-full block"
                    loading="lazy"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2"
                    style={{ background: "linear-gradient(to top, rgba(8,8,16,0.85) 0%, transparent 100%)" }}
                  >
                    <p style={{ fontSize: "0.65rem", color: "#f0ebe0", lineHeight: 1.3 }}>
                      {artwork.titleKo ?? artwork.titleEn ?? ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 하단 CTA */}
        {!isLoading && filtered.length > 0 && (
          <div className="text-center pb-20">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div style={{ width: "60px", height: "1px", background: "rgba(201,169,110,0.2)" }} />
              <div style={{ width: "4px", height: "4px", background: "rgba(201,169,110,0.4)", transform: "rotate(45deg)" }} />
              <div style={{ width: "60px", height: "1px", background: "rgba(201,169,110,0.2)" }} />
            </div>
            <p className="gallery-caption mb-4" style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(201,169,110,0.5)" }}>
              작가를 더 알고 싶으신가요?
            </p>
            <button
              onClick={() => navigate("/artists")}
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                fontSize: "0.72rem", letterSpacing: "0.2em",
                padding: "10px 28px",
                border: "1px solid rgba(201,169,110,0.4)",
                color: "#c9a96e",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              작가 소개 보기 →
            </button>
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <Lightbox
          artwork={filtered[lightboxIdx]}
          artworks={filtered}
          onClose={closeLightbox}
          onPrev={prevArtwork}
          onNext={nextArtwork}
        />
      )}
    </GalleryLayout>
  );
}
