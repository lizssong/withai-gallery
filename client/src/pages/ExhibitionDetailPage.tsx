/**
 * ExhibitionDetailPage — 전시회별 독립 페이지 (/exhibition/:slug)
 * 특정 전시회의 초대장 → 작가 목록 → 작품 뷰어 흐름을 독립적으로 제공합니다.
 * 커버 이미지가 있으면 초대장 배경 및 작가 목록 헤더에 표시됩니다.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

export default function ExhibitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [entered, setEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: exhibition, isLoading, error } = trpc.exhibition.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );
  const { data: artists } = trpc.exhibition.artists.useQuery(
    { exhibitionId: exhibition?.id ?? 0 },
    { enabled: !!exhibition?.id && entered }
  );

  // BGM 재생
  useEffect(() => {
    if (entered && audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const fade = setInterval(() => {
        v = Math.min(v + 0.02, 0.35);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= 0.35) clearInterval(fade);
      }, 80);
    }
  }, [entered]);

  if (isLoading) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="gallery-caption" style={{ fontSize: "0.5rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.25em" }}>
            LOADING...
          </p>
        </div>
      </GalleryLayout>
    );
  }

  if (error || !exhibition) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.9rem" }}>
            전시회를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => setLocation("/exhibitions")}
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "8px 20px", fontSize: "0.55rem", fontFamily: "sans-serif", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            ← 전시회 목록으로
          </button>
        </div>
      </GalleryLayout>
    );
  }

  const coverImageUrl = (exhibition as any).coverImageUrl as string | null | undefined;

  return (
    <GalleryLayout>
      {/* BGM */}
      <audio ref={audioRef} preload="none" src="/manus-storage/gallery-bgm_99faee5a.mp3" />

      <AnimatePresence mode="wait">
        {!entered ? (
          /* ── 초대장 ── */
          <motion.div
            key="invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
            style={{
              position: "relative",
              // 커버 이미지가 있으면 배경으로 사용
              ...(coverImageUrl
                ? {
                    backgroundImage: `url(${coverImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}),
            }}
          >
            {/* 커버 이미지 있을 때 어두운 오버레이 */}
            {coverImageUrl && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(12,10,20,0.55) 0%, rgba(12,10,20,0.75) 100%)",
                  backdropFilter: "blur(1px)",
                }}
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                position: "relative",
                zIndex: 10,
                background: coverImageUrl
                  ? "linear-gradient(160deg, rgba(245,240,232,0.97) 0%, rgba(237,229,212,0.97) 100%)"
                  : "linear-gradient(160deg, #f5f0e8 0%, #ede5d4 100%)",
                maxWidth: "480px",
                width: "100%",
                padding: "clamp(2rem, 6vw, 3.5rem)",
                boxShadow: coverImageUrl
                  ? "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.15)"
                  : "0 30px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* 씰 */}
              <div
                style={{
                  position: "absolute",
                  top: "-22px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #c0392b 0%, #922b21 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(192,57,43,0.5)",
                  fontSize: "1.1rem",
                  zIndex: 10,
                }}
              >
                ✦
              </div>

              <div className="text-center">
                {/* 위드AI솔루션 × AI ART GALLERY 브랜딩 */}
                <p style={{ fontSize: "0.45rem", color: "rgba(60,50,40,0.35)", fontFamily: "sans-serif", letterSpacing: "0.25em", marginBottom: "0.5rem", marginTop: "0.5rem" }}>
                  위드AI솔루션 × AI ART GALLERY
                </p>
                <p style={{ fontSize: "0.5rem", color: "rgba(60,50,40,0.45)", fontFamily: "sans-serif", letterSpacing: "0.3em", marginBottom: "1.5rem" }}>
                  {exhibition.season ? `${exhibition.season} — INVITATION` : "ONLINE EXHIBITION — INVITATION"}
                </p>

                <div style={{ width: "100%", height: "1px", background: "rgba(60,50,40,0.12)", marginBottom: "1.5rem" }} />

                <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "#2c2418", fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.3, marginBottom: "0.5rem" }}>
                  {exhibition.titleKo}
                </h1>
                {exhibition.titleEn && (
                  <p style={{ fontSize: "0.5rem", color: "rgba(60,50,40,0.4)", fontFamily: "sans-serif", letterSpacing: "0.2em", marginBottom: "1.5rem" }}>
                    {exhibition.titleEn}
                  </p>
                )}

                <div style={{ width: "100%", height: "1px", background: "rgba(60,50,40,0.12)", marginBottom: "1.5rem" }} />

                {exhibition.subtitle && (
                  <p style={{ fontSize: "0.82rem", color: "rgba(60,50,40,0.6)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    {exhibition.subtitle}
                  </p>
                )}

                {/* 메타 정보 */}
                <div style={{ background: "rgba(60,50,40,0.04)", padding: "1rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", textAlign: "left" }}>
                  {exhibition.curatorName && (
                    <div>
                      <p style={{ fontSize: "0.42rem", color: "rgba(60,50,40,0.4)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "2px" }}>기획</p>
                      <p style={{ fontSize: "0.72rem", color: "#2c2418", fontFamily: "'Noto Serif KR', serif" }}>{exhibition.curatorName}</p>
                    </div>
                  )}
                  {(exhibition.maxArtists !== undefined) && (
                    <div>
                      <p style={{ fontSize: "0.42rem", color: "rgba(60,50,40,0.4)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "2px" }}>참여 작가</p>
                      <p style={{ fontSize: "0.72rem", color: "#2c2418", fontFamily: "'Noto Serif KR', serif" }}>
                        {exhibition.maxArtists === 0 ? "다수" : `${exhibition.maxArtists}인`}
                      </p>
                    </div>
                  )}
                  {exhibition.genre && (
                    <div>
                      <p style={{ fontSize: "0.42rem", color: "rgba(60,50,40,0.4)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "2px" }}>장르</p>
                      <p style={{ fontSize: "0.72rem", color: "#2c2418", fontFamily: "'Noto Serif KR', serif" }}>{exhibition.genre}</p>
                    </div>
                  )}
                  {exhibition.season && (
                    <div>
                      <p style={{ fontSize: "0.42rem", color: "rgba(60,50,40,0.4)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginBottom: "2px" }}>시즌</p>
                      <p style={{ fontSize: "0.72rem", color: "#2c2418", fontFamily: "'Noto Serif KR', serif" }}>{exhibition.season}</p>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: "0.6rem", color: "rgba(60,50,40,0.35)", fontFamily: "sans-serif", marginBottom: "1.25rem" }}>
                  ♪ 입장 시 잔잔한 배경음악이 재생됩니다
                </p>

                <button
                  onClick={() => setEntered(true)}
                  className="w-full transition-all duration-200 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #2c2418 0%, #1a160f 100%)",
                    border: "none",
                    color: "#c9a96e",
                    padding: "14px",
                    fontSize: "0.6rem",
                    fontFamily: "sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    cursor: "pointer",
                  }}
                >
                  전 시 회  입 장 하 기
                </button>

                {exhibition.curatorName && (
                  <p style={{ fontSize: "0.42rem", color: "rgba(60,50,40,0.3)", fontFamily: "sans-serif", letterSpacing: "0.15em", marginTop: "1.25rem" }}>
                    CURATED BY {exhibition.curatorName.toUpperCase()}
                  </p>
                )}
              </div>
            </motion.div>

            {/* 전시회 목록으로 */}
            <button
              onClick={() => setLocation("/exhibitions")}
              style={{
                position: "relative",
                zIndex: 10,
                marginTop: "2rem",
                background: "none",
                border: "none",
                color: coverImageUrl ? "rgba(240,235,224,0.55)" : "rgba(201,169,110,0.4)",
                fontSize: "0.55rem",
                fontFamily: "sans-serif",
                letterSpacing: "0.15em",
                cursor: "pointer",
                textShadow: coverImageUrl ? "0 1px 4px rgba(0,0,0,0.6)" : "none",
              }}
            >
              ← 다른 전시회 보기
            </button>
          </motion.div>
        ) : (
          /* ── 작가 목록 ── */
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* 전시회 헤더 — 커버 이미지 배너 */}
            {coverImageUrl ? (
              <div
                style={{
                  position: "relative",
                  height: "clamp(180px, 30vw, 320px)",
                  overflow: "hidden",
                  background: "rgba(12,10,20,0.9)",
                }}
              >
                <img
                  src={coverImageUrl}
                  alt={exhibition.titleKo}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                  }}
                />
                {/* 그라디언트 오버레이 */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(12,10,20,0.2) 0%, rgba(12,10,20,0.8) 100%)",
                  }}
                />
                {/* 헤더 텍스트 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "clamp(1.5rem, 4vw, 2.5rem)",
                    left: "clamp(1.5rem, 6vw, 4rem)",
                    right: "clamp(1.5rem, 6vw, 4rem)",
                  }}
                >
                  <p className="gallery-caption mb-2" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.3em" }}>
                    {exhibition.season ?? "EXHIBITION"}
                  </p>
                  <h1 className="gallery-title" style={{ fontSize: "clamp(1.6rem, 5vw, 2.8rem)", color: "#f0ebe0", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                    {exhibition.titleKo}
                  </h1>
                  {exhibition.description && (
                    <p style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif", marginTop: "0.5rem", maxWidth: "520px", lineHeight: 1.7, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                      {exhibition.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* 커버 이미지 없을 때 기존 텍스트 헤더 */
              <div className="px-4 sm:px-8 pt-16 pb-12" style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="gallery-caption mb-2" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.3em" }}>
                    {exhibition.season ?? "EXHIBITION"}
                  </p>
                  <h1 className="gallery-title" style={{ fontSize: "clamp(1.6rem, 5vw, 2.5rem)", color: "#f0ebe0" }}>
                    {exhibition.titleKo}
                  </h1>
                  {exhibition.description && (
                    <p style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif", marginTop: "0.75rem", maxWidth: "520px", margin: "0.75rem auto 0", lineHeight: 1.8 }}>
                      {exhibition.description}
                    </p>
                  )}
                  <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.3)", margin: "1.5rem auto 0" }} />
                </motion.div>
              </div>
            )}

            {/* 작가 그리드 */}
            <div className="px-4 sm:px-8 py-12" style={{ maxWidth: "1100px", margin: "0 auto" }}>
              {/* 커버 이미지 있을 때 구분선 */}
              {coverImageUrl && (
                <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.3)", margin: "0 auto 3rem" }} />
              )}

              {!artists || artists.length === 0 ? (
                <div className="text-center py-20" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.85rem" }}>
                  이 전시회에 등록된 작가가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artists.map((artist, idx) => (
                    <motion.div
                      key={artist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.07 }}
                      onClick={() => setLocation(`/artists/${artist.id}`)}
                      className="cursor-pointer group"
                      style={{
                        background: "rgba(30,28,48,0.7)",
                        border: "1px solid rgba(201,169,110,0.1)",
                        overflow: "hidden",
                        transition: "all 0.25s",
                      }}
                      whileHover={{ scale: 1.02, borderColor: "rgba(201,169,110,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* 프로필 이미지 */}
                      <div style={{ height: "180px", background: "rgba(20,18,35,0.8)", overflow: "hidden", position: "relative" }}>
                        {artist.profileImageUrl ? (
                          <img
                            src={artist.profileImageUrl}
                            alt={artist.name ?? ""}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                            className="group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "3rem", opacity: 0.15 }}>
                            🎨
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="gallery-caption mb-1" style={{ fontSize: "0.42rem", color: "#c9a96e", letterSpacing: "0.2em" }}>
                          {artist.specialty ?? "ARTIST"}
                        </p>
                        <h3 style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif", marginBottom: "0.4rem" }}>
                          {artist.name ?? "이름 없음"}
                        </h3>
                        {artist.bio && (
                          <p style={{ fontSize: "0.68rem", color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {artist.bio}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 하단 네비게이션 */}
              <div className="flex justify-between items-center mt-12 pt-6" style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}>
                <button
                  onClick={() => setEntered(false)}
                  style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", fontSize: "0.55rem", fontFamily: "sans-serif", letterSpacing: "0.15em", cursor: "pointer" }}
                >
                  ← 초대장으로
                </button>
                <button
                  onClick={() => setLocation("/exhibitions")}
                  style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", fontSize: "0.55rem", fontFamily: "sans-serif", letterSpacing: "0.15em", cursor: "pointer" }}
                >
                  다른 전시회 →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GalleryLayout>
  );
}
