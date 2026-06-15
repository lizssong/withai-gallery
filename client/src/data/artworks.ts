// 민경 AI 아트 갤러리 — 전시 작품 데이터
// Design: Ink & Light — 먹빛 배경 + 화선지 카드 + 주홍 인주 포인트

export interface Artwork {
  id: number;
  total: number;
  award: string;
  awardEn: string;
  titleKo: string;
  titleEn: string;
  medium: string;
  year: string;
  description: string;
  curatorNote: string;
  imageUrl: string;
  tags: string[];
}

export const artworks: Artwork[] = [
  {
    id: 1,
    total: 6,
    award: "✦ 리즈상",
    awardEn: "Character of the Year",
    titleKo: "리즈의 첫 번째 봄",
    titleEn: "Liz's First Spring",
    medium: "AI Character Design, 2026",
    year: "2026",
    description:
      "분홍빛 머리카락을 흩날리며 봄바람 속을 걷는 리즈. 설레는 첫 만남처럼 가볍고 따뜻한 이 작품은 일상의 작은 행복을 캐릭터의 표정 하나로 담아낸다. 생성형 AI와 작가의 감성이 만나 탄생한 리즈는 크리메타쏭의 첫 번째 캐릭터이자, 민경 작가의 분신이다.",
    curatorNote:
      "리즈 캐릭터는 작가 민경의 내면 세계를 가장 직접적으로 표현한 작품입니다. 핑크 톤의 따뜻함과 큰 눈의 순수함이 AI 아트의 새로운 가능성을 보여줍니다.",
    imageUrl:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/character-liz-SsrmEirWgr55FseMUdaCJx.webp",
    tags: ["캐릭터 디자인", "AI 아트", "리즈"],
  },
  {
    id: 2,
    total: 6,
    award: "✦ 우정상",
    awardEn: "Best Friendship",
    titleKo: "요코와 조코의 산책",
    titleEn: "Yoko & Joko's Walk",
    medium: "AI Character Design, 2026",
    year: "2026",
    description:
      "흰 토끼 요코와 갈색 곰 조코가 나란히 걷는 오후. 분홍 후드티와 노란 후드티, 서로 다른 색이지만 완벽하게 어울리는 두 친구. 함께 있을 때 더 빛나는 존재들의 이야기를 AI 아트로 그려냈다.",
    curatorNote:
      "요코와 조코는 다름 속의 조화를 상징합니다. 두 캐릭터의 대비되는 색상과 형태는 서로를 더욱 돋보이게 하며, 진정한 우정의 의미를 시각적으로 전달합니다.",
    imageUrl:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/character-yoko-joko-iJPgTAdruCUVQbtXtuypPF.webp",
    tags: ["캐릭터 디자인", "AI 아트", "요코", "조코"],
  },
  {
    id: 3,
    total: 6,
    award: "✦ 창조상",
    awardEn: "Creative Excellence",
    titleKo: "AI와 먹의 경계",
    titleEn: "Between AI and Ink",
    medium: "AI Digital Art, 2026",
    year: "2026",
    description:
      "전통 수묵화의 붓 터치와 AI 생성 이미지가 만나는 경계. 금빛 소용돌이와 붉은 달이 어우러진 이 작품은 동양의 전통 미학과 현대 디지털 아트의 충돌이자 융합이다. 크리메타쏭 대표 민경이 탐구하는 AI 아트의 새로운 지평.",
    curatorNote:
      "이 작품은 AI 기술이 전통 예술과 어떻게 대화할 수 있는지를 보여주는 실험적 시도입니다. 수묵의 우연성과 AI의 정밀함이 만나 예측 불가능한 아름다움을 만들어냅니다.",
    imageUrl:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/ai-art-hero-3sJKfru7nrpmUeWA8e5kgV.webp",
    tags: ["AI 아트", "수묵화", "디지털 아트"],
  },
  {
    id: 4,
    total: 6,
    award: "✦ 초대상",
    awardEn: "Invitation of the Year",
    titleKo: "비밀의 전시회",
    titleEn: "The Secret Exhibition",
    medium: "AI Gallery Design, 2026",
    year: "2026",
    description:
      "어두운 밤, 크림빛 초대장 한 장이 도착한다. 붉은 밀랍 씰을 뜯으면 그 안에는 또 다른 세계가 펼쳐진다. 민경 작가가 AI로 구현한 전시 초대장 시리즈. 디지털과 아날로그의 경계를 허무는 새로운 형식의 예술.",
    curatorNote:
      "초대장이라는 형식 자체를 예술 작품으로 승화시킨 작품입니다. 관람객을 단순한 구경꾼이 아닌 이야기의 참여자로 만드는 민경 작가의 독특한 시각이 돋보입니다.",
    imageUrl:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/gallery-invitation-DeV7RbU7kFXnJfEnA7trZp.webp",
    tags: ["갤러리 디자인", "AI 아트", "초대장"],
  },
  {
    id: 5,
    total: 6,
    award: "✦ 교육상",
    awardEn: "Education & AI",
    titleKo: "AI와 함께 그리는 교실",
    titleEn: "Drawing with AI in Class",
    medium: "AI Education Art, 2026",
    year: "2026",
    description:
      "초중학생들과 함께 AI로 그림을 그리는 수업 현장. 아이들의 상상력과 AI의 표현력이 만나 탄생한 작품들. 생성형 AI 전문 강사로서 민경이 추구하는 교육의 방향 — 기술은 도구이고, 창의성은 아이들 안에 있다.",
    curatorNote:
      "교육 현장에서 AI 아트를 가르치는 민경 작가의 철학이 담긴 작품입니다. 기술의 민주화, 창의성의 해방 — 이 작품은 그 가능성을 보여줍니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
    tags: ["AI 교육", "캐릭터 디자인", "어린이"],
  },
  {
    id: 6,
    total: 6,
    award: "✦ 작가상",
    awardEn: "Artist's Choice",
    titleKo: "크리메타쏭의 세계",
    titleEn: "World of Crimetasong",
    medium: "AI Brand Art, 2026",
    year: "2026",
    description:
      "크리메타쏭(Creative + Metaverse + Song)의 세계관을 담은 브랜드 아트. 리즈, 요코, 조코가 함께 만들어가는 창의적 메타버스. AI 아트, 캐릭터 디자인, 강의, 전시를 아우르는 민경 작가의 예술 세계가 하나의 화폭에 펼쳐진다.",
    curatorNote:
      "크리메타쏭은 단순한 브랜드가 아닌 하나의 예술 세계입니다. 이 작품은 그 세계관의 집약체로, 민경 작가가 추구하는 창의성과 기술의 융합을 가장 잘 보여줍니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    tags: ["브랜드 아트", "AI 아트", "크리메타쏭"],
  },
];

export const exhibitionInfo = {
  title: "민경의 AI 아트 갤러리",
  subtitle: "AI Art & Character Design",
  season: "SPRING 2026",
  type: "SPECIAL EXHIBITION",
  artist: "민경 (Min-Kyung)",
  brand: "크리메타쏭",
  description:
    "AI 융합 마케팅 콘텐츠 강사이자 캐릭터 디자이너 민경의 첫 번째 온라인 전시회. 리즈, 요코, 조코와 함께하는 AI 아트의 세계로 여러분을 초대합니다.",
  invitationText:
    "조명을 낮추고, 한 작품씩 천천히 걸으며 만나주세요.",
  rooms: 6,
  tools: "생성형 AI · 캔바 · 캐릭터 디자인",
};
