/**
 * ArtworkViewerPage — 작품 상세 뷰어 (DB 연동, 이미지/동영상 지원)
 * Design: "Ink & Light" — 전체 화면 몰입형 뷰어
 */
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

export default function ArtworkViewerPage() {
  const params = useParams<{ id: string; artworkId: string }>();
  const [, setLocation] = useLocation();
  const [showInfo, setShowInfo] = useState(false);
  const [direction, setDirection] = useState(0);

  const artistId = parseInt(params.id ?? "0", 10);
  const artworkId = parseInt(params.artworkId ?? "0", 10);

  const { data: artist } = trpc.gallery.getArtist.useQuery(
    { id: artistId },
    { enabled: !isNaN(artistId) && artistId > 0 }
  );
  const { data: artworkList } = trpc.gallery.listArtworks.useQuery(
    { artistId },
    { enabled: !isNaN(artistId) && artistId > 0 }
  );

  const artworks = artworkList ?? [];
  const artworkIndex = artworks.findIndex((w) => w.id === artworkId);
  const artwork = artworks[artworkIndex];
  const prevArtwork = artworkIndex > 0 ? artworks[artworkIndex - 1] : null;
  const nextArtwork = artworkIndex < artworks.length - 1 ? artworks[artworkIndex + 1] : null;

  const goTo = (id: number, dir: number) => {
    setDirection(dir);
    setLocation(`/artists/${params.id}/artwork/${id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevArtwork) goTo(prevArtwork.id, -1);
      if (e.key === "ArrowRight" && nextArtwork) goTo(nextArtwork.id, 1);
      if (e.key === "Escape") setLocation(`/artists/${params.id}`);
      if (e.key === "i") setShowInfo((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevArtwork, nextArtwork]);

  const tags = artwork?.tags ? artwork.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!artwork) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif" }}>
            작품을 찾을 수 없습니다.
          </p>
          <button
            onClick={() => setLocation(`/artists/${params.id}`)}
            className="gallery-caption hover:opacity-80"
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "6px 16px", fontSize: "0.5rem", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            ← 작가 페이지로
          </button>
        </div>
      </GalleryLayout>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <GalleryLayout>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{ background: "#0c0a14", paddingTop: "3.5rem" }}
      >
        {/* 상단 바 */}
        <div
          className="fixed top-14 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-2"
          style={{ background: "rgba(12,10,20,0.8)", backdropFilter: "blur(8px)" }}
        >
          <button
            onClick={() => setLocation(`/artists/${params.id}`)}
            className="gallery-caption transition-all duration-200 hover:opacity-80"
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(201,169,110,0.6)", padding: "4px 10px", fontSize: "0.45rem", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            ← {artist?.name ?? "작가"} 작품 목록
          </button>
          <div className="flex items-center gap-3">
            <span className="gallery-caption" style={{ fontSize: "0.45rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.1em" }}>
              {artworkIndex + 1} / {artworks.length}
            </span>
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="gallery-caption transition-all duration-200 hover:opacity-80"
              style={{ background: showInfo ? "rgba(201,169,110,0.15)" : "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(201,169,110,0.6)", padding: "4px 10px", fontSize: "0.45rem", letterSpacing: "0.15em", cursor: "pointer" }}
            >
              {showInfo ? "정보 닫기" : "작품 정보 [i]"}
            </button>
          </div>
        </div>

        {/* 메인 뷰어 */}
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: "calc(100vh - 7rem)", padding: "1rem" }}>
          {/* 이전 버튼 */}
          <button
            onClick={() => prevArtwork && goTo(prevArtwork.id, -1)}
            disabled={!prevArtwork}
            className="absolute left-2 sm:left-4 z-30 transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{ background: "rgba(12,10,20,0.7)", border: "1px solid rgba(201,169,110,0.2)", color: prevArtwork ? "#c9a96e" : "rgba(201,169,110,0.15)", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: prevArtwork ? "pointer" : "not-allowed", fontSize: "1rem" }}
          >←</button>

          {/* 작품 미디어 */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={artwork.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative"
              style={{ maxWidth: "min(800px, calc(100vw - 120px))", width: "100%" }}
            >
              {artwork.mediaType === "video" ? (
                <video
                  src={artwork.mediaUrl ?? ""}
                  controls
                  className="w-full object-contain"
                  style={{ maxHeight: "calc(100vh - 12rem)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
                />
              ) : (
                <img
                  src={artwork.mediaUrl ?? artwork.thumbnailUrl ?? ""}
                  alt={artwork.titleKo}
                  className="w-full object-contain"
                  style={{ maxHeight: "calc(100vh - 12rem)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* 다음 버튼 */}
          <button
            onClick={() => nextArtwork && goTo(nextArtwork.id, 1)}
            disabled={!nextArtwork}
            className="absolute right-2 sm:right-4 z-30 transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{ background: "rgba(12,10,20,0.7)", border: "1px solid rgba(201,169,110,0.2)", color: nextArtwork ? "#c9a96e" : "rgba(201,169,110,0.15)", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: nextArtwork ? "pointer" : "not-allowed", fontSize: "1rem" }}
          >→</button>
        </div>

        {/* 작품 정보 패널 (슬라이드업) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed bottom-0 left-0 right-0 z-40"
              style={{ background: "rgba(18,18,30,0.97)", borderTop: "1px solid rgba(201,169,110,0.2)", padding: "1.5rem 1.5rem 2rem", maxHeight: "50vh", overflowY: "auto" }}
            >
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="gallery-title mb-1" style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", color: "#f0ebe0" }}>
                      {artwork.titleKo}
                    </h2>
                    <p className="gallery-caption" style={{ fontSize: "0.5rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.15em" }}>
                      {(artwork.titleEn ?? '').toUpperCase()} · {artwork.year ?? "2025"}
                    </p>
                  </div>
                  <button onClick={() => setShowInfo(false)} style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, flexShrink: 0 }}>×</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="gallery-caption mb-1" style={{ fontSize: "0.42rem", color: "#c9a96e", letterSpacing: "0.2em" }}>ARTIST</p>
                    <p style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.7)", fontFamily: "'Noto Serif KR', serif" }}>
                      {artist?.name ?? "-"} {artist?.nameEn ? `(${artist.nameEn})` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="gallery-caption mb-1" style={{ fontSize: "0.42rem", color: "#c9a96e", letterSpacing: "0.2em" }}>MEDIUM</p>
                    <p style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.7)", fontFamily: "'Noto Serif KR', serif" }}>
                      {artwork.medium ?? "AI 생성 아트"}
                    </p>
                  </div>
                </div>

                {artwork.description && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(240,235,224,0.65)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.9, marginBottom: "1rem" }}>
                    {artwork.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="gallery-caption" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.55)", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.15)", padding: "3px 8px", letterSpacing: "0.08em" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 제목 (정보 패널 닫혔을 때) */}
        {!showInfo && (
          <div className="fixed bottom-0 left-0 right-0 text-center py-3" style={{ background: "linear-gradient(to top, rgba(12,10,20,0.9), transparent)" }}>
            <p className="gallery-title" style={{ fontSize: "0.9rem", color: "rgba(240,235,224,0.7)" }}>
              {artwork.titleKo}
            </p>
            <p className="gallery-caption" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.45)", letterSpacing: "0.12em" }}>
              {artist?.name ?? ""} · {artwork.year ?? "2025"} · 키보드 ← → 이동 · [i] 정보
            </p>
          </div>
        )}
      </div>
    </GalleryLayout>
  );
}
