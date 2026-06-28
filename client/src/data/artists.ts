// 멀티 아티스트 전시회 데이터
// 실제 운영 시 이 파일의 데이터를 교체하세요

export interface Artwork {
  id: string;
  artistId: string;
  titleKo: string;
  titleEn: string;
  imageUrl: string;
  medium: string;
  description: string;
  year: string;
  tags: string[];
}

export interface Artist {
  id: string;
  name: string;
  nameEn: string;
  profileImage: string;
  bio: string;
  specialty: string;
  tools: string;
  sns?: string;
  artworks: Artwork[];
}

// ── 샘플 작품 이미지 ─────────────────────
const UNSPLASH = (key: string) => key;

export const artists: Artist[] = [
  {
    id: "minkyung",
    name: "민경",
    nameEn: "Min-Kyung",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-1-LwujHFe4T4ThKKuxDjj4oi.webp",
    bio: "크리메타쏭 대표이자 캔바 지국장. 생성형 AI, 캔바, 캐릭터 이모티콘 디자인을 가르치는 AI 융합 마케팅 콘텐츠 강사이자 AI 아트 작가입니다. 리즈, 요코, 조코라는 오리지널 캐릭터를 통해 일상의 감정을 디지털 아트로 표현합니다.",
    specialty: "AI 아트 · 캐릭터 디자인 · 이모티콘",
    tools: "Midjourney · Canva · ChatGPT",
    sns: "#",
    artworks: [
      {
        id: "mk-1",
        artistId: "minkyung",
        titleKo: "리즈의 봄날",
        titleEn: "Liz's Spring Day",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney v6",
        description:
          "봄바람에 흩날리는 꽃잎 사이로 리즈가 처음으로 세상과 만나는 순간을 담았습니다. 따뜻한 파스텔 톤이 새로운 시작의 설렘을 전합니다.",
        year: "2025",
        tags: ["리즈", "봄", "캐릭터", "파스텔"],
      },
      {
        id: "mk-2",
        artistId: "minkyung",
        titleKo: "요코와 조코의 여행",
        titleEn: "Yoko & Joko's Journey",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney v6",
        description:
          "요코와 조코가 함께 떠난 상상 속 여행. 두 캐릭터의 우정과 모험심이 빛나는 작품입니다.",
        year: "2025",
        tags: ["요코", "조코", "여행", "우정"],
      },
      {
        id: "mk-3",
        artistId: "minkyung",
        titleKo: "AI와 나",
        titleEn: "AI and Me",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion",
        description:
          "인간과 AI가 함께 창작하는 새로운 시대를 상징하는 작품. 기술과 감성의 조화를 탐구합니다.",
        year: "2025",
        tags: ["AI", "협업", "추상", "미래"],
      },
    ],
  },
  {
    id: "soyeon",
    name: "소연",
    nameEn: "So-Yeon",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-2-LBdYaT8rvmZGSvrJeuGhym.webp",
    bio: "20년 경력의 캐릭터 디자이너이자 AI 아트 교육자. 전통 일러스트레이션과 AI 기술을 접목한 독자적인 스타일을 구축하고 있습니다. 현재 초중학생 대상 AI 아트 교육 프로그램을 운영 중입니다.",
    specialty: "캐릭터 디자인 · AI 교육 · 일러스트",
    tools: "Canva · Adobe Firefly · Procreate",
    sns: "#",
    artworks: [
      {
        id: "sy-1",
        artistId: "soyeon",
        titleKo: "꿈꾸는 소녀",
        titleEn: "Dreaming Girl",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Adobe Firefly",
        description:
          "별빛 가득한 밤하늘 아래 꿈을 꾸는 소녀의 모습. 아이들의 무한한 상상력을 담아냈습니다.",
        year: "2025",
        tags: ["소녀", "꿈", "별빛", "동화"],
      },
      {
        id: "sy-2",
        artistId: "soyeon",
        titleKo: "색깔 친구들",
        titleEn: "Color Friends",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Canva AI",
        description:
          "다양한 색깔을 의인화한 캐릭터들이 함께 어우러지는 작품. 다양성과 조화의 메시지를 담았습니다.",
        year: "2025",
        tags: ["캐릭터", "색깔", "다양성", "어린이"],
      },
    ],
  },
  {
    id: "junho",
    name: "준호",
    nameEn: "Jun-Ho",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-3-HXZcmqvYrYZ6sCxS3mrpUE.webp",
    bio: "AI 기반 추상 디지털 아트를 탐구하는 작가. 수학적 알고리즘과 생성형 AI를 결합해 인간의 감정을 기하학적 패턴으로 표현합니다. 국내외 디지털 아트 전시에 다수 참여했습니다.",
    specialty: "추상 AI 아트 · 생성 알고리즘 · NFT",
    tools: "Midjourney · Python · Processing",
    sns: "#",
    artworks: [
      {
        id: "jh-1",
        artistId: "junho",
        titleKo: "데이터의 흐름",
        titleEn: "Flow of Data",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney · Python",
        description:
          "데이터가 흐르는 방식을 시각화한 추상 작품. 디지털 시대의 정보 흐름을 아름다운 패턴으로 재해석했습니다.",
        year: "2025",
        tags: ["추상", "데이터", "알고리즘", "디지털"],
      },
      {
        id: "jh-2",
        artistId: "junho",
        titleKo: "감정의 스펙트럼",
        titleEn: "Spectrum of Emotions",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion",
        description:
          "인간의 다양한 감정을 색채와 형태로 표현한 작품. 기쁨에서 슬픔까지, 감정의 스펙트럼을 탐구합니다.",
        year: "2025",
        tags: ["감정", "스펙트럼", "색채", "추상"],
      },
    ],
  },
  {
    id: "jiyeon",
    name: "지연",
    nameEn: "Ji-Yeon",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-4-EPfNjDGSMdhZ5Hb3jvu9pi.webp",
    bio: "이모티콘 디자이너 출신의 AI 아트 작가. 귀엽고 발랄한 캐릭터 세계를 AI와 함께 확장하고 있습니다. 카카오 이모티콘 스튜디오 출신으로 현재는 AI 기반 캐릭터 IP 개발에 집중하고 있습니다.",
    specialty: "이모티콘 · 캐릭터 IP · 팝아트",
    tools: "Canva · DALL-E 3 · Procreate",
    sns: "#",
    artworks: [
      {
        id: "jy-1",
        artistId: "jiyeon",
        titleKo: "하루하루 감정일기",
        titleEn: "Daily Emotion Diary",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · DALL-E 3",
        description:
          "매일의 감정을 귀여운 캐릭터로 표현한 시리즈. 일상의 소소한 감정들이 살아있는 캐릭터로 탄생했습니다.",
        year: "2025",
        tags: ["이모티콘", "감정", "일기", "캐릭터"],
      },
      {
        id: "jy-2",
        artistId: "jiyeon",
        titleKo: "팝팝 월드",
        titleEn: "Pop Pop World",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Canva AI",
        description:
          "팝아트 스타일의 AI 캐릭터 세계. 밝고 강렬한 색채로 에너지 넘치는 세계를 표현했습니다.",
        year: "2025",
        tags: ["팝아트", "캐릭터", "컬러풀", "에너지"],
      },
    ],
  },
  {
    id: "hyunae",
    name: "현애",
    nameEn: "Hyun-Ae",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-5-YaN6n4enfw7jMExChBPCa5.webp",
    bio: "동양화와 AI를 접목한 독창적인 스타일의 작가. 수묵화의 여백미와 AI의 무한한 가능성을 결합해 전통과 현대를 잇는 작품을 창작합니다. 국내 주요 갤러리에서 개인전을 개최했습니다.",
    specialty: "동양화 AI 퓨전 · 수묵 디지털 · 전통 현대화",
    tools: "Midjourney · Stable Diffusion · Photoshop",
    sns: "#",
    artworks: [
      {
        id: "ha-1",
        artistId: "hyunae",
        titleKo: "먹빛 달빛",
        titleEn: "Ink Moon",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney · 수묵 텍스처",
        description:
          "전통 수묵화의 기법을 AI로 재해석한 작품. 달빛 아래 흐르는 먹의 농담이 디지털 공간에서 새롭게 피어납니다.",
        year: "2025",
        tags: ["수묵", "달빛", "전통", "퓨전"],
      },
      {
        id: "ha-2",
        artistId: "hyunae",
        titleKo: "산수화 2025",
        titleEn: "Landscape 2025",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion",
        description:
          "고전 산수화의 구도와 AI의 표현력이 만나 탄생한 현대적 산수화. 옛것의 아름다움을 새로운 방식으로 전달합니다.",
        year: "2025",
        tags: ["산수화", "전통", "현대", "자연"],
      },
    ],
  },
  {
    id: "taehyun",
    name: "태현",
    nameEn: "Tae-Hyun",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-6-RdqxTyrPs8nwfHFuN6P85H.webp",
    bio: "환경과 자연을 주제로 AI 아트를 창작하는 작가. 기후 변화와 생태계 보전의 메시지를 아름다운 디지털 풍경화로 담아냅니다. 환경 단체와 협력해 인식 개선 캠페인을 진행하고 있습니다.",
    specialty: "환경 아트 · 디지털 풍경화 · 사회적 메시지",
    tools: "Midjourney · Adobe Firefly · Lightroom",
    sns: "#",
    artworks: [
      {
        id: "th-1",
        artistId: "taehyun",
        titleKo: "마지막 숲",
        titleEn: "The Last Forest",
        imageUrl:
          "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artwork-sample-1-Y5FxLiT272XGQYBBEWgdvs.webp",
        medium: "AI 생성 · Midjourney v6",
        description:
          "기후 변화로 사라져가는 숲을 AI로 재현한 작품. 빛나는 생명력 속에 담긴 경고의 메시지를 전달합니다.",
        year: "2025",
        tags: ["환경", "숲", "기후변화", "생태"],
      },
      {
        id: "th-2",
        artistId: "taehyun",
        titleKo: "바다의 기억",
        titleEn: "Memory of the Sea",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Adobe Firefly",
        description:
          "오염되기 전 청정했던 바다의 기억을 담은 작품. 맑고 투명한 바다 속 생명들의 이야기를 전합니다.",
        year: "2025",
        tags: ["바다", "환경", "기억", "생명"],
      },
    ],
  },
  {
    id: "mirae",
    name: "미래",
    nameEn: "Mi-Rae",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-7-SAyCp2gpp45wFUavCq2uSm.webp",
    bio: "추상 표현주의와 AI를 결합한 실험적 작가. 감정의 날것을 AI의 언어로 번역하는 작업을 합니다. 국내외 아트페어에 참가하며 AI 아트의 예술적 가능성을 탐구하고 있습니다.",
    specialty: "추상 표현주의 · 실험 미술 · 감정 아트",
    tools: "Stable Diffusion · ControlNet · Photoshop",
    sns: "#",
    artworks: [
      {
        id: "mr-1",
        artistId: "mirae",
        titleKo: "분노의 붉은 선",
        titleEn: "Red Lines of Rage",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion · ControlNet",
        description:
          "분노라는 감정을 붉은 선과 폭발적인 형태로 표현한 작품. 억압된 감정이 해방되는 순간을 포착했습니다.",
        year: "2025",
        tags: ["추상", "감정", "표현주의", "붉은색"],
      },
      {
        id: "mr-2",
        artistId: "mirae",
        titleKo: "고요한 폭풍",
        titleEn: "Silent Storm",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion",
        description:
          "겉으로는 고요하지만 내면에서 폭풍이 이는 인간의 심리를 표현한 작품. 모순된 감정의 공존을 탐구합니다.",
        year: "2025",
        tags: ["심리", "폭풍", "내면", "추상"],
      },
    ],
  },
  {
    id: "dongwoo",
    name: "동우",
    nameEn: "Dong-Woo",
    profileImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/114049990/oJKTjxwRFGj3Rr7fAhMRTh/artist-profile-8-e5hqowUXswLurgSH9Q5xjp.webp",
    bio: "게임 컨셉 아트와 AI를 결합한 젊은 작가. 사이버펑크와 판타지 세계관을 AI로 구현하며 새로운 시각적 언어를 개발하고 있습니다. 인디 게임 개발팀과 협업하며 활발히 활동 중입니다.",
    specialty: "게임 컨셉 아트 · 사이버펑크 · 판타지",
    tools: "Midjourney · DALL-E 3 · Blender",
    sns: "#",
    artworks: [
      {
        id: "dw-1",
        artistId: "dongwoo",
        titleKo: "네온 시티 2077",
        titleEn: "Neon City 2077",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney v6",
        description:
          "미래 도시의 밤을 사이버펑크 스타일로 표현한 작품. 네온사인과 홀로그램이 가득한 미래 서울의 모습입니다.",
        year: "2025",
        tags: ["사이버펑크", "미래", "도시", "네온"],
      },
      {
        id: "dw-2",
        artistId: "dongwoo",
        titleKo: "드래곤의 귀환",
        titleEn: "Return of the Dragon",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · DALL-E 3",
        description:
          "동양 판타지 세계관의 드래곤을 현대적 감각으로 재해석한 작품. 웅장함과 신비로움이 공존합니다.",
        year: "2025",
        tags: ["판타지", "드래곤", "동양", "신화"],
      },
    ],
  },
  {
    id: "yuna",
    name: "유나",
    nameEn: "Yu-Na",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&auto=format",
    bio: "사진과 AI를 결합한 포토-AI 아트 작가. 실제 사진에 AI의 상상력을 더해 현실과 환상의 경계를 탐구합니다. 패션 브랜드와 협업해 AI 기반 비주얼 아이덴티티 작업도 진행하고 있습니다.",
    specialty: "포토-AI 아트 · 패션 비주얼 · 현실-환상 경계",
    tools: "Adobe Firefly · Lightroom · Photoshop AI",
    sns: "#",
    artworks: [
      {
        id: "yn-1",
        artistId: "yuna",
        titleKo: "현실과 꿈 사이",
        titleEn: "Between Reality and Dream",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&auto=format"),
        medium: "사진 + AI 합성 · Adobe Firefly",
        description:
          "실제 도시 사진에 AI가 만들어낸 환상적 요소를 더한 작품. 우리가 사는 현실 속 숨겨진 마법을 발견합니다.",
        year: "2025",
        tags: ["포토아트", "현실", "환상", "도시"],
      },
      {
        id: "yn-2",
        artistId: "yuna",
        titleKo: "빛의 초상",
        titleEn: "Portrait of Light",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop&auto=format"),
        medium: "사진 + AI 합성 · Photoshop AI",
        description:
          "빛과 그림자의 대비를 AI로 극대화한 인물 초상 작품. 빛이 만들어내는 감정의 깊이를 탐구합니다.",
        year: "2025",
        tags: ["초상", "빛", "그림자", "인물"],
      },
    ],
  },
  {
    id: "seojun",
    name: "서준",
    nameEn: "Seo-Jun",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format",
    bio: "건축과 AI 아트를 접목한 공간 시각화 작가. 존재하지 않는 건축물과 공간을 AI로 구현하며 미래 도시의 모습을 탐구합니다. 건축 사무소와 협업해 AI 기반 컨셉 디자인 작업도 진행합니다.",
    specialty: "건축 비주얼라이제이션 · 공간 디자인 · 미래 도시",
    tools: "Midjourney · Stable Diffusion · SketchUp",
    sns: "#",
    artworks: [
      {
        id: "sj-1",
        artistId: "seojun",
        titleKo: "하늘 위의 정원",
        titleEn: "Garden in the Sky",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Midjourney v6",
        description:
          "고층 빌딩 위에 펼쳐진 미래형 정원을 시각화한 작품. 자연과 건축이 공존하는 미래 도시의 모습을 담았습니다.",
        year: "2025",
        tags: ["건축", "정원", "미래", "자연"],
      },
      {
        id: "sj-2",
        artistId: "seojun",
        titleKo: "물 위의 도시",
        titleEn: "City on Water",
        imageUrl: UNSPLASH("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop&auto=format"),
        medium: "AI 생성 · Stable Diffusion",
        description:
          "해수면 상승에 대응하는 미래 수상 도시를 상상한 작품. 인류의 적응력과 창의성에 대한 낙관적 시각을 담았습니다.",
        year: "2025",
        tags: ["수상도시", "미래", "건축", "환경"],
      },
    ],
  },
];

export const exhibitionInfo = {
  title: "AI 아트 컬렉티브 2025",
  titleEn: "AI Art Collective 2025",
  subtitle: "10인의 작가가 함께 그리는 AI 아트의 현재와 미래",
  brand: "크리메타쏭 × AI 아트 갤러리",
  season: "SPRING 2025",
  curatedBy: "민경 (크리메타쏭)",
  totalArtists: 10,
};
