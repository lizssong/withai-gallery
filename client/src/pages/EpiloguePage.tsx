/**
 * EpiloguePage — 에필로그 + 큐레이터 소개
 * 위드AI솔루션 AI올인원과정 1기 컨셉
 */
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { trpc } from "@/lib/trpc";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay },
} as const);

export default function EpiloguePage() {
  const [, setLocation] = useLocation();
  const { data: artistsData } = trpc.gallery.listArtists.useQuery();

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-8 py-16" style={{ maxWidth: "820px", margin: "0 auto" }}>

        {/* ── 헤더 ── */}
        <motion.div className="text-center mb-14" {...fadeUp(0)}>
          <p className="gallery-caption mb-3" style={{ fontSize: "0.55rem", color: "#c9a96e", letterSpacing: "0.35em" }}>
            EPILOGUE
          </p>
          <h1 className="gallery-title mb-2" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#f0ebe0" }}>
            전시를 마치며
          </h1>
          <p className="gallery-caption mb-5" style={{ fontSize: "0.6rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.2em" }}>
            위드AI솔루션 · AI올인원과정 1기
          </p>
          <div className="flex items-center justify-center gap-4">
            <div style={{ width: "50px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
            <span style={{ color: "#c9a96e", fontSize: "0.8rem" }}>✦</span>
            <div style={{ width: "50px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
          </div>
        </motion.div>

        {/* ── 에필로그 본문 ── */}
        <motion.div className="mb-14" {...fadeUp(0.12)}>
          <div style={{ background: "rgba(30,28,48,0.55)", border: "1px solid rgba(201,169,110,0.13)", padding: "2rem 2.2rem" }}>
            <p style={{ fontSize: "0.95rem", color: "rgba(240,235,224,0.8)", fontFamily: "'Noto Serif KR', serif", lineHeight: 2.15, marginBottom: "1.4rem" }}>
              위드AI솔루션 AI올인원과정 1기 전시회에 방문해 주셔서 진심으로 감사드립니다. 이 전시는 AI를 처음 접하고 배우기 시작한 수강생들이 단 한 학기 만에 자신만의 AI 아트 작품을 완성해낸 놀라운 여정의 기록입니다.
            </p>
            <p style={{ fontSize: "0.95rem", color: "rgba(240,235,224,0.8)", fontFamily: "'Noto Serif KR', serif", lineHeight: 2.15, marginBottom: "1.4rem" }}>
              생성형 AI라는 새로운 도구를 손에 쥐고, 각자의 감성과 상상력으로 세상을 표현하기 시작한 1기 작가들. 기술이 예술의 언어가 되는 순간, 그 가능성은 무한히 열립니다. 이 전시에 담긴 작품 하나하나가 바로 그 가능성의 증거입니다.
            </p>
            <p style={{ fontSize: "0.95rem", color: "rgba(240,235,224,0.8)", fontFamily: "'Noto Serif KR', serif", lineHeight: 2.15 }}>
              앞으로도 위드AI솔루션은 AI와 함께 성장하는 창작자들을 응원하며, 더 많은 분들이 AI 아트의 세계로 첫 발을 내딛을 수 있도록 함께하겠습니다. 1기 작가 여러분, 정말 수고하셨습니다. 🎨
            </p>
          </div>
        </motion.div>

        {/* ── 과정 소개 ── */}
        <motion.div className="mb-14" {...fadeUp(0.2)}>
          <p className="gallery-caption mb-5" style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.28em" }}>
            ABOUT THE COURSE
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🤖", title: "AI올인원과정", desc: "생성형 AI 도구를 활용한 콘텐츠 제작 · 마케팅 · 아트 창작을 한 번에 배우는 실전 과정" },
              { icon: "🎨", title: "AI 아트 창작", desc: "Midjourney · DALL-E · Stable Diffusion 등 AI 이미지 생성 도구로 나만의 작품 완성" },
              { icon: "📚", title: "위드AI솔루션", desc: "AI 융합 교육 전문 기관 · 기업·학교·기관 맞춤 강의 · 생성형AI 강사 양성 과정 운영" },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "rgba(30,28,48,0.55)",
                  border: "1px solid rgba(201,169,110,0.12)",
                  padding: "1.4rem 1.2rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>{icon}</div>
                <h3 className="gallery-title mb-2" style={{ fontSize: "0.9rem", color: "#f0ebe0" }}>{title}</h3>
                <p style={{ fontSize: "0.75rem", color: "rgba(240,235,224,0.55)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 큐레이터 소개 ── */}
        <motion.div className="mb-14" {...fadeUp(0.28)}>
          <p className="gallery-caption mb-5" style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.28em" }}>
            CURATOR &amp; INSTRUCTOR
          </p>
          <div
            className="flex gap-5 items-start"
            style={{ background: "rgba(30,28,48,0.55)", border: "1px solid rgba(201,169,110,0.13)", padding: "1.6rem" }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-1-LwujHFe4T4ThKKuxDjj4oi.webp"
              alt="민경"
              className="flex-shrink-0 object-cover"
              style={{ width: "80px", height: "80px", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "2px" }}
            />
            <div>
              <h3 className="gallery-title mb-0.5" style={{ fontSize: "1.15rem", color: "#f0ebe0" }}>송민경</h3>
              <p className="gallery-caption mb-3" style={{ fontSize: "0.48rem", color: "rgba(201,169,110,0.65)", letterSpacing: "0.15em" }}>
                위드AI솔루션 · AI ART CURATOR &amp; INSTRUCTOR
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {["위드AI솔루션 대표", "캔바 지국장", "AI융합마케팅콘텐츠 강사", "AI아트 작가"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.62rem",
                      color: "rgba(201,169,110,0.7)",
                      background: "rgba(201,169,110,0.08)",
                      border: "1px solid rgba(201,169,110,0.18)",
                      padding: "2px 8px",
                      fontFamily: "'Noto Serif KR', serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: "0.8rem", color: "rgba(240,235,224,0.6)", fontFamily: "'Noto Serif KR', serif", lineHeight: 1.85 }}>
                생성형AI · 캔바 · 캐릭터이모티콘디자인을 초중학생, 교사, 일반인, 기업 대상으로 강의하는 워킹맘 강사. 리즈·요코·조코 캐릭터 작가이자 AI아트 전시 기획자.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 참여 작가 목록 ── */}
        <motion.div className="mb-14" {...fadeUp(0.36)}>
          <p className="gallery-caption mb-5" style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.28em" }}>
            AI올인원과정 1기 참여 작가
          </p>
          {artistsData && artistsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {artistsData.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => setLocation(`/artists/${artist.id}`)}
                  className="text-center transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{ background: "rgba(30,28,48,0.55)", border: "1px solid rgba(201,169,110,0.1)", padding: "0.85rem 0.5rem", cursor: "pointer" }}
                >
                  {artist.profileImageUrl ? (
                    <img
                      src={artist.profileImageUrl}
                      alt={artist.name}
                      className="w-11 h-11 object-cover mx-auto mb-2"
                      style={{ borderRadius: "50%", border: "1px solid rgba(201,169,110,0.25)" }}
                    />
                  ) : (
                    <div
                      className="w-11 h-11 mx-auto mb-2 flex items-center justify-center"
                      style={{ borderRadius: "50%", border: "1px solid rgba(201,169,110,0.25)", background: "rgba(201,169,110,0.08)", fontSize: "1.2rem" }}
                    >
                      🎨
                    </div>
                  )}
                  <p className="gallery-title" style={{ fontSize: "0.78rem", color: "#f0ebe0", marginBottom: "2px" }}>
                    {artist.name}
                  </p>
                  <p className="gallery-caption" style={{ fontSize: "0.4rem", color: "rgba(201,169,110,0.45)", letterSpacing: "0.08em" }}>
                    {artist.specialty ?? "AI 아트"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ background: "rgba(30,28,48,0.55)", border: "1px solid rgba(201,169,110,0.1)", padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "rgba(240,235,224,0.4)", fontFamily: "'Noto Serif KR', serif" }}>작가 정보를 불러오는 중...</p>
            </div>
          )}
        </motion.div>

        {/* ── 링크 섹션 ── */}
        <motion.div className="mb-12" {...fadeUp(0.44)}>
          <p className="gallery-caption mb-4" style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.28em" }}>LINKS</p>
          {/* 강의 문의 및 협업 — 리틀리 프로필 카드 */}
          <a
            href="https://litt.ly/ssongliz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 transition-all duration-200 hover:opacity-85 no-underline"
            style={{ background: "rgba(30,28,48,0.65)", border: "1px solid rgba(201,169,110,0.25)", padding: "1.2rem 1.4rem", borderRadius: "4px", maxWidth: "480px" }}
          >
            {/* QR 코드 */}
            <img
              src="/manus-storage/qr-littly_cd897a9f.png"
              alt="리틀리 QR코드"
              style={{ width: "72px", height: "72px", objectFit: "contain", flexShrink: 0, background: "#fff", padding: "4px", borderRadius: "3px" }}
            />
            {/* 텍스트 */}
            <div>
              <p style={{ fontSize: "1rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", fontWeight: 600, marginBottom: "5px" }}>
                강의 문의 및 협업
              </p>
              <p className="gallery-caption" style={{ fontSize: "0.52rem", color: "rgba(201,169,110,0.65)", letterSpacing: "0.08em", marginBottom: "4px" }}>
                기업 · 학교 · 기관 · 취창업센터 강의 문의
              </p>
              <p className="gallery-caption" style={{ fontSize: "0.48rem", color: "rgba(201,169,110,0.4)", letterSpacing: "0.12em" }}>
                litt.ly/ssongliz →
              </p>
            </div>
          </a>
        </motion.div>

        {/* ── 공유 버튼 ── */}
        <motion.div className="text-center mb-8" {...fadeUp(0.52)}>
          <p className="gallery-caption mb-4" style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.28em" }}>SHARE</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                const btn = document.getElementById("copy-btn");
                if (btn) { btn.textContent = "✓ 복사됨"; setTimeout(() => { btn.textContent = "🔗 링크 복사"; }, 2000); }
              }}
              id="copy-btn"
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)", color: "rgba(201,169,110,0.8)", padding: "9px 18px", fontSize: "0.52rem", letterSpacing: "0.12em", cursor: "pointer" }}
            >
              🔗 링크 복사
            </button>
            <a
              href={`https://sharer.kakao.com/talk/friends/picker/link?app_key=KAKAO_APP_KEY&validation_action=default&validation_params=%7B%22url%22%3A%22${encodeURIComponent(window.location.origin)}%22%7D`}
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95 no-underline"
              style={{ background: "rgba(254,229,0,0.1)", border: "1px solid rgba(254,229,0,0.25)", color: "rgba(254,229,0,0.8)", padding: "9px 18px", fontSize: "0.52rem", letterSpacing: "0.12em", cursor: "pointer", display: "inline-block" }}
            >
              💬 카카오 공유
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("위드AI솔루션 AI올인원과정 1기 AI아트 전시회 🎨 AI와 함께 그려낸 작가들의 상상과 감성의 세계")}&url=${encodeURIComponent(window.location.origin)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95 no-underline"
              style={{ background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.25)", color: "rgba(29,161,242,0.8)", padding: "9px 18px", fontSize: "0.52rem", letterSpacing: "0.12em", cursor: "pointer", display: "inline-block" }}
            >
              𝕏 공유
            </a>
          </div>
        </motion.div>

        {/* ── 처음으로 ── */}
        <motion.div className="text-center" {...fadeUp(0.58)}>
          <button
            onClick={() => setLocation("/")}
            className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{ background: "none", border: "1px solid rgba(201,169,110,0.25)", color: "rgba(201,169,110,0.65)", padding: "11px 28px", fontSize: "0.52rem", letterSpacing: "0.22em", cursor: "pointer" }}
          >
            ← 처음으로 돌아가기
          </button>
          <p className="gallery-caption mt-6" style={{ fontSize: "0.44rem", color: "rgba(201,169,110,0.22)", letterSpacing: "0.15em" }}>
            © 위드AI솔루션 · AI올인원과정 1기 · AI ART COLLECTIVE · ALL RIGHTS RESERVED
          </p>
        </motion.div>

      </div>
    </GalleryLayout>
  );
}
