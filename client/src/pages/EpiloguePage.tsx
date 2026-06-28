/**
 * EpiloguePage — 에필로그 + 큐레이터 소개
 * Design: "Ink & Light"
 */
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GalleryLayout } from "@/components/GalleryLayout";
import { exhibitionInfo, artists } from "@/data/artists";

export default function EpiloguePage() {
  const [, setLocation] = useLocation();

  return (
    <GalleryLayout>
      <div className="min-h-screen px-4 sm:px-8 py-16" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* 헤더 */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="gallery-caption mb-3"
            style={{ fontSize: "0.52rem", color: "#c9a96e", letterSpacing: "0.3em" }}
          >
            EPILOGUE
          </p>
          <h1
            className="gallery-title mb-4"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#f0ebe0" }}
          >
            전시를 마치며
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div style={{ width: "50px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
            <span style={{ color: "#c9a96e", fontSize: "0.8rem" }}>✦</span>
            <div style={{ width: "50px", height: "1px", background: "rgba(201,169,110,0.3)" }} />
          </div>
        </motion.div>

        {/* 에필로그 본문 */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div
            style={{
              background: "rgba(30,28,48,0.5)",
              border: "1px solid rgba(201,169,110,0.12)",
              padding: "2rem 2rem",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(240,235,224,0.75)",
                fontFamily: "'Noto Serif KR', serif",
                lineHeight: 2.1,
                marginBottom: "1.2rem",
              }}
            >
              AI 아트 컬렉티브 2025에 방문해 주셔서 감사합니다. 이번 전시는 AI라는 새로운 도구를 통해 10인의 작가가 각자의 언어로 세상을 바라보고 표현한 결과물입니다.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(240,235,224,0.75)",
                fontFamily: "'Noto Serif KR', serif",
                lineHeight: 2.1,
                marginBottom: "1.2rem",
              }}
            >
              기술이 예술의 도구가 되는 시대, 우리는 AI와 함께 더 넓은 상상의 세계를 열어가고 있습니다. 각 작가의 개성과 감성이 AI를 통해 어떻게 표현되는지 느끼셨기를 바랍니다.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(240,235,224,0.75)",
                fontFamily: "'Noto Serif KR', serif",
                lineHeight: 2.1,
              }}
            >
              앞으로도 크리메타쏭은 AI 아트의 가능성을 탐구하며, 더 많은 창작자들이 AI와 함께 성장할 수 있도록 교육하고 지원하겠습니다.
            </p>
          </div>
        </motion.div>

        {/* 큐레이터 소개 */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <p
            className="gallery-caption mb-5"
            style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}
          >
            CURATOR
          </p>
          <div
            className="flex gap-5 items-start"
            style={{
              background: "rgba(30,28,48,0.5)",
              border: "1px solid rgba(201,169,110,0.12)",
              padding: "1.5rem",
            }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-1-LwujHFe4T4ThKKuxDjj4oi.webp"
              alt="민경"
              className="flex-shrink-0 object-cover"
              style={{ width: "72px", height: "72px", border: "1px solid rgba(201,169,110,0.2)" }}
            />
            <div>
              <h3
                className="gallery-title mb-0.5"
                style={{ fontSize: "1.1rem", color: "#f0ebe0" }}
              >
                민경
              </h3>
              <p
                className="gallery-caption mb-2"
                style={{ fontSize: "0.45rem", color: "rgba(201,169,110,0.6)", letterSpacing: "0.15em" }}
              >
                CRIMETASONG · AI ART CURATOR
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(240,235,224,0.6)",
                  fontFamily: "'Noto Serif KR', serif",
                  lineHeight: 1.8,
                }}
              >
                크리메타쏭 대표 · 캔바 지국장 · AI 융합 마케팅 콘텐츠 강사. 리즈, 요코, 조코 캐릭터 작가. 아바톡 크리퐁 & 수퍼톤 엠버서더.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 참여 작가 목록 */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <p
            className="gallery-caption mb-5"
            style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}
          >
            PARTICIPATING ARTISTS
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            {artists.map((artist, idx) => (
              <button
                key={artist.id}
                onClick={() => setLocation(`/artists/${artist.id}`)}
                className="text-center transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{
                  background: "rgba(30,28,48,0.5)",
                  border: "1px solid rgba(201,169,110,0.1)",
                  padding: "0.75rem 0.5rem",
                  cursor: "pointer",
                }}
              >
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="w-10 h-10 object-cover mx-auto mb-1.5"
                  style={{ borderRadius: "50%", border: "1px solid rgba(201,169,110,0.2)" }}
                />
                <p
                  className="gallery-title"
                  style={{ fontSize: "0.75rem", color: "#f0ebe0", marginBottom: "1px" }}
                >
                  {artist.name}
                </p>
                <p
                  className="gallery-caption"
                  style={{ fontSize: "0.38rem", color: "rgba(201,169,110,0.45)", letterSpacing: "0.08em" }}
                >
                  {artist.artworks.length}점
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 링크 섹션 */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <p
            className="gallery-caption mb-4"
            style={{ fontSize: "0.5rem", color: "#c9a96e", letterSpacing: "0.25em" }}
          >
            LINKS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "크리메타쏭 채널", desc: "AI 아트 & 강의 콘텐츠", href: "#" },
              { label: "강의 문의", desc: "기업 · 학교 · 기관 강의", href: "#" },
              { label: "카카오 오픈채팅", desc: "AI 아트 커뮤니티", href: "#" },
              { label: "아바톡 크리퐁", desc: "엠버서더 활동", href: "#" },
            ].map(({ label, desc, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-between transition-all duration-200 hover:opacity-80 no-underline"
                style={{
                  background: "rgba(30,28,48,0.5)",
                  border: "1px solid rgba(201,169,110,0.12)",
                  padding: "0.85rem 1rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "0.78rem", color: "#f0ebe0", fontFamily: "'Noto Serif KR', serif", marginBottom: "2px" }}>
                    {label}
                  </p>
                  <p
                    className="gallery-caption"
                    style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}
                  >
                    {desc}
                  </p>
                </div>
                <span style={{ color: "#c9a96e", fontSize: "0.8rem" }}>→</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* 처음으로 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => setLocation("/")}
            className="gallery-caption transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              background: "none",
              border: "1px solid rgba(201,169,110,0.25)",
              color: "rgba(201,169,110,0.6)",
              padding: "10px 24px",
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              cursor: "pointer",
            }}
          >
            ← 처음으로 돌아가기
          </button>
          <p
            className="gallery-caption mt-6"
            style={{ fontSize: "0.42rem", color: "rgba(201,169,110,0.25)", letterSpacing: "0.15em" }}
          >
            © 2025 크리메타쏭 · AI ART COLLECTIVE · ALL RIGHTS RESERVED
          </p>
        </motion.div>
      </div>
    </GalleryLayout>
  );
}
