/**
 * 민경 AI 아트 갤러리 — 온라인 전시회
 * Design: "Ink & Light" — 먹빛 배경 + 화선지 카드 + 주홍 인주 포인트
 *
 * 구조:
 * 1. 초대장 (Invitation) — 씰 스탬프 + 편지 형식
 * 2. 전시 공간 (Gallery) — 작품 이미지 + 정보 카드
 * 3. 에필로그 (Epilogue) — 작가 소개 + 링크
 *
 * 배경음악: '전시회 입장하기' 클릭 시 재생 시작, 헤더 음소거 토글 버튼 제공
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { artworks, exhibitionInfo } from "@/data/artworks";

type Phase = "invitation" | "gallery" | "epilogue";

const BGM_URL = "/manus-storage/gallery-bgm_6206249a.mp3";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("invitation");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<"left" | "right">("right");

  // 오디오 상태
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // 오디오 엘리먼트 초기화
  useEffect(() => {
    const audio = new Audio(BGM_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setAudioReady(true));
    audio.load();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 볼륨 페이드 유틸
  const fadeVolume = useCallback(
    (targetVol: number, durationMs: number = 1500) => {
      const audio = audioRef.current;
      if (!audio) return;
      const startVol = audio.volume;
      const diff = targetVol - startVol;
      const steps = 40;
      const interval = durationMs / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        audio.volume = Math.min(1, Math.max(0, startVol + diff * (step / steps)));
        if (step >= steps) clearInterval(timer);
      }, interval);
    },
    []
  );

  // 입장 버튼 클릭 → 음악 재생 + 페이지 전환
  const handleEnterGallery = useCallback(async () => {
    setPhase("gallery");
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);
      fadeVolume(0.45, 2000); // 2초에 걸쳐 볼륨 45%까지 페이드인
    } catch {
      // 자동재생 정책으로 실패 시 조용히 무시
    }
  }, [fadeVolume]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      setIsMuted(false);
      fadeVolume(0.45, 600);
    } else {
      setIsMuted(true);
      fadeVolume(0, 600);
    }
  }, [isMuted, fadeVolume]);

  // 초대장으로 돌아갈 때 음악 정지
  const handleGoToInvitation = useCallback(() => {
    setPhase("invitation");
    const audio = audioRef.current;
    if (!audio) return;
    fadeVolume(0, 1000);
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(false);
    }, 1100);
  }, [fadeVolume]);

  const currentArtwork = artworks[currentIndex];

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex < artworks.length - 1) {
      setTransitionDir("right");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
      }, 350);
    } else {
      setPhase("epilogue");
    }
  }, [currentIndex, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex > 0) {
      setTransitionDir("left");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i - 1);
        setIsTransitioning(false);
      }, 350);
    }
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== "gallery") return;
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, goToNext, goToPrev]);

  return (
    <div className="min-h-screen ink-bg overflow-hidden relative">
      {/* 배경 장식 — 미묘한 빛 효과 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,0.06) 0%, transparent 70%)",
        }}
      />

      {/* 상단 네비게이션 */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{ borderBottom: "1px solid rgba(201,169,110,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/gallery-logo-Re7k64PmePnMojqyRhyB4a.webp"
            alt="민경 갤러리 로고"
            className="w-8 h-8 object-contain"
          />
          <span className="gallery-caption gold-text tracking-widest hidden sm:block">
            민경 갤러리 · MIN-KYUNG
          </span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <span
            className="gallery-title italic text-sm"
            style={{ color: "rgba(240,235,224,0.7)" }}
          >
            AI Art &amp; Character Design
          </span>
        </div>

        {/* 우측: 음소거 버튼 + 시즌 표기 */}
        <div className="flex items-center gap-3">
          {/* 음소거 토글 버튼 — 음악이 재생 중일 때만 표시 */}
          {isPlaying && (
            <button
              onClick={toggleMute}
              title={isMuted ? "음악 켜기" : "음악 끄기"}
              className="flex items-center gap-1.5 transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                background: "none",
                border: "1px solid rgba(201,169,110,0.3)",
                borderRadius: "2px",
                padding: "4px 8px",
                color: isMuted ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.85)",
              }}
              aria-label={isMuted ? "음악 켜기" : "음악 끄기"}
            >
              {/* 음악 아이콘 (SVG) */}
              {isMuted ? (
                <MusicOffIcon />
              ) : (
                <MusicOnIcon />
              )}
              <span
                className="gallery-caption hidden sm:inline"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.15em",
                  color: "inherit",
                }}
              >
                {isMuted ? "MUTED" : "♪ BGM"}
              </span>
            </button>
          )}
          <div className="gallery-caption gold-text tracking-widest text-right">
            <span className="hidden sm:inline">{exhibitionInfo.season} · </span>
            <span>SPECIAL</span>
          </div>
        </div>
      </header>

      {/* 좌우 화살표 — 갤러리 모드에서만 */}
      {phase === "gallery" && (
        <>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="fixed left-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-20"
            style={{
              color: "rgba(201,169,110,0.8)",
              fontSize: "1.8rem",
              fontFamily: "Georgia, serif",
            }}
            aria-label="이전 작품"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="fixed right-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center transition-all duration-200"
            style={{
              color: "rgba(201,169,110,0.8)",
              fontSize: "1.8rem",
              fontFamily: "Georgia, serif",
            }}
            aria-label="다음 작품"
          >
            ›
          </button>
        </>
      )}

      {/* ===== 초대장 페이지 ===== */}
      {phase === "invitation" && (
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4">
          <div className="gallery-caption gold-text mb-8 fade-in fade-in-delay-1">
            초대장 · INVITATION
          </div>

          {/* 초대장 카드 */}
          <div
            className="parchment-card rounded-sm w-full mx-auto px-6 sm:px-8 py-8 sm:py-10 relative fade-in-up fade-in-delay-2"
            style={{ maxWidth: "420px" }}
          >
            {/* 씰 스탬프 */}
            <div className="flex justify-center -mt-14 mb-5">
              <div className="vermillion-seal w-16 h-16 rounded-full flex items-center justify-center">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/gallery-logo-Re7k64PmePnMojqyRhyB4a.webp"
                  alt="씰"
                  className="w-10 h-10 object-contain"
                  style={{ filter: "brightness(10)" }}
                />
              </div>
            </div>

            {/* From */}
            <div className="text-center mb-2">
              <span
                className="gallery-caption"
                style={{ color: "#8b7355", letterSpacing: "0.2em", fontSize: "0.65rem" }}
              >
                From. 민경 (크리메타쏭)
              </span>
            </div>

            {/* PRIVATE */}
            <div className="text-center mb-5">
              <span
                className="gallery-caption"
                style={{ color: "#8b7355", letterSpacing: "0.2em", fontSize: "0.6rem" }}
              >
                PRIVATE EXHIBITION · INVITATION ONLY
              </span>
            </div>

            <hr className="gold-divider mb-6" style={{ borderColor: "rgba(139,115,85,0.3)" }} />

            {/* 메인 제목 */}
            <h1
              className="text-center mb-4 leading-tight"
              style={{
                fontFamily: "Noto Serif KR, serif",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#2c2416",
                lineHeight: 1.5,
              }}
            >
              여러분을 민경의{" "}
              <em style={{ color: "#c0392b", fontStyle: "italic" }}>
                AI 아트 갤러리
              </em>
              로<br />초대합니다.
            </h1>

            {/* 설명 */}
            <p
              className="text-center mb-6 leading-relaxed"
              style={{
                fontFamily: "Noto Serif KR, serif",
                fontSize: "0.82rem",
                color: "#5a4a35",
                lineHeight: 1.9,
              }}
            >
              리즈, 요코, 조코와 함께 그린 여섯 편의 이야기가,
              <br />
              오늘 이 공간에서 여러분을 기다립니다.
              <br />
              조명을 낮추고, 한 작품씩 천천히 걸으며 만나주세요.
            </p>

            {/* 함께 하실래요? */}
            <p
              className="text-center mb-5"
              style={{ color: "#c0392b", fontSize: "0.85rem", fontFamily: "Noto Serif KR, serif" }}
            >
              함께 해보실래요?
            </p>

            {/* CTA 버튼 */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleEnterGallery}
                className="px-8 py-3 transition-all duration-200 active:scale-95"
                style={{
                  background: "#2c2416",
                  color: "#f0ebe0",
                  fontFamily: "Noto Serif KR, serif",
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  border: "none",
                  borderRadius: "2px",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#c0392b";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#2c2416";
                }}
              >
                전시회 입장하기 →
              </button>
            </div>

            {/* 음악 안내 문구 */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span style={{ color: "#c9a96e", fontSize: "0.7rem" }}>♪</span>
              <span
                style={{
                  fontFamily: "Noto Serif KR, serif",
                  fontSize: "0.65rem",
                  color: "#8b7355",
                  letterSpacing: "0.05em",
                }}
              >
                입장 시 잔잔한 배경음악이 재생됩니다
              </span>
            </div>

            {/* 하단 메타 */}
            <hr className="gold-divider mb-4" style={{ borderColor: "rgba(139,115,85,0.3)" }} />
            <div className="text-center">
              <span
                className="gallery-caption"
                style={{ color: "#8b7355", letterSpacing: "0.15em", fontSize: "0.6rem" }}
              >
                {exhibitionInfo.tools} · {artworks.length} ROOMS
              </span>
            </div>
            <div className="text-center mt-2">
              <span
                className="gallery-caption"
                style={{ color: "#8b7355", letterSpacing: "0.1em", fontSize: "0.6rem" }}
              >
                {exhibitionInfo.brand} · {exhibitionInfo.season}
              </span>
            </div>
          </div>

          <div className="mt-8 gallery-caption gold-text fade-in fade-in-delay-5" style={{ opacity: 0.5 }}>
            초대장 · INVITATION
          </div>
        </div>
      )}

      {/* ===== 갤러리 페이지 ===== */}
      {phase === "gallery" && (
        <div className="min-h-screen pt-16 flex flex-col">
          {/* 작품 번호 상단 */}
          <div className="text-center pt-4 pb-2">
            <span className="gallery-caption gold-text" style={{ letterSpacing: "0.25em" }}>
              NO. {String(currentIndex + 1).padStart(2, "0")} / {artworks.length}
            </span>
          </div>

          {/* 메인 전시 영역 */}
          <div
            className={`flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 px-4 lg:px-12 py-2 ${
              isTransitioning
                ? transitionDir === "right"
                  ? "opacity-0 translate-x-4"
                  : "opacity-0 -translate-x-4"
                : "opacity-100 translate-x-0"
            } transition-all duration-300`}
          >
            {/* 작품 이미지 */}
            <div className="w-full lg:w-3/5 max-w-2xl">
              <div
                className="relative rounded-sm overflow-hidden"
                style={{
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)",
                  aspectRatio: "16/10",
                }}
              >
                <img
                  src={currentArtwork.imageUrl}
                  alt={currentArtwork.titleKo}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/3"
                  style={{
                    background: "linear-gradient(to top, rgba(28,28,46,0.7) 0%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-3 left-4">
                  <span
                    className="gallery-caption"
                    style={{ color: "rgba(201,169,110,0.8)", letterSpacing: "0.2em" }}
                  >
                    NO. {String(currentIndex + 1).padStart(2, "0")} / {artworks.length}
                  </span>
                </div>
              </div>

              {/* 페이지 인디케이터 */}
              <div className="flex justify-center gap-2 mt-4">
                {artworks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isTransitioning) {
                        setTransitionDir(i > currentIndex ? "right" : "left");
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentIndex(i);
                          setIsTransitioning(false);
                        }, 350);
                      }
                    }}
                    className="transition-all duration-200"
                    style={{
                      width: i === currentIndex ? "24px" : "8px",
                      height: "4px",
                      borderRadius: "2px",
                      background: i === currentIndex ? "#c9a96e" : "rgba(201,169,110,0.3)",
                      border: "none",
                    }}
                    aria-label={`작품 ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 작품 정보 카드 */}
            <div
              className="parchment-card rounded-sm w-full lg:w-2/5 max-w-sm p-6"
              style={{ minHeight: "320px" }}
            >
              {/* 상 */}
              <div className="mb-3">
                <span
                  className="inline-block px-2 py-1 text-xs"
                  style={{
                    background: "rgba(192,57,43,0.12)",
                    color: "#c0392b",
                    fontFamily: "Noto Serif KR, serif",
                    border: "1px solid rgba(192,57,43,0.3)",
                    borderRadius: "2px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {currentArtwork.award}
                </span>
                <span
                  className="ml-2 text-xs"
                  style={{ color: "#8b7355", fontFamily: "Playfair Display, serif", fontStyle: "italic" }}
                >
                  {currentArtwork.awardEn}
                </span>
              </div>

              {/* 작품 번호 */}
              <div className="mb-1">
                <span
                  className="gallery-caption"
                  style={{ color: "#8b7355", letterSpacing: "0.2em", fontSize: "0.6rem" }}
                >
                  NO. {String(currentIndex + 1).padStart(2, "0")} / {artworks.length}
                </span>
              </div>

              {/* 한글 제목 */}
              <h2
                className="mb-1 leading-tight"
                style={{
                  fontFamily: "Noto Serif KR, serif",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: "#2c2416",
                }}
              >
                {currentArtwork.titleKo}
              </h2>

              {/* 영문 제목 */}
              <p
                className="mb-3"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "#8b7355",
                }}
              >
                {currentArtwork.titleEn}
              </p>

              <hr style={{ borderColor: "rgba(139,115,85,0.3)", marginBottom: "12px" }} />

              {/* 미디엄 */}
              <p
                className="mb-3"
                style={{
                  fontFamily: "Noto Sans KR, sans-serif",
                  fontSize: "0.65rem",
                  color: "#8b7355",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {currentArtwork.medium}
              </p>

              {/* 설명 */}
              <p
                className="mb-4 leading-relaxed"
                style={{
                  fontFamily: "Noto Serif KR, serif",
                  fontSize: "0.78rem",
                  color: "#4a3c2a",
                  lineHeight: 1.85,
                }}
              >
                {currentArtwork.description}
              </p>

              <CuratorNote note={currentArtwork.curatorNote} />

              {/* 태그 */}
              <div className="flex flex-wrap gap-1 mt-3">
                {currentArtwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs"
                    style={{
                      background: "rgba(139,115,85,0.12)",
                      color: "#8b7355",
                      borderRadius: "2px",
                      fontFamily: "Noto Sans KR, sans-serif",
                      fontSize: "0.6rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="text-center pb-6">
            {currentIndex < artworks.length - 1 ? (
              <button
                onClick={goToNext}
                className="gallery-caption gold-text transition-opacity duration-200 hover:opacity-100"
                style={{ opacity: 0.5, background: "none", border: "none", letterSpacing: "0.2em" }}
              >
                다음 작품 →
              </button>
            ) : (
              <button
                onClick={() => setPhase("epilogue")}
                className="gallery-caption transition-opacity duration-200 hover:opacity-100"
                style={{
                  opacity: 0.7,
                  background: "none",
                  border: "none",
                  letterSpacing: "0.2em",
                  color: "#c0392b",
                  fontSize: "0.7rem",
                }}
              >
                닫는 글 읽기 ↓
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== 에필로그 페이지 ===== */}
      {phase === "epilogue" && (
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4">
          <div className="gallery-caption gold-text mb-8 fade-in fade-in-delay-1">
            닫는 글 · EPILOGUE
          </div>

          <div className="parchment-card rounded-sm w-full max-w-lg mx-auto px-8 py-10 fade-in-up fade-in-delay-2">
            {/* 씰 */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="vermillion-seal w-16 h-16 rounded-full flex items-center justify-center">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/gallery-logo-Re7k64PmePnMojqyRhyB4a.webp"
                  alt="씰"
                  className="w-10 h-10 object-contain"
                  style={{ filter: "brightness(10)" }}
                />
              </div>
            </div>

            <h2
              className="text-center mb-4"
              style={{
                fontFamily: "Noto Serif KR, serif",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "#2c2416",
              }}
            >
              관람해 주셔서 감사합니다
            </h2>

            <p
              className="text-center mb-6 leading-relaxed"
              style={{
                fontFamily: "Noto Serif KR, serif",
                fontSize: "0.82rem",
                color: "#5a4a35",
                lineHeight: 1.9,
              }}
            >
              AI와 함께 그린 이 작은 전시가<br />
              여러분의 마음에 작은 빛 하나를 남기길 바랍니다.<br />
              리즈, 요코, 조코와 함께 다시 만나요.
            </p>

            <hr style={{ borderColor: "rgba(139,115,85,0.3)", marginBottom: "20px" }} />

            {/* 작가 소개 */}
            <div className="text-center mb-6">
              <p
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  color: "#4a3c2a",
                  marginBottom: "4px",
                }}
              >
                Min-Kyung
              </p>
              <p
                style={{
                  fontFamily: "Noto Serif KR, serif",
                  fontSize: "0.75rem",
                  color: "#8b7355",
                }}
              >
                크리메타쏭 대표 · 캔바 지국장<br />
                AI 융합 마케팅 콘텐츠 강사 · AI 아트 작가
              </p>
            </div>

            {/* 링크 목록 */}
            <div className="space-y-2 mb-6">
              {[
                { label: "강의 문의하기", sub: "생성형 AI · 캔바 · 캐릭터 이모티콘 디자인", href: "#" },
                { label: "크리메타쏭 채널", sub: "AI 아트 & 캐릭터 디자인 콘텐츠", href: "#" },
                { label: "다음 전시회 소식", sub: "리즈 · 요코 · 조코의 새로운 이야기", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-start justify-between p-3 transition-all duration-200 hover:opacity-80"
                  style={{ background: "rgba(139,115,85,0.08)", borderRadius: "2px", textDecoration: "none" }}
                >
                  <div>
                    <p style={{ fontFamily: "Noto Serif KR, serif", fontSize: "0.82rem", color: "#2c2416", fontWeight: 500 }}>
                      {link.label}
                    </p>
                    <p style={{ fontFamily: "Noto Sans KR, sans-serif", fontSize: "0.65rem", color: "#8b7355", marginTop: "2px" }}>
                      {link.sub}
                    </p>
                  </div>
                  <span style={{ color: "#c0392b", fontSize: "0.9rem", marginTop: "2px" }}>↗</span>
                </a>
              ))}
            </div>

            {/* 다시 보기 버튼 */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setCurrentIndex(0); setPhase("gallery"); }}
                className="px-5 py-2 transition-all duration-200 active:scale-95 text-sm"
                style={{
                  background: "transparent",
                  color: "#2c2416",
                  fontFamily: "Noto Serif KR, serif",
                  border: "1px solid rgba(139,115,85,0.5)",
                  borderRadius: "2px",
                }}
              >
                ← 처음부터 다시 보기
              </button>
              <button
                onClick={handleGoToInvitation}
                className="px-5 py-2 transition-all duration-200 active:scale-95 text-sm"
                style={{
                  background: "#2c2416",
                  color: "#f0ebe0",
                  fontFamily: "Noto Serif KR, serif",
                  border: "none",
                  borderRadius: "2px",
                }}
              >
                초대장으로 →
              </button>
            </div>
          </div>

          <div className="mt-8 gallery-caption gold-text" style={{ opacity: 0.4 }}>
            {exhibitionInfo.brand} · {exhibitionInfo.season}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 음악 아이콘 컴포넌트 ──────────────────────────────────────
function MusicOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      {/* 음파 애니메이션 점들 */}
      <line x1="9" y1="9" x2="21" y2="7" />
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

// ── 큐레이터 노트 토글 컴포넌트 ──────────────────────────────
function CuratorNote({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 transition-opacity hover:opacity-80"
        style={{
          background: "none",
          border: "none",
          fontFamily: "Noto Serif KR, serif",
          fontSize: "0.72rem",
          color: "#c0392b",
          padding: 0,
          letterSpacing: "0.05em",
        }}
      >
        큐레이터 노트 {open ? "↑" : "↗"}
      </button>
      {open && (
        <p
          className="mt-2 leading-relaxed fade-in"
          style={{
            fontFamily: "Noto Serif KR, serif",
            fontSize: "0.72rem",
            color: "#6b5a40",
            lineHeight: 1.8,
            borderLeft: "2px solid rgba(192,57,43,0.3)",
            paddingLeft: "10px",
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
