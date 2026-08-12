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

## 작가 상세 페이지 UI 개선 (2026-07-06)
- [x] ArtistDetailPage.tsx 전면 재작성 — 작품 중심 레이아웃
- [x] 히어로 섹션 높이 축소 (작가 이름 크기 적정화)
- [x] 작품 카드 클릭 시 우측 패널에 상세 정보 즉시 표시 (좌우 분할 레이아웃)
- [x] 작품 상세 패널: 제목, 연도, 매체, 설명, 태그, 좋아요, 전체화면 버튼
- [x] 작가 소개 띠 섹션 추가 (히어로 아래)
- [x] index.css html font-size 17px 상향 (전체 텍스트 가독성 향상)
- [x] gallery-caption 폰트 크기 0.7rem → 0.82rem 상향

## 히어로 섹션 개선 + 전시회 커버 이미지 + 초대 링크 자동 연결 (2026-07-07)
- [x] ArtistDetailPage.tsx — 히어로 섹션: 프로필 이미지+이름 좌우 배치, 커버는 첫 번째 작품 이미지로 대체
- [x] DB schema — exhibitions 테이블에 coverImageUrl 컬럼 이미 존재 (마이그레이션 불필요)
- [x] server/routers.ts — 전시회 생성/수정에 coverImageUrl 포함, admin.uploadExhibitionCover 프로시저 추가
- [x] AdminPage.tsx — 전시회 카드에 커버 이미지 업로드 UI 추가
- [x] 초대 링크 생성 시 전시회 지정 드롭다운 추가 (AdminPage.tsx)
- [x] 가입 후 초대 링크의 전시회로 자동 연결 (invitations.exhibitionId → artist.exhibitionId)

## 전시회 커버 이미지 표시 (2026-07-07)
- [x] ExhibitionsPage.tsx — 전시회 카드 상단에 200px 커버 이미지 영역 추가 (상태/시즌 배지 오버레이)
- [x] ExhibitionDetailPage.tsx — 초대장 배경에 커버 이미지 전체화면 표시 (어두운 오버레이)
- [x] ExhibitionDetailPage.tsx — 작가 목록 헤더에 커버 이미지 배너 표시
- [x] 커버 이미지 없을 때 기존 UI 폴백 처리

## 작품 뷰어 + 홈 배너 + 크롭 기능 (2026-07-09)
- [x] ArtworkViewerPage.tsx — 정보 패널 항상 오른쪽에 표시 (좌우 분할, 420px 너비, 독립 스크롤)
- [x] Home.tsx — 전시회 목록 바로가기 "모든 전시회 보기 →" 버튼 추가
- [x] AdminPage.tsx — 커버 이미지 업로드 후 16:9 크롭 모달 UI 추가 (react-image-crop)

## 작품 뷰어 기능 확장 (2026-07-10)
- [x] ArtworkViewerPage.tsx — 이미지 클릭 시 전체화면 라이트박스 모달 (ESC/클릭 닫기, zoom-in 커서)
- [x] ArtworkViewerPage.tsx — 정보 패널 하단 "이 작가의 다른 작품" 64px 썸네일 섹션 (OTHER WORKS)
- [x] ArtworkViewerPage.tsx — 상단 바 + 정보 패널 하단에 링크 복사 + 카카오톡 공유 버튼 (SHARE 섹션)

## 작품 탐색 버튼 가시성 개선 (2026-08-13)
- [x] ArtworkViewerPage 및 GalleryBrowsePage — 모든 작품 배경에서 선명하게 보이는 이전·다음 화살표 UI 적용
- [x] ArtworkViewerPage 및 GalleryBrowsePage — 탐색 버튼을 작품 바깥 여백으로 이동하고 최소 침범형 스타일로 재조정
