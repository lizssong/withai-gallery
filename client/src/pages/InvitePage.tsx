/**
 * InvitePage — 초대 링크 수락 페이지
 * 작가가 초대 링크를 클릭하면 이 페이지로 진입, 로그인 후 자동으로 작가 등록
 */
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const token = params.token ?? "";
  const [accepted, setAccepted] = useState(false);

  // 초대 토큰 유효성 확인
  const { data: invitation, error: inviteError, isLoading: inviteLoading } = trpc.invitation.verify.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // 초대 수락 뮤테이션
  const acceptMutation = trpc.invitation.accept.useMutation({
    onSuccess: (data) => {
      setAccepted(true);
      toast.success("작가로 등록되었습니다! 마이페이지에서 프로필과 작품을 등록해 주세요.");
      setTimeout(() => setLocation("/my"), 2000);
    },
    onError: (err) => {
      toast.error(err.message ?? "초대 수락 중 오류가 발생했습니다.");
    },
  });

  // 로그인 후 자동 수락
  useEffect(() => {
    if (user && invitation && !accepted && !acceptMutation.isPending && !acceptMutation.isSuccess) {
      acceptMutation.mutate({ token });
    }
  }, [user, invitation]);

  const isInviteError = !!inviteError;
  const errorMessage = inviteError?.message ?? "유효하지 않은 초대 링크입니다.";

  return (
    <GalleryLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ paddingTop: "4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: "rgba(24,22,38,0.95)",
            border: "1px solid rgba(201,169,110,0.25)",
            padding: "2.5rem 2rem",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* 씰 */}
          <div
            className="mx-auto mb-5 flex items-center justify-center"
            style={{
              width: "56px", height: "56px",
              borderRadius: "50%",
              background: "rgba(192,57,43,0.15)",
              border: "2px solid rgba(192,57,43,0.4)",
              color: "#c0392b",
              fontSize: "1.4rem",
            }}
          >
            ✉
          </div>

          <p className="gallery-caption mb-2" style={{ fontSize: "0.48rem", color: "#c9a96e", letterSpacing: "0.3em" }}>
            ARTIST INVITATION
          </p>

          {inviteLoading || loading ? (
            <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.85rem", marginTop: "1rem" }}>
              초대 링크를 확인하는 중...
            </p>
          ) : isInviteError ? (
            <>
              <h2 className="gallery-title mb-3" style={{ fontSize: "1.3rem", color: "#f0ebe0" }}>
                초대 링크 오류
              </h2>
              <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.82rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                {errorMessage}
              </p>
              <button
                onClick={() => setLocation("/")}
                className="gallery-caption transition-all duration-200 hover:opacity-80"
                style={{ background: "none", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", padding: "8px 20px", fontSize: "0.48rem", letterSpacing: "0.15em", cursor: "pointer" }}
              >
                홈으로 돌아가기
              </button>
            </>
          ) : accepted || acceptMutation.isSuccess ? (
            <>
              <h2 className="gallery-title mb-3" style={{ fontSize: "1.3rem", color: "#f0ebe0" }}>
                작가 등록 완료!
              </h2>
              <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.82rem", lineHeight: 1.8 }}>
                마이페이지로 이동합니다. 프로필과 작품을 등록해 주세요.
              </p>
            </>
          ) : (
            <>
              <h2 className="gallery-title mb-3" style={{ fontSize: "1.3rem", color: "#f0ebe0" }}>
                전시회 작가 초대
              </h2>
              <p style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.82rem", lineHeight: 1.8, marginBottom: "0.5rem" }}>
                <strong style={{ color: "#c9a96e" }}>{invitation?.slotLabel}</strong> 슬롯으로 초대받으셨습니다.
              </p>
              <p style={{ color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.75rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                로그인하시면 자동으로 작가로 등록되며,<br />
                마이페이지에서 프로필과 작품을 업로드할 수 있습니다.
              </p>

              {user ? (
                <div>
                  <p style={{ color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif", fontSize: "0.78rem", marginBottom: "1rem" }}>
                    {user.name}님으로 로그인되어 있습니다.
                  </p>
                  <button
                    onClick={() => acceptMutation.mutate({ token })}
                    disabled={acceptMutation.isPending}
                    className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                    style={{
                      background: "rgba(201,169,110,0.15)",
                      border: "1px solid rgba(201,169,110,0.4)",
                      color: "#c9a96e",
                      padding: "10px 28px",
                      fontSize: "0.52rem",
                      letterSpacing: "0.2em",
                      cursor: "pointer",
                    }}
                  >
                    {acceptMutation.isPending ? "등록 중..." : "작가로 등록하기"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { window.location.href = getLoginUrl(); }}
                  className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{
                    background: "rgba(201,169,110,0.15)",
                    border: "1px solid rgba(201,169,110,0.4)",
                    color: "#c9a96e",
                    padding: "10px 28px",
                    fontSize: "0.52rem",
                    letterSpacing: "0.2em",
                    cursor: "pointer",
                  }}
                >
                  로그인하고 작가 등록하기
                </button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </GalleryLayout>
  );
}
