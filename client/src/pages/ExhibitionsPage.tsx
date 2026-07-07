/**
 * ExhibitionsPage — 전시회 선택 랜딩 페이지
 * 공개된 전시회 목록을 카드 형태로 보여주고, 각 전시회로 이동할 수 있습니다.
 * 커버 이미지가 있으면 카드 상단에 표시됩니다.
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

export default function ExhibitionsPage() {
  const [, setLocation] = useLocation();
  const { data: exhibitions, isLoading } = trpc.exhibition.list.useQuery();

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-8 py-16" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p
            className="gallery-caption mb-3"
            style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.35em" }}
          >
            ONLINE GALLERY PLATFORM
          </p>
          <h1
            className="gallery-title"
            style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)", color: "#f0ebe0", lineHeight: 1.2 }}
          >
            전시회 목록
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(240,235,224,0.45)",
              fontFamily: "'Noto Serif KR', serif",
              marginTop: "0.75rem",
              lineHeight: 1.8,
            }}
          >
            참여하고 싶은 전시회를 선택하여 입장하세요.
          </p>
          <div style={{ width: "40px", height: "1px", background: "rgba(201,169,110,0.4)", margin: "1.5rem auto 0" }} />
        </motion.div>

        {/* 전시회 목록 */}
        {isLoading ? (
          <div className="text-center py-20">
            <p
              className="gallery-caption"
              style={{ fontSize: "0.5rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.25em" }}
            >
              LOADING...
            </p>
          </div>
        ) : !exhibitions || exhibitions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
            style={{
              border: "2px dashed rgba(201,169,110,0.1)",
              color: "rgba(240,235,224,0.3)",
              fontFamily: "'Noto Serif KR', serif",
              fontSize: "0.85rem",
              lineHeight: 2,
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>🖼</div>
            현재 진행 중인 전시회가 없습니다.
            <br />
            <span style={{ fontSize: "0.7rem" }}>곧 새로운 전시회가 열릴 예정입니다.</span>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.map((ex, idx) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => setLocation(`/exhibition/${ex.slug}`)}
                className="cursor-pointer group"
                style={{
                  background: "rgba(30,28,48,0.7)",
                  border: "1px solid rgba(201,169,110,0.12)",
                  transition: "all 0.25s ease",
                  overflow: "hidden",
                }}
                whileHover={{ scale: 1.02, borderColor: "rgba(201,169,110,0.35)" }}
                whileTap={{ scale: 0.98 }}
              >
                {/* ── 커버 이미지 영역 ── */}
                {(ex as any).coverImageUrl ? (
                  <div
                    style={{
                      position: "relative",
                      height: "200px",
                      overflow: "hidden",
                      background: "rgba(20,18,35,0.9)",
                    }}
                  >
                    <img
                      src={(ex as any).coverImageUrl}
                      alt={ex.titleKo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
                      }}
                      className="group-hover:scale-105"
                    />
                    {/* 그라디언트 오버레이 */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent 40%, rgba(20,18,35,0.85) 100%)",
                      }}
                    />
                    {/* 상태 배지 (커버 이미지 위에 표시) */}
                    <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                      <span
                        style={{
                          fontSize: "0.45rem",
                          background:
                            ex.status === "active"
                              ? "rgba(80,200,120,0.85)"
                              : ex.status === "closed"
                              ? "rgba(200,80,80,0.85)"
                              : "rgba(201,169,110,0.85)",
                          color: "#fff",
                          padding: "3px 10px",
                          fontFamily: "sans-serif",
                          letterSpacing: "0.15em",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {ex.status === "active" ? "● OPEN" : ex.status === "closed" ? "● CLOSED" : "○ COMING SOON"}
                      </span>
                    </div>
                    {/* 시즌 배지 */}
                    {ex.season && (
                      <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
                        <span
                          style={{
                            fontSize: "0.42rem",
                            color: "rgba(201,169,110,0.9)",
                            fontFamily: "sans-serif",
                            letterSpacing: "0.15em",
                            background: "rgba(12,10,20,0.6)",
                            padding: "2px 8px",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {ex.season}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 커버 이미지 없을 때 — 상단 컬러 바 */
                  <div
                    style={{
                      height: "4px",
                      background:
                        ex.status === "active"
                          ? "linear-gradient(90deg, #c9a96e, #a07840)"
                          : ex.status === "closed"
                          ? "rgba(200,80,80,0.4)"
                          : "rgba(201,169,110,0.2)",
                    }}
                  />
                )}

                <div className="p-6">
                  {/* 커버 이미지 없을 때만 상태 배지 표시 */}
                  {!(ex as any).coverImageUrl && (
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        style={{
                          fontSize: "0.48rem",
                          background:
                            ex.status === "active"
                              ? "rgba(80,200,120,0.12)"
                              : ex.status === "closed"
                              ? "rgba(200,80,80,0.12)"
                              : "rgba(201,169,110,0.08)",
                          color:
                            ex.status === "active"
                              ? "#50c878"
                              : ex.status === "closed"
                              ? "#e07070"
                              : "#c9a96e",
                          padding: "3px 10px",
                          fontFamily: "sans-serif",
                          letterSpacing: "0.15em",
                          borderRadius: "2px",
                        }}
                      >
                        {ex.status === "active" ? "● OPEN" : ex.status === "closed" ? "● CLOSED" : "○ COMING SOON"}
                      </span>
                      {ex.season && (
                        <span
                          style={{
                            fontSize: "0.45rem",
                            color: "rgba(201,169,110,0.4)",
                            fontFamily: "sans-serif",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {ex.season}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 전시회 제목 */}
                  <h2
                    className="gallery-title"
                    style={{
                      fontSize: "clamp(1rem, 3vw, 1.25rem)",
                      color: "#f0ebe0",
                      lineHeight: 1.35,
                      marginBottom: "0.5rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {ex.titleKo}
                  </h2>
                  {ex.titleEn && (
                    <p
                      className="gallery-caption"
                      style={{
                        fontSize: "0.48rem",
                        color: "rgba(201,169,110,0.45)",
                        letterSpacing: "0.15em",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {ex.titleEn}
                    </p>
                  )}

                  {/* 부제목 */}
                  {ex.subtitle && (
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(240,235,224,0.4)",
                        fontFamily: "'Noto Serif KR', serif",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                      }}
                    >
                      {ex.subtitle}
                    </p>
                  )}

                  {/* 메타 정보 */}
                  <div
                    className="flex flex-wrap gap-x-4 gap-y-1 mt-auto pt-4"
                    style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
                  >
                    {ex.maxArtists !== undefined && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "rgba(240,235,224,0.35)",
                          fontFamily: "sans-serif",
                        }}
                      >
                        참여 작가{" "}
                        <strong style={{ color: "#c9a96e" }}>
                          {ex.maxArtists === 0 ? "무제한" : `최대 ${ex.maxArtists}명`}
                        </strong>
                      </span>
                    )}
                    {ex.genre && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "rgba(240,235,224,0.35)",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {ex.genre}
                      </span>
                    )}
                    {ex.curatorName && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "rgba(240,235,224,0.35)",
                          fontFamily: "sans-serif",
                        }}
                      >
                        큐레이터 {ex.curatorName}
                      </span>
                    )}
                  </div>

                  {/* 입장 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/exhibition/${ex.slug}`);
                    }}
                    className="w-full mt-4 transition-all duration-150 active:scale-95"
                    style={{
                      background:
                        ex.status === "active"
                          ? "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)"
                          : "rgba(201,169,110,0.08)",
                      border:
                        ex.status === "active"
                          ? "none"
                          : "1px solid rgba(201,169,110,0.2)",
                      color: ex.status === "active" ? "#1c1a2e" : "rgba(201,169,110,0.5)",
                      padding: "10px",
                      fontSize: "0.55rem",
                      fontFamily: "sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      cursor: "pointer",
                    }}
                  >
                    {ex.status === "active" ? "전시회 입장 →" : ex.status === "closed" ? "전시 종료" : "준비 중"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </GalleryLayout>
  );
}
