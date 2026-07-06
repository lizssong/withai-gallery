/**
 * MyPage — 작가 마이페이지
 * - 로그인 필요
 * - 작가 프로필 등록/수정
 * - 작품 이미지/동영상 업로드, 수정, 삭제
 */
import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// ── 파일 → base64 변환 ────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 업로드 진행 상태 표시 ─────────────────────────────────────────────────────
function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: "0.65rem", color: "rgba(201,169,110,0.7)", fontFamily: "sans-serif" }}>
          업로드 중...
        </span>
        <span style={{ fontSize: "0.65rem", color: "#c9a96e" }}>{progress}%</span>
      </div>
      <div style={{ height: "3px", background: "rgba(201,169,110,0.15)", borderRadius: "2px" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#c9a96e",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── 작품 카드 ─────────────────────────────────────────────────────────────────
type ArtworkItem = {
  id: number;
  titleKo: string;
  titleEn: string;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  mediaType: "image" | "video";
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  tags?: string | null;
  isPublished: boolean;
};

function ArtworkCard({
  artwork,
  onEdit,
  onDelete,
}: {
  artwork: ArtworkItem;
  onEdit: (artwork: ArtworkItem) => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const thumb = artwork.thumbnailUrl || artwork.mediaUrl;

  return (
    <div
      style={{
        background: "rgba(30,28,48,0.8)",
        border: "1px solid rgba(201,169,110,0.12)",
        overflow: "hidden",
      }}
    >
      {/* 미디어 미리보기 */}
      <div className="relative" style={{ aspectRatio: "4/3", background: "#0c0a14" }}>
        {thumb ? (
          artwork.mediaType === "video" && !artwork.thumbnailUrl ? (
            <video
              src={thumb}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img src={thumb} alt={artwork.titleKo} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: "rgba(201,169,110,0.3)", fontSize: "2rem" }}>
              {artwork.mediaType === "video" ? "▶" : "🖼"}
            </span>
          </div>
        )}
        {/* 공개 여부 뱃지 */}
        <div
          className="absolute top-2 left-2"
          style={{
            background: artwork.isPublished ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
            border: `1px solid ${artwork.isPublished ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
            color: artwork.isPublished ? "#86efac" : "#fca5a5",
            fontSize: "0.42rem",
            padding: "2px 6px",
            fontFamily: "sans-serif",
            letterSpacing: "0.08em",
          }}
        >
          {artwork.isPublished ? "공개" : "비공개"}
        </div>
        {/* 동영상 뱃지 */}
        {artwork.mediaType === "video" && (
          <div
            className="absolute top-2 right-2"
            style={{
              background: "rgba(12,10,20,0.7)",
              border: "1px solid rgba(201,169,110,0.3)",
              color: "#c9a96e",
              fontSize: "0.42rem",
              padding: "2px 6px",
              fontFamily: "sans-serif",
            }}
          >
            VIDEO
          </div>
        )}
      </div>

      {/* 작품 정보 */}
      <div className="p-3">
        <h3
          style={{
            fontSize: "0.9rem",
            color: "#f0ebe0",
            fontFamily: "'Playfair Display', serif",
            marginBottom: "2px",
          }}
        >
          {artwork.titleKo}
        </h3>
        {artwork.titleEn && (
          <p
            style={{
              fontSize: "0.5rem",
              color: "rgba(201,169,110,0.5)",
              fontFamily: "sans-serif",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            {artwork.titleEn.toUpperCase()}
          </p>
        )}
        {artwork.description && (
          <p
            style={{
              fontSize: "0.68rem",
              color: "rgba(240,235,224,0.45)",
              fontFamily: "'Noto Serif KR', serif",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: "6px",
            }}
          >
            {artwork.description}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit(artwork)}
            className="flex-1 transition-all duration-150 hover:opacity-80 active:scale-95"
            style={{
              background: "rgba(201,169,110,0.1)",
              border: "1px solid rgba(201,169,110,0.25)",
              color: "#c9a96e",
              padding: "5px 0",
              fontSize: "0.55rem",
              fontFamily: "sans-serif",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            수정
          </button>
          {confirmDelete ? (
            <button
              onClick={() => { onDelete(artwork.id); setConfirmDelete(false); }}
              className="flex-1 transition-all duration-150 hover:opacity-80 active:scale-95"
              style={{
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                padding: "5px 0",
                fontSize: "0.55rem",
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              확인 삭제
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 transition-all duration-150 hover:opacity-80 active:scale-95"
              style={{
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.6)",
                padding: "5px 0",
                fontSize: "0.55rem",
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 작품 업로드/수정 모달 ─────────────────────────────────────────────────────
type ArtworkFormData = {
  id?: number;
  titleKo: string;
  titleEn: string;
  description: string;
  year: string;
  medium: string;
  tags: string;
  aiPrompt: string;
  isPublished: boolean;
  mediaType: "image" | "video";
  mediaFile?: File;
  thumbnailFile?: File;
};

function ArtworkModal({
  initial,
  onClose,
  onSave,
  loading,
  uploadProgress,
}: {
  initial?: Partial<ArtworkFormData>;
  onClose: () => void;
  onSave: (data: ArtworkFormData) => Promise<void>;
  loading: boolean;
  uploadProgress: number;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ArtworkFormData>({
    titleKo: initial?.titleKo ?? "",
    titleEn: initial?.titleEn ?? "",
    description: initial?.description ?? "",
    year: initial?.year ?? "2025",
    medium: initial?.medium ?? "",
    tags: initial?.tags ?? "",
    aiPrompt: (initial as any)?.aiPrompt ?? "",
    isPublished: initial?.isPublished ?? true,
    mediaType: initial?.mediaType ?? "image",
    id: initial?.id,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, mediaFile: file, mediaType: file.type.startsWith("video") ? "video" : "image" }));
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, thumbnailFile: file }));
  };

  const inputStyle = {
    background: "rgba(12,10,20,0.6)",
    border: "1px solid rgba(201,169,110,0.2)",
    color: "#f0ebe0",
    padding: "8px 10px",
    fontSize: "0.78rem",
    fontFamily: "'Noto Serif KR', serif",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    fontSize: "0.45rem",
    color: "#c9a96e",
    letterSpacing: "0.2em",
    fontFamily: "sans-serif",
    display: "block",
    marginBottom: "4px",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,20,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="w-full overflow-y-auto"
        style={{
          maxWidth: "560px",
          maxHeight: "90vh",
          background: "rgba(22,20,36,0.98)",
          border: "1px solid rgba(201,169,110,0.2)",
          padding: "1.5rem",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            style={{ fontSize: "1.1rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif" }}
          >
            {isEdit ? "작품 수정" : "새 작품 업로드"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* 파일 업로드 (신규만) */}
          {!isEdit && (
            <div>
              <label style={labelStyle}>작품 파일 (이미지 / 동영상) *</label>
              <div
                onClick={() => mediaInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-150 hover:opacity-80"
                style={{
                  border: "2px dashed rgba(201,169,110,0.25)",
                  padding: "1.5rem",
                  background: "rgba(12,10,20,0.4)",
                  minHeight: "100px",
                }}
              >
                {preview ? (
                  form.mediaType === "video" ? (
                    <video src={preview} className="max-h-32 max-w-full object-contain" muted />
                  ) : (
                    <img src={preview} alt="preview" className="max-h-32 max-w-full object-contain" />
                  )
                ) : (
                  <>
                    <span style={{ fontSize: "1.5rem", color: "rgba(201,169,110,0.4)" }}>↑</span>
                    <span style={{ fontSize: "0.7rem", color: "rgba(201,169,110,0.5)", fontFamily: "sans-serif" }}>
                      클릭하여 파일 선택
                    </span>
                    <span style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.3)", fontFamily: "sans-serif" }}>
                      JPG, PNG, GIF, MP4, MOV (최대 50MB)
                    </span>
                  </>
                )}
              </div>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaChange}
              />
              {form.mediaType === "video" && (
                <div className="mt-2">
                  <label style={labelStyle}>동영상 썸네일 이미지 (선택)</label>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    style={{ ...inputStyle, padding: "4px 8px", fontSize: "0.65rem" }}
                    onChange={handleThumbChange}
                  />
                </div>
              )}
              {loading && <UploadProgress progress={uploadProgress} />}
            </div>
          )}

          {/* 제목 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>작품 제목 (한국어) *</label>
              <input
                style={inputStyle}
                value={form.titleKo}
                onChange={(e) => setForm((f) => ({ ...f, titleKo: e.target.value }))}
                placeholder="예: 빛의 정원"
              />
            </div>
            <div>
              <label style={labelStyle}>작품 제목 (영문)</label>
              <input
                style={inputStyle}
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                placeholder="Garden of Light"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label style={labelStyle}>작품 설명</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="작품에 대한 설명을 입력하세요"
            />
          </div>

          {/* 연도 / 미디엄 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>제작 연도</label>
              <input
                style={inputStyle}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2025"
              />
            </div>
            <div>
              <label style={labelStyle}>미디엄</label>
              <input
                style={inputStyle}
                value={form.medium}
                onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                placeholder="AI 생성 이미지"
              />
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label style={labelStyle}>태그 (쉼표로 구분)</label>
            <input
              style={inputStyle}
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="AI아트, 캐릭터, 판타지"
            />
          </div>

          {/* AI 프롬프트 */}
          <div>
            <label style={labelStyle}>AI 프롬프트 (선택)</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              value={form.aiPrompt}
              onChange={(e) => setForm((f) => ({ ...f, aiPrompt: e.target.value }))}
              placeholder="이 작품을 생성할 때 사용한 AI 프롬프트를 입력하세요. 관람객에게 창작 과정을 공유할 수 있습니다."
            />
          </div>

          {/* 공개 여부 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "10px",
                background: form.isPublished ? "#c9a96e" : "rgba(201,169,110,0.2)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: form.isPublished ? "18px" : "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
            <span style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif" }}>
              {form.isPublished ? "갤러리에 공개" : "비공개 (나만 볼 수 있음)"}
            </span>
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={() => onSave(form)}
            disabled={loading || (!isEdit && !form.mediaFile) || !form.titleKo}
            className="w-full transition-all duration-150 hover:opacity-80 active:scale-95"
            style={{
              background: loading || (!isEdit && !form.mediaFile) || !form.titleKo
                ? "rgba(201,169,110,0.2)"
                : "linear-gradient(135deg, #2c1f0e 0%, #4a3728 100%)",
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.3)",
              padding: "10px",
              fontSize: "0.65rem",
              fontFamily: "sans-serif",
              letterSpacing: "0.2em",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {loading ? "저장 중..." : isEdit ? "수정 저장" : "작품 업로드"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── 프로필 편집 모달 ──────────────────────────────────────────────────────────
function ProfileModal({
  initial,
  onClose,
  onSave,
  loading,
}: {
  initial?: {
    name?: string;
    nameEn?: string;
    specialty?: string | null;
    bio?: string | null;
    tools?: string | null;
    sns?: string | null;
  };
  onClose: () => void;
  onSave: (data: {
    name: string; nameEn: string; specialty: string; bio: string; tools: string; sns: string;
    profileImageFile?: File;
  }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    specialty: initial?.specialty ?? "",
    bio: initial?.bio ?? "",
    tools: initial?.tools ?? "",
    sns: initial?.sns ?? "",
    profileImageFile: undefined as File | undefined,
  });
  const imgRef = useRef<HTMLInputElement>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const inputStyle = {
    background: "rgba(12,10,20,0.6)",
    border: "1px solid rgba(201,169,110,0.2)",
    color: "#f0ebe0",
    padding: "8px 10px",
    fontSize: "0.78rem",
    fontFamily: "'Noto Serif KR', serif",
    width: "100%",
    outline: "none",
  };
  const labelStyle = {
    fontSize: "0.45rem",
    color: "#c9a96e",
    letterSpacing: "0.2em",
    fontFamily: "sans-serif",
    display: "block",
    marginBottom: "4px",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,20,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="w-full overflow-y-auto"
        style={{
          maxWidth: "500px",
          maxHeight: "90vh",
          background: "rgba(22,20,36,0.98)",
          border: "1px solid rgba(201,169,110,0.2)",
          padding: "1.5rem",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: "1.1rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif" }}>
            {initial?.name ? "프로필 수정" : "작가 프로필 등록"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(201,169,110,0.5)", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
        </div>

        <div className="flex flex-col gap-4">
          {/* 프로필 이미지 */}
          <div>
            <label style={labelStyle}>프로필 이미지</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => imgRef.current?.click()}
                className="cursor-pointer transition-all hover:opacity-80"
                style={{
                  width: "60px", height: "60px",
                  border: "1px dashed rgba(201,169,110,0.3)",
                  background: "rgba(12,10,20,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                }}
              >
                {imgPreview ? (
                  <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ color: "rgba(201,169,110,0.4)", fontSize: "1.2rem" }}>+</span>
                )}
              </div>
              <span style={{ fontSize: "0.65rem", color: "rgba(201,169,110,0.4)", fontFamily: "sans-serif" }}>
                클릭하여 이미지 선택
              </span>
            </div>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setForm((p) => ({ ...p, profileImageFile: f }));
                setImgPreview(URL.createObjectURL(f));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>이름 *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="홍길동" />
            </div>
            <div>
              <label style={labelStyle}>영문 이름</label>
              <input style={inputStyle} value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} placeholder="Hong Gildong" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>전문 분야</label>
            <input style={inputStyle} value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="AI 아트 · 캐릭터 디자인" />
          </div>

          <div>
            <label style={labelStyle}>작가 소개</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="작가 소개를 입력하세요"
            />
          </div>

          <div>
            <label style={labelStyle}>사용 도구</label>
            <input style={inputStyle} value={form.tools} onChange={(e) => setForm((f) => ({ ...f, tools: e.target.value }))} placeholder="Midjourney · Canva · ChatGPT" />
          </div>

          <div>
            <label style={labelStyle}>SNS 링크</label>
            <input style={inputStyle} value={form.sns} onChange={(e) => setForm((f) => ({ ...f, sns: e.target.value }))} placeholder="https://instagram.com/..." />
          </div>

          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.name}
            className="w-full transition-all duration-150 hover:opacity-80 active:scale-95"
            style={{
              background: !form.name ? "rgba(201,169,110,0.2)" : "linear-gradient(135deg, #2c1f0e 0%, #4a3728 100%)",
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.3)",
              padding: "10px",
              fontSize: "0.65rem",
              fontFamily: "sans-serif",
              letterSpacing: "0.2em",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── 메인 MyPage ───────────────────────────────────────────────────────────────
export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<ArtworkItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const utils = trpc.useUtils();

  // 데이터 조회
  const { data: profile, isLoading: profileLoading } = trpc.artist.myProfile.useQuery(undefined, { enabled: !!user });
  const { data: myArtworks, isLoading: artworksLoading } = trpc.artist.myArtworks.useQuery(undefined, { enabled: !!user });

  // 뮤테이션
  const createProfile = trpc.artist.createProfile.useMutation({ onSuccess: () => utils.artist.myProfile.invalidate() });
  const updateProfile = trpc.artist.updateProfile.useMutation({ onSuccess: () => utils.artist.myProfile.invalidate() });
  const uploadArtwork = trpc.artist.uploadArtwork.useMutation({
    onSuccess: () => { utils.artist.myArtworks.invalidate(); setShowArtworkModal(false); setUploadProgress(0); },
  });
  const updateArtworkMutation = trpc.artist.updateArtwork.useMutation({
    onSuccess: () => { utils.artist.myArtworks.invalidate(); setEditingArtwork(null); },
  });
  const deleteArtworkMutation = trpc.artist.deleteArtwork.useMutation({
    onSuccess: () => utils.artist.myArtworks.invalidate(),
  });

  // 로그인 체크
  if (authLoading) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div style={{ width: "32px", height: "32px", border: "2px solid rgba(201,169,110,0.3)", borderTopColor: "#c9a96e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      </GalleryLayout>
    );
  }

  if (!user) {
    return (
      <GalleryLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em", fontFamily: "sans-serif", marginBottom: "0.75rem" }}>
              ARTIST LOGIN REQUIRED
            </p>
            <h2 style={{ fontSize: "1.5rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif", marginBottom: "0.5rem" }}>
              작가 로그인
            </h2>
            <p style={{ fontSize: "0.8rem", color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.8 }}>
              작품을 업로드하고 관리하려면 로그인이 필요합니다.
            </p>
          </div>
          <a
            href={getLoginUrl()}
            className="transition-all duration-150 hover:opacity-80 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #2c1f0e 0%, #4a3728 100%)",
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.3)",
              padding: "10px 28px",
              fontSize: "0.6rem",
              fontFamily: "sans-serif",
              letterSpacing: "0.2em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            로그인하기
          </a>
          <button
            onClick={() => setLocation("/artists")}
            style={{ background: "none", border: "none", color: "rgba(201,169,110,0.4)", fontSize: "0.55rem", cursor: "pointer", fontFamily: "sans-serif", letterSpacing: "0.1em" }}
          >
            ← 갤러리로 돌아가기
          </button>
        </div>
      </GalleryLayout>
    );
  }

  // 프로필 저장
  const handleProfileSave = async (data: any) => {
    setProfileSaving(true);
    try {
      let profileImageBase64: string | undefined;
      let profileImageMime: string | undefined;
      if (data.profileImageFile) {
        profileImageBase64 = await fileToBase64(data.profileImageFile);
        profileImageMime = data.profileImageFile.type;
      }
      const payload = { name: data.name, nameEn: data.nameEn, specialty: data.specialty, bio: data.bio, tools: data.tools, sns: data.sns, profileImageBase64, profileImageMime };
      if (profile) {
        await updateProfile.mutateAsync(payload);
      } else {
        await createProfile.mutateAsync(payload);
      }
      toast.success("프로필이 저장되었습니다.");
      setShowProfileModal(false);
    } catch (e: any) {
      toast.error(e.message ?? "저장 실패");
    } finally {
      setProfileSaving(false);
    }
  };

  // 작품 업로드
  const handleArtworkSave = async (data: any) => {
    if (!data.mediaFile && !data.id) { toast.error("파일을 선택해 주세요."); return; }
    setUploading(true);
    setUploadProgress(10);
    try {
      if (data.id) {
        // 수정
        await updateArtworkMutation.mutateAsync({
          id: data.id, titleKo: data.titleKo, titleEn: data.titleEn,
          description: data.description, year: data.year, medium: data.medium,
          tags: data.tags, aiPrompt: data.aiPrompt || undefined, isPublished: data.isPublished,
        });
        toast.success("작품이 수정되었습니다.");
        setEditingArtwork(null);
      } else {
        // 신규 업로드
        if (data.mediaFile.size > 50 * 1024 * 1024) { toast.error("파일 크기는 50MB 이하여야 합니다."); return; }
        // 1단계: 파일 읽기 (10%)
        setUploadProgress(10);
        const mediaBase64 = await fileToBase64(data.mediaFile);
        // 2단계: 인코딩 완료 (40%)
        setUploadProgress(40);
        let thumbnailBase64: string | undefined, thumbnailMime: string | undefined;
        if (data.thumbnailFile) {
          thumbnailBase64 = await fileToBase64(data.thumbnailFile);
          setUploadProgress(55);
        }
        // 3단계: 서버 전송 중 (70%)
        setUploadProgress(70);
        await uploadArtwork.mutateAsync({
          titleKo: data.titleKo, titleEn: data.titleEn, description: data.description,
          year: data.year, medium: data.medium, mediaType: data.mediaType,
          mediaBase64, mediaMime: data.mediaFile.type, thumbnailBase64, thumbnailMime,
          tags: data.tags, aiPrompt: data.aiPrompt || undefined,
        });
        // 4단계: 완료 (100%)
        setUploadProgress(100);
        toast.success("작품이 업로드되었습니다!");
        setShowArtworkModal(false);
      }
    } catch (e: any) {
      toast.error(e.message ?? "저장 실패");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArtworkMutation.mutateAsync({ id });
      toast.success("작품이 삭제되었습니다.");
    } catch (e: any) {
      toast.error(e.message ?? "삭제 실패");
    }
  };

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-8 py-12" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* 헤더 */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.25em", fontFamily: "sans-serif", marginBottom: "4px" }}>
              ARTIST DASHBOARD
            </p>
            <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.9rem)", color: "#f0ebe0", fontFamily: "'Playfair Display', serif" }}>
              {user.name ?? "작가"} 님의 갤러리
            </h1>
          </div>
          <button
            onClick={() => setLocation("/artists")}
            style={{
              background: "none",
              border: "1px solid rgba(201,169,110,0.2)",
              color: "rgba(201,169,110,0.6)",
              padding: "6px 14px",
              fontSize: "0.5rem",
              fontFamily: "sans-serif",
              letterSpacing: "0.15em",
              cursor: "pointer",
            }}
          >
            ← 갤러리 보기
          </button>
        </motion.div>

        {/* 작가 프로필 섹션 */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.25em", fontFamily: "sans-serif" }}>
              ARTIST PROFILE
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                background: "rgba(201,169,110,0.08)",
                border: "1px solid rgba(201,169,110,0.2)",
                color: "#c9a96e",
                padding: "4px 12px",
                fontSize: "0.5rem",
                fontFamily: "sans-serif",
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >
              {profile ? "프로필 수정" : "+ 프로필 등록"}
            </button>
          </div>

          {profileLoading ? (
            <div style={{ height: "80px", background: "rgba(30,28,48,0.5)", border: "1px solid rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(201,169,110,0.3)", fontSize: "0.7rem", fontFamily: "sans-serif" }}>로딩 중...</span>
            </div>
          ) : profile ? (
            <div
              className="flex gap-4 items-start"
              style={{ background: "rgba(30,28,48,0.5)", border: "1px solid rgba(201,169,110,0.12)", padding: "1.25rem" }}
            >
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.name} style={{ width: "64px", height: "64px", objectFit: "cover", border: "1px solid rgba(201,169,110,0.2)", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "64px", height: "64px", background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "rgba(201,169,110,0.4)", fontSize: "1.5rem" }}>👤</span>
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#f0ebe0", fontFamily: "'Playfair Display', serif", marginBottom: "2px" }}>{profile.name}</h3>
                {profile.nameEn && <p style={{ fontSize: "0.48rem", color: "rgba(201,169,110,0.5)", fontFamily: "sans-serif", letterSpacing: "0.12em", marginBottom: "4px" }}>{profile.nameEn.toUpperCase()}</p>}
                {profile.specialty && <p style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.55)", fontFamily: "'Noto Serif KR', serif" }}>{profile.specialty}</p>}
                {profile.bio && <p style={{ fontSize: "0.72rem", color: "rgba(240,235,224,0.45)", fontFamily: "'Noto Serif KR', serif", marginTop: "4px", lineHeight: 1.6 }}>{profile.bio}</p>}
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowProfileModal(true)}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-80"
              style={{ background: "rgba(30,28,48,0.3)", border: "2px dashed rgba(201,169,110,0.15)", padding: "2rem", textAlign: "center" }}
            >
              <span style={{ color: "rgba(201,169,110,0.3)", fontSize: "1.5rem" }}>+</span>
              <p style={{ fontSize: "0.72rem", color: "rgba(201,169,110,0.4)", fontFamily: "'Noto Serif KR', serif" }}>
                작가 프로필을 등록하면 갤러리에 소개됩니다
              </p>
            </div>
          )}
        </motion.div>

        {/* 작품 관리 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <p style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.25em", fontFamily: "sans-serif" }}>
                MY ARTWORKS
              </p>
              <span style={{ fontSize: "0.55rem", color: "rgba(201,169,110,0.4)", fontFamily: "sans-serif" }}>
                {myArtworks?.length ?? 0}점
              </span>
            </div>
            <button
              onClick={() => {
                if (!profile) {
                  toast.error("먼저 작가 프로필을 등록해 주세요.", {
                    description: "위의 '+ 프로필 등록' 버튼을 눌러 작가 정보를 먼저 등록해 주세요.",
                    action: { label: "프로필 등록", onClick: () => setShowProfileModal(true) },
                    duration: 5000,
                  });
                  return;
                }
                setShowArtworkModal(true);
              }}
              className="transition-all duration-150 active:scale-95 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)",
                border: "none",
                color: "#1c1a2e",
                padding: "10px 22px",
                fontSize: "0.72rem",
                fontFamily: "sans-serif",
                fontWeight: 700,
                letterSpacing: "0.08em",
                cursor: "pointer",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 16px rgba(201,169,110,0.25)",
              }}
            >
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>↑</span>
              작품 업로드
            </button>
          </div>

          {artworksLoading ? (
            <div style={{ height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(201,169,110,0.3)", fontSize: "0.7rem", fontFamily: "sans-serif" }}>로딩 중...</span>
            </div>
          ) : myArtworks && myArtworks.length > 0 ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {myArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork as ArtworkItem}
                  onEdit={(a: ArtworkItem) => setEditingArtwork(a)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div
              onClick={() => {
                if (!profile) {
                  toast.error("먼저 작가 프로필을 등록해 주세요.", {
                    description: "위의 '+ 프로필 등록' 버튼을 눌러 작가 정보를 먼저 등록해 주세요.",
                    action: { label: "프로필 등록", onClick: () => setShowProfileModal(true) },
                    duration: 5000,
                  });
                  return;
                }
                setShowArtworkModal(true);
              }}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-80"
              style={{ background: "rgba(30,28,48,0.3)", border: "2px dashed rgba(201,169,110,0.15)", padding: "3rem", textAlign: "center" }}
            >
              <span style={{ color: "rgba(201,169,110,0.3)", fontSize: "2rem" }}>↑</span>
              <p style={{ fontSize: "0.78rem", color: "rgba(201,169,110,0.4)", fontFamily: "'Noto Serif KR', serif" }}>
                첫 번째 작품을 업로드해 보세요
              </p>
              <p style={{ fontSize: "0.62rem", color: "rgba(201,169,110,0.25)", fontFamily: "sans-serif" }}>
                이미지 또는 동영상 (최대 50MB)
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 모달들 */}
      <AnimatePresence>
        {showArtworkModal && (
          <ArtworkModal
            onClose={() => setShowArtworkModal(false)}
            onSave={handleArtworkSave}
            loading={uploading}
            uploadProgress={uploadProgress}
          />
        )}
        {editingArtwork !== null && (
          <ArtworkModal
            initial={editingArtwork as any}
            onClose={() => setEditingArtwork(null)}
            onSave={handleArtworkSave}
            loading={uploading}
            uploadProgress={uploadProgress}
          />
        )}
        {showProfileModal && (
          <ProfileModal
            initial={profile ?? undefined}
            onClose={() => setShowProfileModal(false)}
            onSave={handleProfileSave}
            loading={profileSaving}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </GalleryLayout>
  );
}
