/**
 * ZoomableImage — 핀치 줌 / 더블탭 확대 / 마우스 휠 줌 / 드래그 이동
 *
 * 사용법:
 *   <ZoomableImage src="..." alt="..." className="..." />
 *
 * 기능:
 *  - 마우스 휠: 줌 인/아웃
 *  - 마우스 드래그: 확대 시 이미지 이동
 *  - 더블클릭: 2× 확대 / 원래 크기 토글
 *  - 터치 핀치: 두 손가락 확대/축소
 *  - 터치 드래그: 확대 시 이미지 이동
 *  - 더블탭: 2× 확대 / 원래 크기 토글
 *  - 줌 리셋 버튼 (우하단)
 */
import { useRef, useState, useCallback, useEffect, type PointerEvent, type WheelEvent } from "react";

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  maxZoom?: number;
  minZoom?: number;
}

const ZOOM_STEP = 0.25;
const DEFAULT_MAX_ZOOM = 5;
const DEFAULT_MIN_ZOOM = 1;
const DOUBLE_TAP_ZOOM = 2.5;

export default function ZoomableImage({
  src,
  alt = "",
  className = "",
  style,
  maxZoom = DEFAULT_MAX_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
}: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 드래그 상태
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });

  // 핀치 상태
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const pinchMidpoint = useRef({ x: 0, y: 0 });
  const offsetAtPinchStart = useRef({ x: 0, y: 0 });

  // 더블탭 상태
  const lastTapTime = useRef(0);
  const lastTapPos = useRef({ x: 0, y: 0 });

  // ── 유틸 ──────────────────────────────────────────────────────────────────
  const clampOffset = useCallback(
    (ox: number, oy: number, s: number) => {
      const el = containerRef.current;
      if (!el) return { x: ox, y: oy };
      const w = el.clientWidth;
      const h = el.clientHeight;
      const maxX = (w * (s - 1)) / 2;
      const maxY = (h * (s - 1)) / 2;
      return {
        x: Math.min(maxX, Math.max(-maxX, ox)),
        y: Math.min(maxY, Math.max(-maxY, oy)),
      };
    },
    []
  );

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // ── 마우스 휠 줌 ──────────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setScale((prev) => {
        const next = Math.min(maxZoom, Math.max(minZoom, prev + delta));
        if (next === minZoom) setOffset({ x: 0, y: 0 });
        return next;
      });
    },
    [maxZoom, minZoom]
  );

  // ── 더블클릭 줌 ───────────────────────────────────────────────────────────
  const handleDoubleClick = useCallback(() => {
    setScale((prev) => {
      if (prev > 1) {
        setOffset({ x: 0, y: 0 });
        return 1;
      }
      return DOUBLE_TAP_ZOOM;
    });
  }, []);

  // ── 포인터(마우스) 드래그 ─────────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // 터치 이벤트는 별도 처리
      if (e.pointerType === "touch") return;
      if (scale <= 1) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetAtDragStart.current = { ...offset };
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [scale, offset]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return;
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const raw = {
        x: offsetAtDragStart.current.x + dx,
        y: offsetAtDragStart.current.y + dy,
      };
      setOffset(clampOffset(raw.x, raw.y, scale));
    },
    [scale, clampOffset]
  );

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    isDragging.current = false;
  }, []);

  // ── 터치 이벤트 ───────────────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
        // 핀치 시작
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        pinchStartDist.current = dist;
        pinchStartScale.current = scale;
        offsetAtPinchStart.current = { ...offset };
        pinchMidpoint.current = {
          x: (t0.clientX + t1.clientX) / 2,
          y: (t0.clientY + t1.clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        // 더블탭 감지
        const now = Date.now();
        const t = e.touches[0];
        const dx = t.clientX - lastTapPos.current.x;
        const dy = t.clientY - lastTapPos.current.y;
        const dist = Math.hypot(dx, dy);
        if (now - lastTapTime.current < 300 && dist < 30) {
          // 더블탭
          setScale((prev) => {
            if (prev > 1) {
              setOffset({ x: 0, y: 0 });
              return 1;
            }
            return DOUBLE_TAP_ZOOM;
          });
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
          lastTapPos.current = { x: t.clientX, y: t.clientY };
        }
        // 드래그 시작
        if (scale > 1) {
          isDragging.current = true;
          dragStart.current = { x: t.clientX, y: t.clientY };
          offsetAtDragStart.current = { ...offset };
        }
      }
    },
    [scale, offset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchStartDist.current !== null) {
        // 핀치 줌
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const ratio = dist / pinchStartDist.current;
        const next = Math.min(maxZoom, Math.max(minZoom, pinchStartScale.current * ratio));
        setScale(next);
        if (next <= 1) setOffset({ x: 0, y: 0 });
      } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
        // 드래그 이동
        const t = e.touches[0];
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        const raw = {
          x: offsetAtDragStart.current.x + dx,
          y: offsetAtDragStart.current.y + dy,
        };
        setOffset(clampOffset(raw.x, raw.y, scale));
      }
    },
    [scale, maxZoom, minZoom, clampOffset]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pinchStartDist.current = null;
    }
    if (e.touches.length === 0) {
      isDragging.current = false;
    }
  }, []);

  // scale 변경 시 offset 재클램핑
  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, scale));
  }, [scale, clampOffset]);

  const isZoomed = scale > 1.05;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        cursor: isZoomed ? (isDragging.current ? "grabbing" : "grab") : "zoom-in",
        touchAction: "none",
        ...style,
      }}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transition: isDragging.current ? "none" : "transform 0.15s cubic-bezier(0.23,1,0.32,1)",
          willChange: "transform",
          userSelect: "none",
        }}
      />

      {/* 줌 컨트롤 버튼 (우하단) */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1.5"
        style={{ zIndex: 10 }}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {isZoomed && (
          <button
            onClick={(e) => { e.stopPropagation(); resetZoom(); }}
            className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "rgba(8,8,16,0.75)",
              border: "1px solid rgba(201,169,110,0.4)",
              color: "#c9a96e",
              backdropFilter: "blur(4px)",
            }}
            title="원래 크기로"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setScale((p) => Math.min(maxZoom, p + ZOOM_STEP)); }}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:opacity-80 active:scale-95"
          style={{
            background: "rgba(8,8,16,0.75)",
            border: "1px solid rgba(201,169,110,0.3)",
            color: "rgba(201,169,110,0.8)",
            backdropFilter: "blur(4px)",
          }}
          title="확대"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setScale((p) => { const n = Math.max(minZoom, p - ZOOM_STEP); if (n <= 1) setOffset({ x: 0, y: 0 }); return n; }); }}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:opacity-80 active:scale-95"
          style={{
            background: "rgba(8,8,16,0.75)",
            border: "1px solid rgba(201,169,110,0.3)",
            color: "rgba(201,169,110,0.8)",
            backdropFilter: "blur(4px)",
          }}
          title="축소"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* 줌 레벨 표시 */}
      {isZoomed && (
        <div
          className="absolute top-3 left-3 gallery-caption"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(201,169,110,0.7)",
            background: "rgba(8,8,16,0.6)",
            padding: "2px 7px",
            borderRadius: "2px",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
        >
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* 힌트 (처음 1회) */}
      {!isZoomed && (
        <div
          className="absolute bottom-3 left-3 gallery-caption pointer-events-none"
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.08em",
            color: "rgba(201,169,110,0.45)",
            background: "rgba(8,8,16,0.5)",
            padding: "2px 7px",
            borderRadius: "2px",
            backdropFilter: "blur(4px)",
          }}
        >
          더블탭 · 핀치 · 휠로 확대
        </div>
      )}
    </div>
  );
}
