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
  const [activeTab, setActiveTab] = useState<"artists" | "artworks" | "invitations" | "exhibitions">("exhibitions");
  const [expandedArtist, setExpandedArtist] = useState<number | null>(null);
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [showExhibitionForm, setShowExhibitionForm] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<any | null>(null);
  const [exForm, setExForm] = useState({ slug: '', titleKo: '', titleEn: '', description: '', curatorName: '', subtitle: '', maxArtists: 10, genre: '', season: '', status: 'draft' as 'draft' | 'active' | 'closed', isPublished: false });

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

  const { data: exhibitions, refetch: refetchExhibitions } = trpc.exhibition.listAll.useQuery(
    undefined,
    { enabled: user?.role === "admin" && activeTab === "exhibitions" }
  );
  const createExhibitionMutation = trpc.exhibition.create.useMutation({
    onSuccess: () => { refetchExhibitions(); setShowExhibitionForm(false); setExForm({ slug: '', titleKo: '', titleEn: '', description: '', curatorName: '', subtitle: '', maxArtists: 10, genre: '', season: '', status: 'draft', isPublished: false }); toast.success("전시회가 생성되었습니다!"); },
    onError: (e) => toast.error(e.message ?? "생성 실패"),
  });
  const updateExhibitionMutation = trpc.exhibition.update.useMutation({
    onSuccess: () => { refetchExhibitions(); setEditingExhibition(null); toast.success("전시회가 수정되었습니다."); },
    onError: (e) => toast.error(e.message ?? "수정 실패"),
  });
  const deleteExhibitionMutation = trpc.exhibition.delete.useMutation({
    onSuccess: () => { refetchExhibitions(); toast.success("전시회가 삭제되었습니다."); },
    onError: () => toast.error("삭제 실패"),
  });
  const assignArtistMutation = trpc.exhibition.assignArtist.useMutation({
    onSuccess: () => { refetchArtists(); refetchExhibitions(); toast.success("작가 배정이 변경되었습니다."); },
    onError: () => toast.error("배정 실패"),
  });

  const { data: invitations, refetch: refetchInvitations } = trpc.invitation.list.useQuery(
    undefined,
    { enabled: user?.role === "admin" && activeTab === "invitations" }
  );
  const createInviteMutation = trpc.invitation.create.useMutation({
    onSuccess: () => { refetchInvitations(); setNewSlotLabel(""); setIsCreatingInvite(false); toast.success("초대 링크가 생성되었습니다!"); },
    onError: () => toast.error("초대 링크 생성에 실패했습니다."),
  });
  const deleteInviteMutation = trpc.invitation.delete.useMutation({
    onSuccess: () => { refetchInvitations(); toast.success("초대 링크가 삭제되었습니다."); },
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
        <div className="flex gap-0 mb-6 flex-wrap" style={{ borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
          {(["exhibitions", "artists", "artworks", "invitations"] as const).map((tab) => (
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
              {tab === "exhibitions" ? "전시회 관리" : tab === "artists" ? "작가 관리" : tab === "artworks" ? "작품 관리" : "초대 링크"}
            </button>
          ))}
        </div>

        {/* 전시회 관리 탭 */}
        {activeTab === "exhibitions" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif" }}>
                전시회를 만들고 참여 인원 수, 작가 배정을 관리합니다.
              </p>
              <button
                onClick={() => { setEditingExhibition(null); setExForm({ slug: '', titleKo: '', titleEn: '', description: '', curatorName: '', subtitle: '', maxArtists: 10, genre: '', season: '', status: 'draft', isPublished: false }); setShowExhibitionForm(true); }}
                className="transition-all duration-150 active:scale-95 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)", border: "none", color: "#1c1a2e", padding: "10px 20px", fontSize: "0.65rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", borderRadius: "2px" }}
              >
                + 전시회 만들기
              </button>
            </div>

            {/* 전시회 생성/수정 폼 */}
            {(showExhibitionForm || editingExhibition) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-5"
                style={{ background: "rgba(30,28,48,0.8)", border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <h3 style={{ fontSize: "0.85rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif", marginBottom: "1rem" }}>
                  {editingExhibition ? "전시회 수정" : "새 전시회 만들기"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'titleKo', label: '전시회 이름 (한국어) *', placeholder: '예: 2025 AI 아트 특별전' },
                    { key: 'titleEn', label: '전시회 이름 (영문)', placeholder: '2025 AI Art Special Exhibition' },
                    { key: 'slug', label: 'URL 슬러그 * (영문 소문자+숫자+하이픈)', placeholder: '예: ai-art-2025' },
                    { key: 'curatorName', label: '큐레이터 이름', placeholder: '민경' },
                    { key: 'subtitle', label: '부제목', placeholder: '예: 빛과 창조의 경계에서' },
                    { key: 'genre', label: '장르', placeholder: 'AI 아트 · 캐릭터 디자인' },
                    { key: 'season', label: '시즌', placeholder: '2025 봄 특별전' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.6)", fontFamily: "sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>{label}</label>
                      <input
                        value={(exForm as any)[key]}
                        onChange={(e) => {
                          const val = key === 'slug'
                            ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                            : e.target.value;
                          setExForm(f => ({ ...f, [key]: val }));
                        }}
                        placeholder={placeholder}
                        style={{ width: "100%", background: "rgba(12,10,20,0.6)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "8px 10px", fontSize: "0.72rem", fontFamily: "'Noto Serif KR', serif", outline: "none" }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.6)", fontFamily: "sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>최대 참여 작가 수 (0=무제한)</label>
                    <input
                      type="number" min={0}
                      value={exForm.maxArtists}
                      onChange={(e) => setExForm(f => ({ ...f, maxArtists: parseInt(e.target.value) || 0 }))}
                      style={{ width: "100%", background: "rgba(12,10,20,0.6)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "8px 10px", fontSize: "0.72rem", fontFamily: "sans-serif", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.6)", fontFamily: "sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>상태</label>
                    <select
                      value={exForm.status}
                      onChange={(e) => setExForm(f => ({ ...f, status: e.target.value as any }))}
                      style={{ width: "100%", background: "rgba(12,10,20,0.6)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "8px 10px", fontSize: "0.72rem", fontFamily: "sans-serif", outline: "none" }}
                    >
                      <option value="draft">초안 (비공개)</option>
                      <option value="active">진행중</option>
                      <option value="closed">종료</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.6)", fontFamily: "sans-serif", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>전시회 설명</label>
                  <textarea
                    value={exForm.description}
                    onChange={(e) => setExForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="전시회에 대한 소개를 입력하세요"
                    style={{ width: "100%", background: "rgba(12,10,20,0.6)", border: "1px solid rgba(201,169,110,0.2)", color: "#f0ebe0", padding: "8px 10px", fontSize: "0.72rem", fontFamily: "'Noto Serif KR', serif", outline: "none", minHeight: "72px", resize: "vertical" }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setExForm(f => ({ ...f, isPublished: !f.isPublished }))}
                    style={{ width: "36px", height: "20px", borderRadius: "10px", background: exForm.isPublished ? "#c9a96e" : "rgba(201,169,110,0.2)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                  >
                    <span style={{ position: "absolute", top: "2px", left: exForm.isPublished ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                  <span style={{ fontSize: "0.65rem", color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif" }}>갤러리 목록에 공개</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      if (!exForm.titleKo || !exForm.slug) { toast.error("이름과 슬러그는 필수입니다."); return; }
                      if (editingExhibition) {
                        updateExhibitionMutation.mutate({ id: editingExhibition.id, ...exForm });
                      } else {
                        createExhibitionMutation.mutate(exForm);
                      }
                    }}
                    className="transition-all duration-150 active:scale-95 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)", border: "none", color: "#1c1a2e", padding: "8px 20px", fontSize: "0.65rem", fontWeight: 700, fontFamily: "sans-serif", cursor: "pointer", borderRadius: "2px" }}
                  >
                    {editingExhibition ? "수정 저장" : "전시회 생성"}
                  </button>
                  <button
                    onClick={() => { setShowExhibitionForm(false); setEditingExhibition(null); }}
                    style={{ background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(201,169,110,0.5)", padding: "8px 16px", fontSize: "0.65rem", fontFamily: "sans-serif", cursor: "pointer" }}
                  >
                    취소
                  </button>
                </div>
              </motion.div>
            )}

            {/* 전시회 목록 */}
            {!exhibitions || exhibitions.length === 0 ? (
              <div className="text-center py-16" style={{ border: "2px dashed rgba(201,169,110,0.1)", color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.8rem" }}>
                아직 전시회가 없습니다. 위 버튼으로 첫 전시회를 만들어 보세요!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {exhibitions.map((ex) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: "rgba(30,28,48,0.6)", border: "1px solid rgba(201,169,110,0.12)", padding: "1.25rem" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif" }}>{ex.titleKo}</span>
                          <span style={{ fontSize: "0.55rem", background: ex.status === 'active' ? 'rgba(80,200,120,0.15)' : ex.status === 'closed' ? 'rgba(200,80,80,0.15)' : 'rgba(201,169,110,0.1)', color: ex.status === 'active' ? '#50c878' : ex.status === 'closed' ? '#e07070' : '#c9a96e', padding: "2px 8px", borderRadius: "2px", fontFamily: "sans-serif", letterSpacing: "0.1em" }}>
                            {ex.status === 'active' ? '진행중' : ex.status === 'closed' ? '종료' : '초안'}
                          </span>
                          {ex.isPublished && <span style={{ fontSize: "0.5rem", background: "rgba(201,169,110,0.15)", color: "#c9a96e", padding: "2px 8px", borderRadius: "2px", fontFamily: "sans-serif" }}>공개</span>}
                        </div>
                        <p style={{ fontSize: "0.62rem", color: "rgba(201,169,110,0.5)", fontFamily: "sans-serif", marginBottom: "4px" }}>/{ex.slug}</p>
                        {ex.subtitle && <p style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif" }}>{ex.subtitle}</p>}
                        <div className="flex gap-4 mt-2 flex-wrap">
                          <span style={{ fontSize: "0.62rem", color: "rgba(240,235,224,0.4)", fontFamily: "sans-serif" }}>
                            최대 참여: <strong style={{ color: "#c9a96e" }}>{ex.maxArtists === 0 ? '무제한' : `${ex.maxArtists}명`}</strong>
                          </span>
                          {ex.curatorName && <span style={{ fontSize: "0.62rem", color: "rgba(240,235,224,0.4)", fontFamily: "sans-serif" }}>큐레이터: {ex.curatorName}</span>}
                          {ex.genre && <span style={{ fontSize: "0.62rem", color: "rgba(240,235,224,0.4)", fontFamily: "sans-serif" }}>장르: {ex.genre}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setEditingExhibition(ex); setExForm({ slug: ex.slug, titleKo: ex.titleKo, titleEn: ex.titleEn ?? '', description: ex.description ?? '', curatorName: ex.curatorName ?? '', subtitle: ex.subtitle ?? '', maxArtists: ex.maxArtists ?? 10, genre: ex.genre ?? '', season: ex.season ?? '', status: ex.status as any ?? 'draft', isPublished: ex.isPublished ?? false }); setShowExhibitionForm(false); }}
                          style={{ background: "none", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(201,169,110,0.6)", padding: "5px 12px", fontSize: "0.55rem", fontFamily: "sans-serif", cursor: "pointer" }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => { if (confirm(`"${ex.titleKo}" 전시회를 삭제하시겠습니까?`)) deleteExhibitionMutation.mutate({ id: ex.id }); }}
                          style={{ background: "none", border: "1px solid rgba(200,80,80,0.2)", color: "rgba(200,80,80,0.5)", padding: "5px 12px", fontSize: "0.55rem", fontFamily: "sans-serif", cursor: "pointer" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* 작가 배정 섹션 */}
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
                      <p style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.2em", fontFamily: "sans-serif", marginBottom: "8px" }}>ARTIST ASSIGNMENT</p>
                      {!artists || artists.length === 0 ? (
                        <p style={{ fontSize: "0.65rem", color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif" }}>등록된 작가가 없습니다.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {artists.map((artist) => {
                            const assigned = artist.exhibitionId === ex.id;
                            return (
                              <button
                                key={artist.id}
                                onClick={() => assignArtistMutation.mutate({ artistId: artist.id, exhibitionId: assigned ? null : ex.id })}
                                style={{ background: assigned ? "rgba(201,169,110,0.15)" : "rgba(30,28,48,0.5)", border: `1px solid ${assigned ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.1)"}`, color: assigned ? "#c9a96e" : "rgba(240,235,224,0.4)", padding: "4px 10px", fontSize: "0.6rem", fontFamily: "'Noto Serif KR', serif", cursor: "pointer", transition: "all 0.15s" }}
                              >
                                {assigned ? "✓ " : ""}{artist.name ?? "이름 없음"}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {/* 초대 링크 탭 */}
        {activeTab === "invitations" && (
          <div>
            {/* 새 초대 링크 생성 */}
            <div className="mb-6" style={{ background: "rgba(30,28,48,0.7)", border: "1px solid rgba(201,169,110,0.15)", padding: "1.25rem 1.5rem" }}>
              <p className="gallery-caption mb-3" style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.2em" }}>NEW INVITATION</p>
              {isCreatingInvite ? (
                <div className="flex gap-3 items-center flex-wrap">
                  <input
                    type="text"
                    value={newSlotLabel}
                    onChange={e => setNewSlotLabel(e.target.value)}
                    placeholder="작가 슬롯 이름 (예: 작가 1번 — 홍길동)"
                    className="flex-1"
                    style={{ background: "rgba(12,10,20,0.6)", border: "1px solid rgba(201,169,110,0.25)", color: "#f0ebe0", padding: "6px 12px", fontSize: "0.75rem", fontFamily: "'Noto Serif KR', serif", outline: "none", minWidth: "200px" }}
                  />
                  <button
                    onClick={() => { if (newSlotLabel.trim()) createInviteMutation.mutate({ slotLabel: newSlotLabel.trim() }); }}
                    disabled={!newSlotLabel.trim() || createInviteMutation.isPending}
                    className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                    style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "6px 16px", fontSize: "0.48rem", letterSpacing: "0.15em", cursor: "pointer" }}
                  >
                    {createInviteMutation.isPending ? "...": "생성"}
                  </button>
                  <button
                    onClick={() => setIsCreatingInvite(false)}
                    className="gallery-caption transition-all duration-200 hover:opacity-60"
                    style={{ background: "none", border: "none", color: "rgba(240,235,224,0.3)", fontSize: "0.48rem", letterSpacing: "0.1em", cursor: "pointer" }}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingInvite(true)}
                  className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "rgba(201,169,110,0.7)", padding: "6px 16px", fontSize: "0.48rem", letterSpacing: "0.15em", cursor: "pointer" }}
                >
                  + 초대 링크 생성
                </button>
              )}
            </div>

            {/* 초대 링크 목록 */}
            {!invitations || invitations.length === 0 ? (
              <p className="text-center py-12" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.8rem" }}>
                생성된 초대 링크가 없습니다.
              </p>
            ) : (
              <div className="grid gap-3">
                {invitations.map((inv) => {
                  const inviteUrl = `${window.location.origin}/invite/${inv.token}`;
                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: "rgba(30,28,48,0.7)", border: `1px solid ${inv.isUsed ? "rgba(201,169,110,0.08)" : "rgba(201,169,110,0.2)"}`, padding: "1rem 1.25rem" }}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="gallery-caption"
                              style={{ fontSize: "0.4rem", letterSpacing: "0.12em", padding: "2px 6px", background: inv.isUsed ? "rgba(120,120,120,0.15)" : "rgba(201,169,110,0.12)", color: inv.isUsed ? "rgba(240,235,224,0.3)" : "#c9a96e", border: `1px solid ${inv.isUsed ? "rgba(120,120,120,0.2)" : "rgba(201,169,110,0.3)"}` }}
                            >
                              {inv.isUsed ? "USED" : "ACTIVE"}
                            </span>
                            <p className="gallery-title" style={{ fontSize: "0.85rem", color: inv.isUsed ? "rgba(240,235,224,0.4)" : "#f0ebe0" }}>{inv.slotLabel}</p>
                          </div>
                          <p
                            className="gallery-caption"
                            style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.05em", wordBreak: "break-all" }}
                          >
                            {inviteUrl}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          {!inv.isUsed && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("초대 링크가 복사되었습니다!"); }}
                              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                              style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "4px 10px", fontSize: "0.42rem", letterSpacing: "0.1em", cursor: "pointer" }}
                            >
                              봅사
                            </button>
                          )}
                          <button
                            onClick={() => { if (confirm("이 초대 링크를 삭제하시겠습니까?")) deleteInviteMutation.mutate({ id: inv.id }); }}
                            className="gallery-caption transition-all duration-200 hover:opacity-80"
                            style={{ background: "none", border: "1px solid rgba(192,57,43,0.3)", color: "rgba(192,57,43,0.6)", padding: "4px 10px", fontSize: "0.42rem", letterSpacing: "0.1em", cursor: "pointer" }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* 사용 안내 */}
            <div className="mt-8 p-4" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.1)" }}>
              <p className="gallery-caption mb-2" style={{ fontSize: "0.45rem", color: "#c9a96e", letterSpacing: "0.2em" }}>HOW TO INVITE</p>
              <ol style={{ paddingLeft: "1.2rem", color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.72rem", lineHeight: 2 }}>
                <li>"초대 링크 생성" 버튼으로 작가별 초대 링크를 만듭니다.</li>
                <li>"복사" 버튼으로 링크를 복사해 작가에게 카카오톡 등으로 전송합니다.</li>
                <li>작가가 링크를 클릭하면 Manus 로그인 후 자동으로 작가 등록이 완료됩니다.</li>
                <li>등록 후 마이페이지에서 프로필과 작품을 업로드할 수 있습니다.</li>
              </ol>
            </div>
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
