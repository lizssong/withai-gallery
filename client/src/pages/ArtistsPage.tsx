/**
 * ArtistsPage — 10명 작가 목록 그리드
 * Design: "Ink & Light"
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";
import { exhibitionInfo } from "@/data/artists";

export default function ArtistsPage() {
  const [, setLocation] = useLocation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { data: dbArtists, isLoading } = trpc.gallery.listArtists.useQuery();
  const { data: artworkCounts } = trpc.gallery.artworkCounts.useQuery();

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-6 py-12">
        {/* 페이지 헤더 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <p
            className="gallery-caption tracking-widest mb-3"
            style={{ fontSize: "0.55rem", color: "#c9a96e", letterSpacing: "0.3em" }}
          >
            PARTICIPATING ARTISTS
          </p>
          <h1
            className="gallery-title mb-3"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#f0ebe0" }}
          >
            참여 작가
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(240,235,224,0.5)",
              fontFamily: "'Noto Serif KR', serif",
              maxWidth: "400px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            {exhibitionInfo.subtitle}
          </p>
          <div
            className="flex items-center justify-center gap-4 mt-5"
            style={{ opacity: 0.4 }}
          >
            <div style={{ width: "40px", height: "1px", background: "#c9a96e" }} />
            <span style={{ color: "#c9a96e", fontSize: "0.7rem" }}>✦</span>
            <div style={{ width: "40px", height: "1px", background: "#c9a96e" }} />
          </div>
        </motion.div>

        {/* 작가 그리드 */}
        <div
          className="grid gap-5"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {isLoading && (
            <div className="col-span-full text-center py-16" style={{ color: "rgba(201,169,110,0.5)", fontSize: "0.75rem", letterSpacing: "0.2em" }}>
              LOADING...
            </div>
          )}
          {!isLoading && dbArtists && dbArtists.length === 0 && (
            <div className="col-span-full text-center py-16" style={{ color: "rgba(240,235,224,0.3)", fontSize: "0.8rem", fontFamily: "'Noto Serif KR', serif" }}>
              아직 등록된 작가가 없습니다.<br />작가들이 마이페이지에서 프로필을 등록하면 이곳에 표시됩니다.
            </div>
          )}
          {(dbArtists ?? []).map((artist, idx) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setLocation(`/artists/${artist.id}`)}
              onMouseEnter={() => setHoveredId(artist.id as number)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
              style={{
                background: "rgba(30,28,48,0.7)",
                border: `1px solid ${hoveredId === artist.id ? "rgba(201,169,110,0.5)" : "rgba(201,169,110,0.12)"}`,
                transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
                transform: hoveredId === (artist.id as number) ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hoveredId === artist.id
                  ? "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.15)"
                  : "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {/* 프로필 이미지 */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img
                  src={artist.profileImageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name ?? '')}&background=2c1f0e&color=c9a96e&size=400`}
                  alt={artist.name ?? ''}
                  className="w-full h-full object-cover"
                  style={{
                    transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
                    transform: hoveredId === artist.id ? "scale(1.06)" : "scale(1)",
                  }}
                />
                {/* 오버레이 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(12,10,20,0.85) 0%, rgba(12,10,20,0.1) 60%, transparent 100%)",
                  }}
                />
                {/* 작품 수 뱃지 */}
                <div
                  className="absolute top-2 right-2 gallery-caption"
                  style={{
                    background: "rgba(12,10,20,0.7)",
                    border: "1px solid rgba(201,169,110,0.3)",
                    color: "#c9a96e",
                    fontSize: "0.45rem",
                    letterSpacing: "0.1em",
                    padding: "2px 6px",
                  }}
                >
                  {(artworkCounts?.[artist.id] ?? 0)}점
                </div>
                {/* 이름 오버레이 */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p
                    className="gallery-title"
                    style={{ fontSize: "1.1rem", color: "#f0ebe0", marginBottom: "1px" }}
                  >
                    {artist.name}
                  </p>
                  <p
                    className="gallery-caption"
                    style={{ fontSize: "0.48rem", color: "rgba(201,169,110,0.7)", letterSpacing: "0.15em" }}
                  >
                    {(artist.nameEn ?? '').toUpperCase()}
                  </p>
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="p-3">
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(240,235,224,0.55)",
                    fontFamily: "'Noto Serif KR', serif",
                    lineHeight: 1.5,
                  }}
                >
                  {artist.specialty ?? 'AI 아트'}
                </p>
                <div
                  className="flex items-center justify-between mt-2"
                  style={{ borderTop: "1px solid rgba(201,169,110,0.1)", paddingTop: "0.5rem" }}
                >
                  <p
                    className="gallery-caption"
                    style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}
                  >
                    {(artist.tools ?? '').split(" · ")[0]}
                  </p>
                  <span style={{ color: "#c9a96e", fontSize: "0.65rem" }}>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 하단 에필로그 링크 */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => setLocation("/epilogue")}
            className="gallery-caption transition-all duration-200 hover:opacity-80"
            style={{
              background: "none",
              border: "1px solid rgba(201,169,110,0.25)",
              color: "rgba(201,169,110,0.6)",
              padding: "8px 20px",
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              cursor: "pointer",
            }}
          >
            에필로그 보기 →
          </button>
        </motion.div>
      </div>
    </GalleryLayout>
  );
}
