/**
 * AdminPage — 관리자 대시보드
 * 민경(관리자)이 전체 작가/작품을 관리하는 페이지
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"artists" | "artworks">("artists");
  const [expandedArtist, setExpandedArtist] = useState<number | null>(null);

  const { data: artists, refetch: refetchArtists } = trpc.admin.listAllArtists.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  const { data: allArtworks, refetch: refetchArtworks } = trpc.admin.listAllArtworks.useQuery(
    undefined,
    { enabled: user?.role === "admin" && activeTab === "artworks" }
  );

  const toggleArtistPublish = trpc.admin.toggleArtistPublish.useMutation({
    onSuccess: () => { refetchArtists(); toast.success("작가 공개 상태가 변경되었습니다."); },
    onError: () => toast.error("변경에 실패했습니다."),
  });

  const deleteArtistMutation = trpc.admin.deleteArtist.useMutation({
    onSuccess: () => { refetchArtists(); toast.success("작가가 삭제되었습니다."); },
    onError: () => toast.error("삭제에 실패했습니다."),
  });

  const toggleArtworkPublish = trpc.admin.toggleArtworkPublish.useMutation({
    onSuccess: () => { refetchArtworks(); refetchArtists(); toast.success("작품 공개 상태가 변경되었습니다."); },
    onError: () => toast.error("변경에 실패했습니다."),
  });

  const deleteArtworkMutation = trpc.admin.deleteArtwork.useMutation({
    onSuccess: () => { refetchArtworks(); refetchArtists(); toast.success("작품이 삭제되었습니다."); },
    onError: () => toast.error("삭제에 실패했습니다."),
  });

  if (loading) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="gallery-caption" style={{ color: "rgba(201,169,110,0.5)", letterSpacing: "0.2em", fontSize: "0.65rem" }}>LOADING...</p>
        </div>
      </GalleryLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div style={{ color: "#c9a96e", fontSize: "2rem" }}>🔒</div>
          <p style={{ color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.9rem" }}>
            관리자만 접근할 수 있는 페이지입니다.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="gallery-caption hover:opacity-80"
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "6px 16px", fontSize: "0.5rem", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            ← 홈으로
          </button>
        </div>
      </GalleryLayout>
    );
  }

  const artistCount = artists?.length ?? 0;
  const publishedArtistCount = artists?.filter(a => a.isPublished).length ?? 0;
  const artworkCount = artists?.reduce((sum, a) => sum + (a._artworkCount ?? 0), 0) ?? 0;

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-8 py-10" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* 헤더 */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <p className="gallery-caption mb-2" style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.3em" }}>ADMIN DASHBOARD</p>
          <h1 className="gallery-title" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#f0ebe0" }}>관리자 대시보드</h1>
          <p style={{ fontSize: "0.75rem", color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif", marginTop: "0.25rem" }}>
            전시회 작가와 작품을 관리합니다
          </p>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "전체 작가", value: artistCount, sub: `공개 ${publishedArtistCount}명` },
            { label: "전체 작품", value: artworkCount, sub: "등록된 작품" },
            { label: "공개율", value: artistCount ? `${Math.round(publishedArtistCount / artistCount * 100)}%` : "0%", sub: "작가 공개 비율" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.12)", padding: "1rem 1.25rem" }}>
              <p className="gallery-caption mb-1" style={{ fontSize: "0.42rem", color: "#c9a96e", letterSpacing: "0.2em" }}>{label.toUpperCase()}</p>
              <p className="gallery-title" style={{ fontSize: "1.6rem", color: "#f0ebe0" }}>{value}</p>
              <p style={{ fontSize: "0.62rem", color: "rgba(240,235,224,0.35)", fontFamily: "'Noto Serif KR', serif" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
          {(["artists", "artworks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="gallery-caption transition-all duration-200"
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #c9a96e" : "2px solid transparent",
                color: activeTab === tab ? "#c9a96e" : "rgba(201,169,110,0.4)",
                padding: "0.6rem 1.2rem",
                fontSize: "0.5rem",
                letterSpacing: "0.2em",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              {tab === "artists" ? "작가 관리" : "작품 관리"}
            </button>
          ))}
        </div>

        {/* 작가 관리 탭 */}
        {activeTab === "artists" && (
          <div>
            {!artists || artists.length === 0 ? (
              <p className="text-center py-12" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.8rem" }}>
                등록된 작가가 없습니다.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {artists.map((artist, idx) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.12)" }}
                  >
                    {/* 작가 행 */}
                    <div className="flex items-center gap-4 p-4">
                      <img
                        src={artist.profileImageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name ?? '')}&background=2c1f0e&color=c9a96e&size=80`}
                        alt={artist.name ?? ""}
                        className="rounded-full object-cover flex-shrink-0"
                        style={{ width: "44px", height: "44px" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="gallery-title" style={{ fontSize: "0.95rem", color: "#f0ebe0" }}>{artist.name ?? "이름 없음"}</p>
                        <p className="gallery-caption" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}>
                          {(artist.nameEn ?? "").toUpperCase()} · {artist.specialty ?? "-"} · 작품 {artist._artworkCount ?? 0}점
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 공개 토글 */}
                        <button
                          onClick={() => toggleArtistPublish.mutate({ id: artist.id, isPublished: !artist.isPublished })}
                          className="gallery-caption transition-all duration-200 hover:opacity-80"
                          style={{
                            background: artist.isPublished ? "rgba(201,169,110,0.15)" : "rgba(30,28,48,0.8)",
                            border: `1px solid ${artist.isPublished ? "rgba(201,169,110,0.5)" : "rgba(201,169,110,0.2)"}`,
                            color: artist.isPublished ? "#c9a96e" : "rgba(201,169,110,0.4)",
                            padding: "4px 10px",
                            fontSize: "0.42rem",
                            letterSpacing: "0.1em",
                            cursor: "pointer",
                          }}
                        >
                          {artist.isPublished ? "공개중" : "비공개"}
                        </button>
                        {/* 작품 펼치기 */}
                        <button
                          onClick={() => setExpandedArtist(expandedArtist === artist.id ? null : artist.id)}
                          className="gallery-caption transition-all duration-200 hover:opacity-80"
                          style={{ background: "none", border: "1px solid rgba(201,169,110,0.15)", color: "rgba(201,169,110,0.5)", padding: "4px 10px", fontSize: "0.42rem", letterSpacing: "0.1em", cursor: "pointer" }}
                        >
                          {expandedArtist === artist.id ? "접기" : "작품 보기"}
                        </button>
                        {/* 삭제 */}
                        <button
                          onClick={() => {
                            if (confirm(`"${artist.name}" 작가와 모든 작품을 삭제하시겠습니까?`)) {
                              deleteArtistMutation.mutate({ id: artist.id });
                            }
                          }}
                          className="gallery-caption transition-all duration-200 hover:opacity-80"
                          style={{ background: "none", border: "1px solid rgba(192,57,43,0.3)", color: "rgba(192,57,43,0.6)", padding: "4px 10px", fontSize: "0.42rem", letterSpacing: "0.1em", cursor: "pointer" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* 작품 목록 (펼쳐졌을 때) */}
                    {expandedArtist === artist.id && (
                      <ArtistArtworkList
                        artistId={artist.id}
                        onTogglePublish={(id, val) => toggleArtworkPublish.mutate({ id, isPublished: val })}
                        onDelete={(id) => { if (confirm("이 작품을 삭제하시겠습니까?")) deleteArtworkMutation.mutate({ id }); }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 작품 전체 관리 탭 */}
        {activeTab === "artworks" && (
          <div>
            {!allArtworks || allArtworks.length === 0 ? (
              <p className="text-center py-12" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.8rem" }}>
                등록된 작품이 없습니다.
              </p>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {allArtworks.map((artwork: typeof allArtworks[0], idx: number) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.12)" }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      {artwork.mediaType === "video" ? (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(12,10,20,0.8)" }}>
                          <span className="gallery-caption" style={{ color: "#c9a96e", fontSize: "0.6rem", letterSpacing: "0.2em" }}>VIDEO</span>
                        </div>
                      ) : (
                        <img src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""} alt={artwork.titleKo} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="gallery-title mb-0.5" style={{ fontSize: "0.85rem", color: "#f0ebe0" }}>{artwork.titleKo}</p>
                      <p className="gallery-caption mb-3" style={{ fontSize: "0.4rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}>
                        {(artwork.titleEn ?? "").toUpperCase()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleArtworkPublish.mutate({ id: artwork.id, isPublished: !artwork.isPublished })}
                          className="gallery-caption flex-1 transition-all duration-200 hover:opacity-80"
                          style={{
                            background: artwork.isPublished ? "rgba(201,169,110,0.12)" : "none",
                            border: `1px solid ${artwork.isPublished ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.15)"}`,
                            color: artwork.isPublished ? "#c9a96e" : "rgba(201,169,110,0.4)",
                            padding: "4px 0",
                            fontSize: "0.4rem",
                            letterSpacing: "0.1em",
                            cursor: "pointer",
                          }}
                        >
                          {artwork.isPublished ? "공개중" : "비공개"}
                        </button>
                        <button
                          onClick={() => { if (confirm("이 작품을 삭제하시겠습니까?")) deleteArtworkMutation.mutate({ id: artwork.id }); }}
                          className="gallery-caption transition-all duration-200 hover:opacity-80"
                          style={{ background: "none", border: "1px solid rgba(192,57,43,0.3)", color: "rgba(192,57,43,0.6)", padding: "4px 10px", fontSize: "0.4rem", letterSpacing: "0.1em", cursor: "pointer" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GalleryLayout>
  );
}

// 작가별 작품 목록 서브컴포넌트
function ArtistArtworkList({
  artistId,
  onTogglePublish,
  onDelete,
}: {
  artistId: number;
  onTogglePublish: (id: number, val: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const { data: artworks } = trpc.gallery.listArtworks.useQuery({ artistId }, { enabled: true });

  if (!artworks || artworks.length === 0) {
    return (
      <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <p style={{ color: "rgba(240,235,224,0.25)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.7rem", paddingTop: "0.75rem" }}>
          등록된 작품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
      <p className="gallery-caption pt-3 mb-2" style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.15em" }}>
        ARTWORKS ({artworks.length})
      </p>
      <div className="flex flex-col gap-2">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="flex items-center gap-3" style={{ background: "rgba(12,10,20,0.3)", padding: "0.5rem 0.75rem" }}>
            {artwork.mediaType !== "video" && (
              <img
                src={artwork.thumbnailUrl ?? artwork.mediaUrl ?? ""}
                alt={artwork.titleKo}
                className="object-cover flex-shrink-0"
                style={{ width: "36px", height: "36px" }}
              />
            )}
            {artwork.mediaType === "video" && (
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: "36px", height: "36px", background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}>
                <span style={{ color: "#c9a96e", fontSize: "0.55rem" }}>▶</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.7)", fontFamily: "'Noto Serif KR', serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {artwork.titleKo}
              </p>
              <p className="gallery-caption" style={{ fontSize: "0.38rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.08em" }}>
                {artwork.year ?? "2025"} · {artwork.medium ?? "AI 아트"}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => onTogglePublish(artwork.id, !artwork.isPublished)}
                className="gallery-caption hover:opacity-80"
                style={{
                  background: artwork.isPublished ? "rgba(201,169,110,0.1)" : "none",
                  border: `1px solid ${artwork.isPublished ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.15)"}`,
                  color: artwork.isPublished ? "#c9a96e" : "rgba(201,169,110,0.35)",
                  padding: "3px 8px", fontSize: "0.38rem", letterSpacing: "0.08em", cursor: "pointer",
                }}
              >
                {artwork.isPublished ? "공개" : "비공개"}
              </button>
              <button
                onClick={() => onDelete(artwork.id)}
                className="gallery-caption hover:opacity-80"
                style={{ background: "none", border: "1px solid rgba(192,57,43,0.25)", color: "rgba(192,57,43,0.5)", padding: "3px 8px", fontSize: "0.38rem", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
