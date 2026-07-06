# 민경 AI 아트 갤러리 — TODO

## 핵심 기능
- [x] 초대장 페이지 (씰 스탬프, 입장 버튼)
- [x] BGM 자동 재생 (입장 시 페이드인, 음소거 토글)
- [x] 10인 작가 목록 그리드 페이지 (/artists)
- [x] 작가 상세 페이지 (/artists/:id)
- [x] 작품 뷰어 페이지 (좌우 화살표 + 키보드 네비게이션)
- [x] 에필로그 페이지 (/epilogue)
- [x] 모바일 반응형 지원

## 풀스택 업그레이드 (DB + 인증 + 스토리지)
- [x] DB 스키마 설계 (artists, artworks 테이블)
- [x] DB 마이그레이션 완료
- [x] 작가/작품 CRUD API (tRPC)
- [x] 파일 업로드 API (이미지/동영상 → S3)
- [x] 작가 마이페이지 (/my) — 프로필 등록/수정
- [x] 작품 업로드/수정/삭제 UI
- [x] 헤더 로그인/로그아웃/MY 버튼
- [x] 관리자 API (admin 라우터)

## 향후 개선 사항
- [x] 작가 목록 페이지 — DB 데이터 연동
- [x] 작가 상세 페이지 — DB 작품 데이터 연동
- [x] 관리자 대시보드 UI (/admin)
- [x] 카카오톡 공유 버튼
- [x] OG 메타태그 설정

## 신규 기능 (2025-06-29)
- [x] DB 스키마 — invitations, artwork_likes, artwork_comments 테이블 추가
- [x] 관리자: 작가 초대 링크 생성 기능 (AdminPage)
- [x] 작가: 초대 링크로 접속 시 자동 작가 등록 흐름 (InvitePage)
- [x] 작품 뷰어: 좋아요 버튼 (비로그인도 가능, 중복 방지)
- [x] 작품 뷰어: 감상 댓글 작성/목록 표시
- [x] 작가 상세 페이지: 작품별 좋아요 수 표시

## 플랫폼 확장 (2025-06-29 v2)
- [x] 마이페이지 작품 업로드 버튼 가시성 개선 (드래그&드롭 + 큰 버튼)
- [x] DB 스키마 — exhibitions 테이블 추가 (전시회 이름, 슬러그, 인원 설정, 기간 등)
- [x] 관리자: 전시회 생성/수정/삭제 UI
- [x] 전시회별 참여 인원 자유 설정 (최소 1명~무제한)
- [x] 전시회 선택 랜딩 페이지 (여러 전시회 목록)
- [x] 전시회별 독립 URL 지원 (/exhibition/:slug)
- [x] 전시회와 작가/작품 연결 구조 (artist.exhibitionId)

## 개선 작업 (2025-06-29 v3)
- [x] 샘플 전시회 DB에 직접 생성 (ai-art-2025)
- [x] 작가 프로필 미등록 시 명확한 안내 및 원클릭 등록 유도 UX 개선
- [x] 파일 크기 제한 15MB → 50MB로 확대 (이미지/동영상)
- [x] 대용량 파일 업로드 시 진행 상태 표시 개선

## 버그 수정 및 기능 추가 (2025-06-29 v4)
- [x] 전시회 카드 이름/슬러그 표시 버그 수정 (DB 데이터 정상 렌더링)
- [x] 관리자 직접 작품 업로드 기능 추가 (작품 관리 탭에 업로드 버튼)
- [x] 관리자가 특정 작가에게 작품을 대신 등록할 수 있는 기능 (admin.uploadArtworkForArtist)

## 드래그 앤 드롭 순서 변경 (2025-06-30)
- [x] @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities 패키지 설치
- [x] server/db.ts — reorderArtworks 함수 추가 (displayOrder 일괄 업데이트)
- [x] server/routers.ts — admin.reorderArtworks 프로시저 추가
- [x] AdminPage.tsx — 작품 관리 탭에 드래그 앤 드롭 정렬 UI 구현 (SortableArtworkCard, DragOverlay)
- [x] 변경 후 "순서 저장" 배너 + 되돌리기 기능

## 작가-전시회 연결 UI (2025-06-30)
- [x] server/db.ts — assignArtistToExhibition 함수 추가
- [x] server/routers.ts — admin.assignArtistToExhibition 프로시저 추가 (기존 exhibition.assignArtist 재활용)
- [x] AdminPage.tsx — 작가 관리 탭에 전시회 연결 드롭다운 UI 구현
- [x] 작가 카드에 현재 연결된 전시회 배지 표시 (미연결 시 경고 배지)

## 관리자 작가 프로필 편집 기능 (2026-07-06)
- [x] server/db.ts — updateArtist 함수 기존 재활용
- [x] server/routers.ts — admin.updateArtist 프로시저 기존 재활용
- [x] AdminPage.tsx — 작가 카드에 "프로필 편집" 버튼 + 애니메이션 인라인 편집 폼 UI 구현 (이름, 영문명, 소개, 전문 분야, 도구, SNS, 프로필 이미지 URL)
