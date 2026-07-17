/**
 * ArtistDetailPage — 작품 중심 레이아웃
 * - 데스크톱: 작품 클릭 시 우측 패널 슬라이드인
 * - 모바일: 작품 클릭 시 하단 슬라이드업 시트
 * - AI 프롬프트 섹션 포함
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

// ── 공유 작품 상세 콘텐츠 ────────────────────────────────────────────────────
function ArtworkDetailContent({
  artwork,
  artistId,
  onFullscreen,
  onClose,
}: {
  artwork: {
    id: number; titleKo: string; titleEn?: string | null;
    mediaUrl?: string | null; thumbnailUrl?: string | null; mediaType: string;
    description?: string | null; year?: string | null; medium?: string | null;
    tags?: string | null; aiPrompt?: string | null; likeCount?: number | null;
  };
  artistId: number;
  onFullscreen: () => void;
  onClose: () => void;
}) {
  const parseTags = (tags?: string | null) =>
    tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <>
      {/* 작품 미리보기 */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {artwork.mediaType === "video" ? (
          <video
            src={artwork.mediaUrl ?? ""}
            className="w-full h-full object-cover"
            controls autoPlay muted playsInline
          />
        ) : (
          <img
            src={artwork.mediaUrl ?? artwork.thumbnailUrl ?? ""}
            alt={artwork.titleKo}
            className="w-full h-full object-cover"
            onClick={onFullscreen}
            style={{ cursor: "zoom-in" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,10,20,0.5) 0%, transparent 50%)", pointerEvents: "none" }} />
      </div>

      {/* 상세 정보 */}
      <div className="p-4">
        <h2 style={{ fontSize: "1.2rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 700, lineHeight: 1.3, marginBottom: "4px" }}>
          {artwork.titleKo}
        </h2>
        {artwork.titleEn && (
          <p style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.55)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "12px" }}>
            {artwork.titleEn.toUpperCase()}
          </p>
        )}

        {/* 메타 */}
        <div style={{ borderTop: "1px solid rgba(201,169,110,0.12)", paddingTop: "12px", marginBottom: "12px" }}>
          {[
            { label: "연도", value: artwork.year },
            { label: "매체", value: artwork.medium },
            { label: "유형", value: artwork.mediaType === "video" ? "영상 작품" : "이미지 작품" },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-2 mb-2">
              <span style={{ fontSize: "0.7rem", color: "#c9a96e", fontFamily: "sans-serif", letterSpacing: "0.1em", minWidth: "36px", flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: "0.88rem", color: "rgba(240,235,224,0.75)", fontFamily: "'Noto Serif KR', serif" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* 작품 설명 */}
        {artwork.description && (
          <div style={{ borderTop: "1px solid rgba(201,169,110,0.12)", paddingTop: "12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "0.7rem", color: "#c9a96e", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "6px" }}>DESCRIPTION</p>
            <p style={{ fontSize: "0.9rem", color: "rgba(240,235,224,0.72)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.85 }}>
              {artwork.description}
            </p>
          </div>
        )}

        {/* AI 프롬프트 */}
        {artwork.aiPrompt && (
          <div style={{ borderTop: "1px solid rgba(201,169,110,0.12)", paddingTop: "12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "0.7rem", color: "#c9a96e", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "6px" }}>AI PROMPT</p>
            <p style={{
              fontSize: "0.82rem", color: "rgba(240,235,224,0.6)", fontFamily: "monospace",
              lineHeight: 1.7, background: "rgba(201,169,110,0.05)",
              border: "1px solid rgba(201,169,110,0.12)", padding: "10px 12px",
              wordBreak: "break-all",
            }}>
              {artwork.aiPrompt}
            </p>
          </div>
        )}

        {/* 태그 */}
        {parseTags(artwork.tags).length > 0 && (
          <div style={{ borderTop: "1px solid rgba(201,169,110,0.12)", paddingTop: "12px", marginBottom: "14px" }}>
            <p style={{ fontSize: "0.7rem", color: "#c9a96e", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "7px" }}>TAGS</p>
            <div className="flex flex-wrap gap-1.5">
              {parseTags(artwork.tags).map((tag) => (
                <span key={tag} style={{ fontSize: "0.78rem", color: "rgba(201,169,110,0.65)", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.15)", padding: "3px 9px", fontFamily: "sans-serif" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 좋아요 */}
        {artwork.likeCount != null && artwork.likeCount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontSize: "1rem", color: "rgba(220,80,60,0.8)" }}>♥</span>
            <span style={{ fontSize: "0.88rem", color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif" }}>
              {artwork.likeCount}명이 좋아합니다
            </span>
          </div>
        )}

        {/* 전체화면 버튼 */}
        <button
          onClick={onFullscreen}
          className="w-full transition-all duration-150 active:scale-95 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)", border: "none", color: "#1c1a2e", padding: "10px 0", fontSize: "0.82rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer" }}
        >
          전체 화면으로 보기 →
        </button>
      </div>
    </>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedArtwork, setSelectedArtwork] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 모바일 시트 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isMobile && selectedArtwork !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, selectedArtwork]);

  const artistId = parseInt(params.id ?? "0", 10);
  const { data: artist, isLoading: artistLoading } = trpc.gallery.getArtist.useQuery(
    { id: artistId },
    { enabled: !isNaN(artistId) && artistId > 0 }
  );
  const { data: artworkList, isLoading: artworksLoading } = trpc.gallery.listArtworks.useQuery(
    { artistId },
    { enabled: !isNaN(artistId) && artistId > 0 }
  );
  const { data: allArtists } = trpc.gallery.listArtists.useQuery();

  const artistIndex = allArtists?.findIndex((a) => a.id === artistId) ?? -1;
  const prevArtist = artistIndex > 0 ? allArtists?.[artistIndex - 1] : null;
  const nextArtist = allArtists && artistIndex < allArtists.length - 1 ? allArtists[artistIndex + 1] : null;

  const artworks = artworkList ?? [];
  const selected = artworks.find((a) => a.id === selectedArtwork) ?? null;

  // 데스크톱: 작품 목록 로드 후 첫 번째 작품 자동 선택
  useEffect(() => {
    if (artworkList && artworkList.length > 0 && selectedArtwork === null && !isMobile) {
      setSelectedArtwork(artworkList[0].id);
    }
  }, [artworkList, isMobile]);

  // 키보드 방향키로 이전/다음 작품 탐색
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에 포커스 중이면 무시
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (artworks.length === 0) return;
        const currentIndex = artworks.findIndex((a) => a.id === selectedArtwork);
        if (e.key === "ArrowRight") {
          // 다음 작품 (마지막이면 첫 번째로 순환)
          const nextIndex = currentIndex < artworks.length - 1 ? currentIndex + 1 : 0;
          setSelectedArtwork(artworks[nextIndex].id);
        } else {
          // 이전 작품 (첫 번째면 마지막으로 순환)
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : artworks.length - 1;
          setSelectedArtwork(artworks[prevIndex].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artworks, selectedArtwork]);

  const handleFullscreen = () => {
    if (!artist || !selected) return;
    setLocation(`/artists/${artist.id}/artwork/${selected.id}`);
  };

  if (artistLoading) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: "rgba(201,169,110,0.5)", letterSpacing: "0.2em", fontSize: "0.9rem", fontFamily: "sans-serif" }}>LOADING...</p>
        </div>
      </GalleryLayout>
    );
  }

  if (!artist) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "1rem" }}>작가를 찾을 수 없습니다.</p>
          <button onClick={() => setLocation("/artists")} style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "8px 20px", fontSize: "0.85rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "sans-serif" }}>
            ← 작가 목록으로
          </button>
        </div>
      </GalleryLayout>
    );
  }

  return (
    <GalleryLayout>
      <div className="min-h-screen">

        {/* ── 작가 헤더 ── */}
        {/* 커버: 첫 번째 작품 이미지 또는 다크 그라디언트 */}
        <div className="relative overflow-hidden" style={{ height: "clamp(160px, 22vw, 240px)" }}>
          {artworks[0] ? (
            <img
              src={artworks[0].thumbnailUrl ?? artworks[0].mediaUrl ?? ""}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.28) saturate(0.55)" }}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0c0a14 0%, #1c1a2e 100%)" }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,10,20,0.15) 0%, rgba(12,10,20,0.88) 100%)" }} />

          {/* 돌아가기 */}
          <button
            onClick={() => setLocation("/artists")}
            className="absolute top-4 left-4 transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{ background: "rgba(12,10,20,0.55)", border: "1px solid rgba(201,169,110,0.22)", color: "rgba(201,169,110,0.8)", padding: "5px 13px", fontSize: "0.78rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "sans-serif" }}
          >
            ← 작가 목록
          </button>

          {/* 프로필 이미지 + 이름 좌우 배치 */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-5 sm:px-10 pb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-4">
              {/* 프로필 원형 이미지 */}
              <div
                className="flex-shrink-0"
                style={{
                  width: "clamp(52px, 8vw, 72px)",
                  height: "clamp(52px, 8vw, 72px)",
                  borderRadius: "50%",
                  border: "2px solid rgba(201,169,110,0.45)",
                  overflow: "hidden",
                  background: "rgba(12,10,20,0.6)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={artist.profileImageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name ?? '')}&background=2c1f0e&color=c9a96e&size=200`}
                  alt={artist.name ?? ''}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 이름 + 메타 */}
              <div className="flex-1 min-w-0">
                {artistIndex >= 0 && (
                  <p style={{ fontSize: "0.68rem", color: "#c9a96e", letterSpacing: "0.3em", fontFamily: "sans-serif", marginBottom: "2px" }}>
                    ARTIST NO.{String(artistIndex + 1).padStart(2, "0")}
                  </p>
                )}
                <h1 style={{ fontSize: "clamp(1.3rem, 3vw, 1.85rem)", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
                  {artist.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap mt-1.5">
                  {artist.nameEn && (
                    <span style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.55)", letterSpacing: "0.18em", fontFamily: "sans-serif" }}>
                      {artist.nameEn.toUpperCase()}
                    </span>
                  )}
                  {artist.specialty && (
                    <span style={{ fontSize: "0.75rem", color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)", padding: "2px 8px" }}>
                      {artist.specialty}
                    </span>
                  )}
                  <span style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.55)", fontFamily: "sans-serif", letterSpacing: "0.08em" }}>
                    작품 {artworks.length}점
                  </span>
                  {artist.sns && (
                    <a href={artist.sns} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.55)", fontFamily: "sans-serif", letterSpacing: "0.08em", textDecoration: "none", border: "1px solid rgba(201,169,110,0.18)", padding: "2px 8px" }}>
                      SNS →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 작가 소개 띠 ── */}
        {artist.bio && (
          <div style={{ background: "rgba(28,26,46,0.85)", borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "14px 20px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <p style={{ fontSize: "0.92rem", color: "rgba(240,235,224,0.7)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.8, margin: 0 }}>
                {artist.bio}
              </p>
            </div>
          </div>
        )}

        {/* ── 작품 + 데스크톱 우측 패널 ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 16px 60px" }}>
          <div className="flex items-center gap-4 mb-6">
            <p style={{ fontSize: "0.78rem", color: "#c9a96e", letterSpacing: "0.3em", fontFamily: "sans-serif" }}>ARTWORKS</p>
            <div style={{ flex: 1, height: "1px", background: "rgba(201,169,110,0.15)" }} />
            {/* 키보드 탐색 힌트 — 데스크톱 전용 */}
            {!isMobile && artworks.length > 1 && (
              <span style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.38)", fontFamily: "sans-serif", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px" }}>
                <kbd style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.68rem", color: "rgba(201,169,110,0.5)" }}>←</kbd>
                <kbd style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.68rem", color: "rgba(201,169,110,0.5)" }}>→</kbd>
                <span style={{ marginLeft: "2px" }}>작품 탐색</span>
              </span>
            )}
            {selected && !isMobile && (
              <button
                onClick={() => setSelectedArtwork(null)}
                style={{ fontSize: "0.75rem", color: "rgba(201,169,110,0.5)", fontFamily: "sans-serif", background: "none", border: "1px solid rgba(201,169,110,0.15)", padding: "3px 10px", cursor: "pointer", letterSpacing: "0.08em" }}
              >
                ✕ 상세 닫기
              </button>
            )}
          </div>

          {artworksLoading && (
            <p className="text-center py-10" style={{ color: "rgba(201,169,110,0.4)", fontSize: "0.85rem", letterSpacing: "0.2em", fontFamily: "sans-serif" }}>LOADING...</p>
          )}
          {!artworksLoading && artworks.length === 0 && (
            <p className="text-center py-10" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.95rem" }}>아직 등록된 작품이 없습니다.</p>
          )}

          <div className="flex gap-5 items-start">
            {/* 작품 그리드 */}
            <div
              className="flex-1 min-w-0"
              style={{
                display: "grid",
                gridTemplateColumns: selected && !isMobile
                  ? "repeat(auto-fill, minmax(200px, 1fr))"
                  : "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                transition: "grid-template-columns 0.3s ease",
              }}
            >
              {artworks.map((artwork, idx) => {
                const isSelected = selectedArtwork === artwork.id;
                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.05 * idx }}
                    onClick={() => setSelectedArtwork(isSelected ? null : artwork.id)}
                    className="cursor-pointer"
                    style={{
                      background: isSelected ? "rgba(40,35,60,0.9)" : "rgba(28,26,46,0.7)",
                      border: `1px solid ${isSelected ? "rgba(201,169,110,0.55)" : "rgba(201,169,110,0.12)"}`,
                      transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
                      boxShadow: isSelected ? "0 0 0 1px rgba(201,169,110,0.2), 0 12px 30px rgba(0,0,0,0.35)" : "none",
                    }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      {artwork.mediaType === "video" ? (
                        <video src={artwork.mediaUrl ?? ""} className="w-full h-full object-cover" muted playsInline
                          style={{ transition: "transform 0.4s ease", transform: isSelected ? "scale(1.03)" : "scale(1)" }} />
                      ) : (
                        <img src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""} alt={artwork.titleKo}
                          className="w-full h-full object-cover"
                          style={{ transition: "transform 0.4s ease", transform: isSelected ? "scale(1.03)" : "scale(1)" }} />
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,10,20,0.65) 0%, transparent 55%)" }} />
                      {artwork.mediaType === "video" && (
                        <div className="absolute top-2 left-2" style={{ background: "rgba(12,10,20,0.75)", border: "1px solid rgba(201,169,110,0.35)", color: "#c9a96e", fontSize: "0.65rem", padding: "2px 7px", fontFamily: "sans-serif", letterSpacing: "0.1em" }}>▶ VIDEO</div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2" style={{ background: "#c9a96e", color: "#1c1a2e", fontSize: "0.6rem", padding: "2px 7px", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>선택됨</div>
                      )}
                      {/* AI 프롬프트 있음 배지 */}
                      {artwork.aiPrompt && (
                        <div className="absolute bottom-2 left-2" style={{ background: "rgba(12,10,20,0.75)", border: "1px solid rgba(100,180,255,0.3)", color: "rgba(150,200,255,0.8)", fontSize: "0.6rem", padding: "2px 6px", fontFamily: "sans-serif", letterSpacing: "0.05em" }}>AI</div>
                      )}
                      {artwork.likeCount != null && artwork.likeCount > 0 && (
                        <div className="absolute bottom-2 right-2" style={{ background: "rgba(12,10,20,0.7)", border: "1px solid rgba(192,57,43,0.3)", color: "rgba(220,80,60,0.9)", fontSize: "0.7rem", padding: "2px 7px", fontFamily: "sans-serif" }}>♥ {artwork.likeCount}</div>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <h3 style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                        {artwork.titleKo}
                      </h3>
                      {artwork.titleEn && (
                        <p style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.5)", fontFamily: "sans-serif", letterSpacing: "0.12em", marginTop: "2px" }}>
                          {artwork.titleEn.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 데스크톱 우측 패널 */}
            <AnimatePresence>
              {selected && !isMobile && (() => {
                const currentIdx = artworks.findIndex((a) => a.id === selected.id);
                const prevArtwork = currentIdx > 0 ? artworks[currentIdx - 1] : artworks[artworks.length - 1];
                const nextArtwork = currentIdx < artworks.length - 1 ? artworks[currentIdx + 1] : artworks[0];
                return (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      width: "320px", flexShrink: 0,
                      background: "rgba(22,20,38,0.95)",
                      border: "1px solid rgba(201,169,110,0.2)",
                      position: "sticky", top: "80px",
                      maxHeight: "calc(100vh - 100px)", overflowY: "auto",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {/* 이전/다음 네비게이션 바 */}
                    {artworks.length > 1 && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px",
                        borderBottom: "1px solid rgba(201,169,110,0.12)",
                        background: "rgba(12,10,20,0.4)",
                        flexShrink: 0,
                      }}>
                        <button
                          onClick={() => setSelectedArtwork(prevArtwork.id)}
                          className="transition-all duration-150 hover:opacity-80 active:scale-95"
                          style={{ background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "#c9a96e", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "sans-serif", letterSpacing: "0.05em" }}
                          title="이전 작품 (←)">
                          ← 이전
                        </button>
                        <span style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.45)", fontFamily: "sans-serif", letterSpacing: "0.1em" }}>
                          {currentIdx + 1} / {artworks.length}
                        </span>
                        <button
                          onClick={() => setSelectedArtwork(nextArtwork.id)}
                          className="transition-all duration-150 hover:opacity-80 active:scale-95"
                          style={{ background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "#c9a96e", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "sans-serif", letterSpacing: "0.05em" }}
                          title="다음 작품 (→)">
                          다음 →
                        </button>
                      </div>
                    )}
                    <ArtworkDetailContent
                      artwork={selected}
                      artistId={artistId}
                      onFullscreen={handleFullscreen}
                      onClose={() => setSelectedArtwork(null)}
                    />
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 모바일 하단 슬라이드업 시트 ── */}
        <AnimatePresence>
          {selected && isMobile && (
            <>
              {/* 딤 배경 */}
              <motion.div
                key="dim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedArtwork(null)}
                style={{
                  position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                  zIndex: 40, touchAction: "none",
                }}
              />
              {/* 시트 */}
              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  position: "fixed", bottom: 0, left: 0, right: 0,
                  background: "rgba(18,16,32,0.98)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  borderBottom: "none",
                  borderRadius: "16px 16px 0 0",
                  zIndex: 50,
                  maxHeight: "88vh",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* 드래그 핸들 */}
                <div className="flex justify-center pt-3 pb-1">
                  <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(201,169,110,0.3)" }} />
                </div>
                {/* 닫기 버튼 */}
                <div className="flex justify-end px-4 pb-1">
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    style={{ background: "none", border: "none", color: "rgba(201,169,110,0.6)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px" }}
                  >
                    ✕
                  </button>
                </div>
                <ArtworkDetailContent
                  artwork={selected}
                  artistId={artistId}
                  onFullscreen={handleFullscreen}
                  onClose={() => setSelectedArtwork(null)}
                />
                {/* iOS 하단 safe area 여백 */}
                <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── 이전/다음 작가 네비게이션 ── */}
        <div className="flex justify-between px-5 sm:px-10 py-6" style={{ borderTop: "1px solid rgba(201,169,110,0.1)", maxWidth: "1200px", margin: "0 auto" }}>
          {prevArtist ? (
            <button onClick={() => setLocation(`/artists/${prevArtist.id}`)} className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 active:scale-95" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ color: "#c9a96e", fontSize: "1.1rem" }}>←</span>
              <div className="text-left">
                <p style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.15em", fontFamily: "sans-serif", marginBottom: "2px" }}>PREV ARTIST</p>
                <p style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 600 }}>{prevArtist.name}</p>
              </div>
            </button>
          ) : <div />}
          {nextArtist ? (
            <button onClick={() => setLocation(`/artists/${nextArtist.id}`)} className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 active:scale-95" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div className="text-right">
                <p style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.15em", fontFamily: "sans-serif", marginBottom: "2px" }}>NEXT ARTIST</p>
                <p style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 600 }}>{nextArtist.name}</p>
              </div>
              <span style={{ color: "#c9a96e", fontSize: "1.1rem" }}>→</span>
            </button>
          ) : <div />}
        </div>

      </div>
    </GalleryLayout>
  );
}
