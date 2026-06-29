/**
 * ArtistDetailPage — 작가 상세 + 작품 그리드 (DB 연동)
 * Design: "Ink & Light"
 */
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [hoveredArtwork, setHoveredArtwork] = useState<number | null>(null);

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

  if (artistLoading) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="gallery-caption" style={{ color: "rgba(201,169,110,0.5)", letterSpacing: "0.2em", fontSize: "0.65rem" }}>
            LOADING...
          </p>
        </div>
      </GalleryLayout>
    );
  }

  if (!artist) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif" }}>
            작가를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => setLocation("/artists")}
            className="gallery-caption hover:opacity-80"
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "6px 16px", fontSize: "0.5rem", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            ← 작가 목록으로
          </button>
        </div>
      </GalleryLayout>
    );
  }

  const artworks = artworkList ?? [];
  const tags = (artwork: typeof artworks[0]) =>
    artwork.tags ? artwork.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <GalleryLayout>
      <div className="min-h-screen">
        {/* 히어로 섹션 */}
        <div className="relative overflow-hidden" style={{ height: "clamp(280px, 45vw, 420px)" }}>
          <img
            src={artist.profileImageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name ?? '')}&background=2c1f0e&color=c9a96e&size=800`}
            alt={artist.name ?? ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.4) saturate(0.7)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(18,18,30,0.3) 0%, rgba(18,18,30,0.95) 100%)" }}
          />

          {/* 뒤로가기 */}
          <button
            onClick={() => setLocation("/artists")}
            className="absolute top-5 left-5 gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              background: "rgba(18,18,30,0.6)", border: "1px solid rgba(201,169,110,0.25)",
              color: "rgba(201,169,110,0.7)", padding: "5px 12px",
              fontSize: "0.48rem", letterSpacing: "0.15em", cursor: "pointer",
            }}
          >
            ← 작가 목록
          </button>

          {/* 작가 정보 */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            {artistIndex >= 0 && (
              <p className="gallery-caption mb-2" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}>
                ARTIST NO.{String(artistIndex + 1).padStart(2, "0")}
              </p>
            )}
            <h1 className="gallery-title mb-1" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#f0ebe0" }}>
              {artist.name}
            </h1>
            <p className="gallery-caption" style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.2em" }}>
              {(artist.nameEn ?? '').toUpperCase()}
            </p>
          </motion.div>
        </div>

        {/* 본문 */}
        <div className="px-4 sm:px-10 py-10" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* 작가 소개 */}
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="gallery-caption mb-3" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}>
                ARTIST STATEMENT
              </p>
              <p style={{ fontSize: "0.88rem", color: "rgba(240,235,224,0.75)", fontFamily: "'Noto Serif KR', serif", lineHeight: 2 }}>
                {artist.bio ?? "작가 소개가 아직 등록되지 않았습니다."}
              </p>
            </motion.div>

            {/* 작가 정보 카드 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.15)", padding: "1.25rem" }}>
                {[
                  { label: "전문 분야", value: artist.specialty ?? "-" },
                  { label: "사용 도구", value: artist.tools ?? "-" },
                  { label: "전시 작품", value: `${artworks.length}점` },
                ].map(({ label, value }) => (
                  <div key={label} className="mb-4 pb-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
                    <p className="gallery-caption mb-1" style={{ fontSize: "0.45rem", color: "#c9a96e", letterSpacing: "0.2em" }}>
                      {label.toUpperCase()}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(240,235,224,0.7)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.6 }}>
                      {value}
                    </p>
                  </div>
                ))}
                {artist.sns && (
                  <a
                    href={artist.sns}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-caption transition-all duration-200 hover:opacity-80 block text-center"
                    style={{ fontSize: "0.48rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.15em", border: "1px solid rgba(201,169,110,0.2)", padding: "6px 0", textDecoration: "none" }}
                  >
                    SNS 방문하기 →
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* 작품 섹션 */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <p className="gallery-caption" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}>
                ARTWORKS
              </p>
              <div style={{ flex: 1, height: "1px", background: "rgba(201,169,110,0.15)" }} />
            </div>

            {artworksLoading && (
              <p className="gallery-caption text-center py-8" style={{ color: "rgba(201,169,110,0.4)", fontSize: "0.6rem", letterSpacing: "0.2em" }}>
                LOADING...
              </p>
            )}

            {!artworksLoading && artworks.length === 0 && (
              <p className="text-center py-8" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.8rem" }}>
                아직 등록된 작품이 없습니다.
              </p>
            )}

            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {artworks.map((artwork, idx) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  onClick={() => setLocation(`/artists/${artist.id}/artwork/${artwork.id}`)}
                  onMouseEnter={() => setHoveredArtwork(artwork.id)}
                  onMouseLeave={() => setHoveredArtwork(null)}
                  className="cursor-pointer"
                  style={{
                    background: "rgba(30,28,48,0.7)",
                    border: `1px solid ${hoveredArtwork === artwork.id ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.1)"}`,
                    transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
                    transform: hoveredArtwork === artwork.id ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: hoveredArtwork === artwork.id ? "0 12px 30px rgba(0,0,0,0.4)" : "none",
                  }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    {artwork.mediaType === "video" ? (
                      <video
                        src={artwork.mediaUrl ?? ""}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        style={{ transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)", transform: hoveredArtwork === artwork.id ? "scale(1.05)" : "scale(1)" }}
                      />
                    ) : (
                      <img
                        src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""}
                        alt={artwork.titleKo}
                        className="w-full h-full object-cover"
                        style={{ transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)", transform: hoveredArtwork === artwork.id ? "scale(1.05)" : "scale(1)" }}
                      />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,10,20,0.7) 0%, transparent 60%)" }} />
                    {artwork.mediaType === "video" && (
                      <div className="absolute top-2 left-2 gallery-caption" style={{ background: "rgba(12,10,20,0.7)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", fontSize: "0.4rem", padding: "2px 6px", letterSpacing: "0.1em" }}>
                        VIDEO
                      </div>
                    )}
                    {hoveredArtwork === artwork.id && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(12,10,20,0.4)" }}>
                        <span className="gallery-caption" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.2em", border: "1px solid rgba(201,169,110,0.5)", padding: "6px 14px" }}>
                          작품 보기
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="gallery-title mb-0.5" style={{ fontSize: "0.95rem", color: "#f0ebe0", flex: 1 }}>
                        {artwork.titleKo}
                      </h3>
                      {/* 좋아요 수 배지 */}
                      {artwork.likeCount != null && artwork.likeCount > 0 && (
                        <span className="gallery-caption flex items-center gap-0.5" style={{ fontSize: "0.42rem", color: "rgba(192,57,43,0.7)", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", padding: "2px 7px", flexShrink: 0, letterSpacing: "0.05em" }}>
                          ♥ {artwork.likeCount}
                        </span>
                      )}
                    </div>
                    <p className="gallery-caption mb-2" style={{ fontSize: "0.45rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.12em" }}>
                      {(artwork.titleEn ?? '').toUpperCase()}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "rgba(240,235,224,0.45)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {artwork.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags(artwork).slice(0, 3).map((tag) => (
                        <span key={tag} className="gallery-caption" style={{ fontSize: "0.4rem", color: "rgba(201,169,110,0.5)", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)", padding: "2px 6px", letterSpacing: "0.08em" }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 이전/다음 작가 네비게이션 */}
          <div className="flex justify-between mt-12 pt-6" style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}>
            {prevArtist ? (
              <button
                onClick={() => setLocation(`/artists/${prevArtist.id}`)}
                className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <span style={{ color: "#c9a96e", fontSize: "0.9rem" }}>←</span>
                <div className="text-left">
                  <p className="gallery-caption" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.15em" }}>PREV ARTIST</p>
                  <p className="gallery-title" style={{ fontSize: "0.85rem", color: "#f0ebe0" }}>{prevArtist.name}</p>
                </div>
              </button>
            ) : <div />}
            {nextArtist ? (
              <button
                onClick={() => setLocation(`/artists/${nextArtist.id}`)}
                className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <div className="text-right">
                  <p className="gallery-caption" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.15em" }}>NEXT ARTIST</p>
                  <p className="gallery-title" style={{ fontSize: "0.85rem", color: "#f0ebe0" }}>{nextArtist.name}</p>
                </div>
                <span style={{ color: "#c9a96e", fontSize: "0.9rem" }}>→</span>
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </GalleryLayout>
  );
}
