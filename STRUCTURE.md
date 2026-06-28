# 멀티 아티스트 온라인 전시회 구조 설계

## 페이지 구조
1. **초대장 (Invitation)** — 전시회 대표 소개 + 입장 버튼 + BGM 시작
2. **작가 목록 (Artists)** — 10명 작가 카드 그리드 (프로필 사진, 이름, 한줄 소개)
3. **작가 상세 (Artist Detail)** — 작가 소개 + 해당 작가 작품 갤러리
4. **작품 뷰어 (Artwork Viewer)** — 작품 확대 + 설명 + 이전/다음 네비게이션
5. **에필로그 (Epilogue)** — 전시회 마무리 + 참여 작가 전체 목록

## 데이터 모델
```ts
interface Artist {
  id: string;
  name: string;          // 한글 이름
  nameEn: string;        // 영문 이름
  profileImage: string;  // 프로필 이미지 URL
  bio: string;           // 작가 소개 (한글)
  bioEn: string;         // 영문 소개
  specialty: string;     // 전문 분야 (예: AI 아트, 캐릭터 디자인)
  sns?: string;          // SNS 링크
  artworks: Artwork[];   // 해당 작가 작품 목록
}

interface Artwork {
  id: string;
  artistId: string;
  titleKo: string;
  titleEn: string;
  imageUrl: string;
  medium: string;        // 제작 도구/기법
  description: string;
  curatorNote: string;
  tags: string[];
  year: string;
}
```

## 라우팅 (Wouter)
- `/` → 초대장
- `/artists` → 작가 목록
- `/artists/:id` → 작가 상세 + 작품 갤러리
- `/artists/:id/artwork/:artworkId` → 작품 상세 뷰어
- `/epilogue` → 에필로그

## 네비게이션 흐름
초대장 → [입장하기] → 작가 목록 → [작가 카드 클릭] → 작가 상세 → [작품 클릭] → 작품 뷰어
