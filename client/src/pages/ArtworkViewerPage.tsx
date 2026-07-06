/**
 * ArtworkViewerPage — 작품 상세 뷰어 (DB 연동, 이미지/동영상 지원)
 * Design: "Ink & Light" — 전체 화면 몰입형 뷰어
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

/** 브라우저 핑거프린트 — 로그인 없이도 좋아요 중복 방지 */
function useFingerprint() {
  return useMemo(() => {
    const key = "gallery_fp";
    let fp = localStorage.getItem(key);
    if (!fp) {
      fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, fp);
    }
    return fp;
  }, []);
}

export default function ArtworkViewerPage() {
  const params = useParams<{ id: string; artworkId: string }>();
  const [, setLocation] = useLocation();
  const [showInfo, setShowInfo] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [direction, setDirection] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const { user } = useAuth();
  const fingerprint = useFingerprint();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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

  // 좋아요
  const { data: likeStatus, refetch: refetchLike } = trpc.like.status.useQuery(
    { artworkId: artworkId, fingerprint },
    { enabled: artworkId > 0 }
  );
  const toggleLike = trpc.like.toggle.useMutation({
    onSuccess: () => refetchLike(),
    onError: () => toast.error("좋아요 처리 중 오류가 발생했습니다."),
  });

  // 댓글
  const { data: comments, refetch: refetchComments } = trpc.comment.list.useQuery(
    { artworkId: artworkId },
    { enabled: artworkId > 0 }
  );
  const addComment = trpc.comment.add.useMutation({
    onSuccess: () => {
      refetchComments();
      setCommentText("");
      toast.success("감상이 등록되었습니다!");
    },
    onError: () => toast.error("댓글 등록 중 오류가 발생했습니다."),
  });
  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: () => { refetchComments(); toast.success("댓글이 삭제되었습니다."); },
  });

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
          <div className="flex items-center gap-2">
            <span className="gallery-caption" style={{ fontSize: "0.45rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.1em" }}>
              {artworkIndex + 1} / {artworks.length}
            </span>
            {/* 좋아요 버튼 */}
            <button
              onClick={() => toggleLike.mutate({ artworkId, fingerprint })}
              disabled={toggleLike.isPending}
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95 flex items-center gap-1"
              style={{
                background: likeStatus?.liked ? "rgba(192,57,43,0.15)" : "none",
                border: `1px solid ${likeStatus?.liked ? "rgba(192,57,43,0.5)" : "rgba(201,169,110,0.2)"}`,
                color: likeStatus?.liked ? "#e74c3c" : "rgba(201,169,110,0.6)",
                padding: "4px 10px", fontSize: "0.45rem", letterSpacing: "0.1em", cursor: "pointer"
              }}
            >
              {likeStatus?.liked ? "♥" : "♡"} {likeStatus?.count ?? 0}
            </button>
            {/* 댓글 버튼 */}
            <button
              onClick={() => { setShowComments(v => !v); setShowInfo(false); }}
              className="gallery-caption transition-all duration-200 hover:opacity-80"
              style={{ background: showComments ? "rgba(201,169,110,0.15)" : "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(201,169,110,0.6)", padding: "4px 10px", fontSize: "0.45rem", letterSpacing: "0.1em", cursor: "pointer" }}
            >
              ✍ {comments?.length ?? 0}
            </button>
            <button
              onClick={() => { setShowInfo((v) => !v); setShowComments(false); }}
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

                {/* AI 프롬프트 */}
                {artwork.aiPrompt && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p className="gallery-caption mb-2" style={{ fontSize: "0.42rem", color: "#c9a96e", letterSpacing: "0.2em" }}>AI PROMPT</p>
                    <p style={{
                      fontSize: "0.78rem", color: "rgba(240,235,224,0.55)", fontFamily: "monospace",
                      lineHeight: 1.75, background: "rgba(201,169,110,0.05)",
                      border: "1px solid rgba(201,169,110,0.12)", padding: "10px 12px",
                      wordBreak: "break-all",
                    }}>
                      {artwork.aiPrompt}
                    </p>
                  </div>
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

        {/* 감상 댓글 패널 (슬라이드업) */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed bottom-0 left-0 right-0 z-40"
              style={{ background: "rgba(18,18,30,0.97)", borderTop: "1px solid rgba(201,169,110,0.2)", maxHeight: "55vh", overflowY: "auto" }}
            >
              <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.25rem 1.5rem 2rem" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="gallery-caption" style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.2em" }}>VISITOR IMPRESSIONS</p>
                  <button onClick={() => setShowComments(false)} style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
                </div>

                {/* 댓글 입력 */}
                <div className="mb-5" style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.15)", padding: "1rem" }}>
                  {!user && (
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="닉네임 (선택)"
                      className="w-full mb-2"
                      style={{ background: "rgba(12,10,20,0.5)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "5px 10px", fontSize: "0.72rem", fontFamily: "'Noto Serif KR', serif", outline: "none" }}
                    />
                  )}
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="이 작품에 대한 감상을 남겨주세요... (최대 500자)"
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none"
                    style={{ background: "rgba(12,10,20,0.5)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "8px 10px", fontSize: "0.78rem", fontFamily: "'Noto Serif KR', serif", outline: "none", lineHeight: 1.7 }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span style={{ fontSize: "0.62rem", color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif" }}>{commentText.length}/500</span>
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        addComment.mutate({ artworkId, content: commentText.trim(), guestName: guestName.trim() || undefined });
                      }}
                      disabled={!commentText.trim() || addComment.isPending}
                      className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                      style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.35)", color: "#c9a96e", padding: "5px 14px", fontSize: "0.45rem", letterSpacing: "0.15em", cursor: "pointer" }}
                    >
                      {addComment.isPending ? "..." : "감상 남기기"}
                    </button>
                  </div>
                </div>

                {/* 댓글 목록 */}
                {!comments || comments.length === 0 ? (
                  <p className="text-center py-6" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.78rem" }}>
                    아직 감상이 없습니다. 첫 번째 감상을 남겨보세요.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {comments.map((c) => (
                      <div key={c.id} style={{ borderBottom: "1px solid rgba(201,169,110,0.08)", paddingBottom: "0.75rem" }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.7)", fontFamily: "'Noto Serif KR', serif", fontWeight: 600 }}>
                            {c.guestName ?? "익명의 관람객"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "0.55rem", color: "rgba(240,235,224,0.25)", fontFamily: "'Noto Serif KR', serif" }}>
                              {new Date(c.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                            </span>
                            {(user?.role === "admin" || (user && c.userId === user.id)) && (
                              <button
                                onClick={() => deleteComment.mutate({ id: c.id })}
                                style={{ background: "none", border: "none", color: "rgba(192,57,43,0.4)", cursor: "pointer", fontSize: "0.65rem", lineHeight: 1 }}
                              >×</button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.8 }}>
                          {c.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 제목 (정보/댓글 패널 닫혔을 때) */}
        {!showInfo && !showComments && (
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
