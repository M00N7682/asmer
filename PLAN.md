# ASMER - 집중을 위한 사운드 믹서

## 개요

집중, 공부, 작업에 도움이 되는 다양한 환경음을 직접 믹싱해서 들을 수 있는 웹사이트.
뽀모도로 타이머와 결합하여 시간 관리까지 한 곳에서 해결한다.

- 완전 무료, 로그인 없음
- 다크 미니멀 디자인
- 싱글페이지가 아닌 멀티페이지 구성

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | SSG + 클라이언트 인터랙션 |
| 스타일링 | Tailwind CSS v4 | 다크 테마, 빠른 스타일링 |
| 오디오 | Web Audio API + HTMLAudioElement | 믹싱, 볼륨, 노이즈 생성 |
| 상태관리 | Zustand | 글로벌 오디오 상태 (재생, 볼륨, 프리셋) |
| 저장 | localStorage | 사용자 프리셋, 마지막 설정 기억 |
| 배포 | Vercel | Next.js 네이티브 |
| 아이콘 | Lucide React | 미니멀 아이콘 세트 |

## 페이지 구성

### 1. `/` - 홈 (랜딩)
- 서비스 소개 히어로 섹션
- 주요 기능 3가지 소개 (믹서 / 타이머 / 프리셋)
- "지금 시작하기" CTA → `/mix` 이동
- 인기 프리셋 미리보기 3~4개

### 2. `/mix` - 사운드 믹서 (메인)
- **핵심 화면**: 카테고리별 사운드 그리드
- 각 사운드: 아이콘 + 이름 + on/off 토글 + 볼륨 슬라이더
- 동시에 여러 사운드 레이어링 가능
- 마스터 볼륨 컨트롤
- 현재 활성 사운드 수 표시
- 하단 또는 사이드에 미니 타이머 위젯 (접기/펼치기)
- "프리셋으로 저장" 버튼 → localStorage

### 3. `/timer` - 뽀모도로 타이머
- 큰 원형 타이머 UI
- 기본값: 25분 집중 / 5분 휴식 / 15분 긴 휴식
- 커스텀 시간 설정 (분 단위)
- 세션 카운터 (4세션 후 긴 휴식)
- 타이머 종료 시 알림음 + 브라우저 Notification
- 배경에서 현재 믹서 사운드 계속 재생
- 휴식 시간에 자동으로 볼륨 낮추기 옵션

### 4. `/presets` - 프리셋 갤러리
- 기본 제공 프리셋 목록 (카페, 비오는 밤, 숲속, 도서관 등)
- 내가 저장한 프리셋 목록
- 프리셋 클릭 → 믹서에 바로 적용
- 각 프리셋: 이름 + 포함 사운드 아이콘 + 원클릭 재생

## 사운드 카테고리 & 목록

### 자연 (Nature)
| 사운드 | 소스 방식 | 설명 |
|--------|----------|------|
| 비 (Rain) | 오디오 파일 | 가벼운 비 ~ 폭우 |
| 천둥 (Thunder) | 오디오 파일 | 간헐적 천둥소리 |
| 바람 (Wind) | 오디오 파일 | 부드러운 바람 |
| 파도 (Waves) | 오디오 파일 | 해변 파도소리 |
| 새소리 (Birds) | 오디오 파일 | 숲속 새소리 |
| 모닥불 (Campfire) | 오디오 파일 | 장작 타는 소리 |
| 시냇물 (Stream) | 오디오 파일 | 졸졸 흐르는 물 |
| 숲 (Forest) | 오디오 파일 | 숲 종합 앰비언스 |

### 도시 (Urban)
| 사운드 | 소스 방식 | 설명 |
|--------|----------|------|
| 카페 (Cafe) | 오디오 파일 | 카페 웅성거림 + 잔 부딪히는 소리 |
| 키보드 (Keyboard) | 오디오 파일 | 기계식 키보드 타이핑 |
| 도서관 (Library) | 오디오 파일 | 조용한 공간 + 가끔 페이지 넘김 |
| 거리 (Street) | 오디오 파일 | 도시 배경 교통 소리 |
| 기차 (Train) | 오디오 파일 | 기차 위 철로 소리 |

### 노이즈 (Noise)
| 사운드 | 소스 방식 | 설명 |
|--------|----------|------|
| 화이트 노이즈 | Web Audio API | 전 주파수 균일 |
| 핑크 노이즈 | Web Audio API | 저주파 강조, 자연스러운 |
| 브라운 노이즈 | Web Audio API | 깊은 저음, 수면용 |

### ASMR
| 사운드 | 소스 방식 | 설명 |
|--------|----------|------|
| 연필 소리 (Pencil) | 오디오 파일 | 연필로 글씨 쓰는 소리 |
| 종이 넘기기 (Paper) | 오디오 파일 | 책장 넘기는 소리 |
| 시계 (Clock) | 오디오 파일 | 째깍째깍 |
| 고양이 골골 (Purring) | 오디오 파일 | 고양이 그르릉 |

**총 20개 사운드** (파일 17개 + Web Audio 생성 3개)

## 오디오 파일 확보 전략

1. **1순위: freesound.org** - CC0 라이센스 검색, 루프 가능한 클립 선별
2. **2순위: Pixabay Audio** - 로열티프리 환경음
3. **노이즈 3종**: Web Audio API의 AudioBuffer로 실시간 생성 (파일 불필요)
4. **포맷**: MP3 (용량) + OGG (호환성) 듀얼 제공
5. **길이**: 각 30초~1분 루프 클립, `loop: true`로 무한 재생
6. **위치**: `/public/sounds/[category]/[name].mp3`

## 오디오 아키텍처

```
AudioContext
├── MasterGainNode (마스터 볼륨)
│   ├── GainNode (비) ← AudioBufferSourceNode (루프)
│   ├── GainNode (카페) ← AudioBufferSourceNode (루프)
│   ├── GainNode (화이트노이즈) ← ScriptProcessorNode (실시간 생성)
│   └── ...각 사운드별 GainNode
└── AnalyserNode (선택: 시각화용)
```

- 각 사운드는 독립적인 GainNode로 볼륨 제어
- MasterGainNode로 전체 볼륨 일괄 조절
- Web Audio API 컨텍스트는 유저 인터랙션 후 resume (브라우저 정책)
- 뽀모도로 휴식 진입 시 MasterGain을 0.3으로 fade

## 상태 관리 (Zustand Store)

```typescript
interface AudioStore {
  // 사운드 상태
  sounds: Record<string, {
    id: string;
    name: string;
    category: string;
    active: boolean;
    volume: number;       // 0~1
    sourceType: 'file' | 'generated';
  }>;
  masterVolume: number;
  isPlaying: boolean;

  // 액션
  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  applyPreset: (preset: Preset) => void;
  savePreset: (name: string) => void;

  // 뽀모도로
  timer: {
    mode: 'focus' | 'break' | 'longBreak' | 'idle';
    remaining: number;    // 초
    focusMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    sessions: number;
    autoStart: boolean;
    reduceOnBreak: boolean;
  };
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
}
```

## 디자인 시스템

### 컬러 팔레트
```
배경:       #0a0a0a (최하단), #111111 (카드), #1a1a1a (hover)
텍스트:     #ffffff (제목), #a0a0a0 (본문), #666666 (보조)
액센트:     #6366f1 (인디고, 주 액센트)
액센트2:    #8b5cf6 (보라, 보조 액센트)
활성:       #22c55e (사운드 on 표시)
경고:       #f59e0b (타이머 경고)
표면:       #ffffff08 (글래스 효과 배경)
보더:       #ffffff10 (미묘한 구분선)
```

### 타이포그래피
- 헤딩: Inter 또는 Pretendard, 700
- 본문: Inter 또는 Pretendard, 400
- 숫자(타이머): JetBrains Mono, 모노스페이스

### 컴포넌트 스타일
- 카드: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl`
- 버튼: `bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2`
- 슬라이더: 커스텀 range input, 액센트 컬러 트랙
- 사운드 타일: 정사각형 그리드, 활성 시 테두리 glow + 초록 인디케이터

### 레이아웃
- 최대 너비: 1280px, 중앙 정렬
- 네비게이션: 상단 고정, blur 배경
- 믹서 그리드: 4열 (데스크톱) / 3열 (태블릿) / 2열 (모바일)
- 간격: 기본 16px, 섹션간 32px

## 디렉토리 구조

```
test-asmer/
├── public/
│   └── sounds/
│       ├── nature/          # 비, 천둥, 바람, 파도, 새, 모닥불, 시냇물, 숲
│       ├── urban/           # 카페, 키보드, 도서관, 거리, 기차
│       └── asmr/            # 연필, 종이, 시계, 고양이
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 루트 레이아웃, 폰트, 공통 네비게이션
│   │   ├── page.tsx         # 홈 (랜딩)
│   │   ├── mix/
│   │   │   └── page.tsx     # 사운드 믹서
│   │   ├── timer/
│   │   │   └── page.tsx     # 뽀모도로 타이머
│   │   └── presets/
│   │       └── page.tsx     # 프리셋 갤러리
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── mixer/
│   │   │   ├── SoundGrid.tsx       # 카테고리별 사운드 그리드
│   │   │   ├── SoundTile.tsx       # 개별 사운드 타일
│   │   │   ├── VolumeSlider.tsx    # 볼륨 슬라이더
│   │   │   ├── MasterVolume.tsx    # 마스터 볼륨
│   │   │   └── CategoryTabs.tsx    # 카테고리 탭
│   │   ├── timer/
│   │   │   ├── CircleTimer.tsx     # 원형 타이머 UI
│   │   │   ├── TimerControls.tsx   # 시작/정지/리셋 버튼
│   │   │   └── TimerSettings.tsx   # 시간 설정
│   │   └── presets/
│   │       ├── PresetCard.tsx      # 프리셋 카드
│   │       └── PresetList.tsx      # 프리셋 목록
│   ├── audio/
│   │   ├── engine.ts              # Web Audio API 코어 (컨텍스트, 노드 관리)
│   │   ├── noise-generator.ts     # 화이트/핑크/브라운 노이즈 생성
│   │   └── sounds.ts              # 사운드 메타데이터 (이름, 경로, 카테고리)
│   ├── store/
│   │   ├── audio-store.ts         # Zustand 오디오 상태
│   │   └── timer-store.ts         # Zustand 타이머 상태
│   ├── data/
│   │   └── default-presets.ts     # 기본 제공 프리셋 정의
│   └── lib/
│       └── utils.ts               # cn() 등 유틸
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── PLAN.md
```

## 기본 제공 프리셋

| 이름 | 사운드 구성 | 설명 |
|------|------------|------|
| 비 오는 카페 | 비(0.6) + 카페(0.4) + 천둥(0.2) | 클래식 집중 조합 |
| 깊은 밤 | 브라운노이즈(0.5) + 시계(0.3) + 바람(0.2) | 수면/야간 작업 |
| 숲속 오두막 | 숲(0.5) + 새소리(0.3) + 모닥불(0.4) + 시냇물(0.2) | 자연 힐링 |
| 도서관 | 도서관(0.5) + 종이(0.2) + 연필(0.3) | 조용한 공부 |
| 코딩 모드 | 핑크노이즈(0.4) + 키보드(0.3) + 카페(0.2) | 개발자 집중 |
| 기차 여행 | 기차(0.6) + 비(0.3) + 바람(0.2) | 이동하는 기분 |
| Lo-fi 방 | 브라운노이즈(0.3) + 고양이(0.2) + 시계(0.3) + 비(0.2) | 아늑한 분위기 |
| 해변 | 파도(0.6) + 바람(0.3) + 새소리(0.2) | 바다 힐링 |

## 구현 순서

### Step 1: 프로젝트 셋업
- Next.js + Tailwind + Zustand 초기화
- 디렉토리 구조 생성
- 공통 레이아웃 (Navbar, 다크 테마)

### Step 2: 오디오 엔진
- Web Audio API 코어 (`audio/engine.ts`)
- 노이즈 제너레이터 (`audio/noise-generator.ts`)
- 사운드 메타데이터 정의
- 샘플 오디오 파일 3~4개 확보 (테스트용)

### Step 3: 믹서 페이지
- SoundGrid + SoundTile 컴포넌트
- 볼륨 슬라이더
- 마스터 볼륨
- 카테고리 탭 필터
- Zustand 스토어 연결

### Step 4: 뽀모도로 타이머
- CircleTimer UI (SVG 원형 프로그레스)
- 타이머 로직 (setInterval 기반)
- 세션 관리 (집중→휴식→집중→...→긴휴식)
- 브라우저 Notification
- 믹서와 연동 (휴식 시 볼륨 다운)

### Step 5: 프리셋 시스템
- 기본 프리셋 데이터 정의
- 프리셋 갤러리 페이지
- 프리셋 저장/불러오기 (localStorage)
- 프리셋 → 믹서 적용

### Step 6: 랜딩 페이지
- 히어로 섹션 (카피 + CTA)
- 기능 소개 섹션
- 인기 프리셋 미리보기
- 반응형 디자인

### Step 7: 폴리싱
- 오디오 파일 전체 확보 (20개)
- 페이드 인/아웃 트랜지션
- localStorage 지속성 (마지막 믹스 기억)
- 반응형 확인 (모바일/태블릿)
- 접근성 (키보드 네비게이션, aria)
- OG 메타태그, 파비콘

## 제약사항 & 참고

- **오디오 자동재생 불가**: 브라우저 정책상 유저 클릭 후 AudioContext.resume() 필수
- **모바일 Web Audio**: iOS Safari에서 AudioContext 제약 있음, 터치 이벤트로 unlock
- **파일 크기**: 사운드 파일 총합 20~30MB 이내 목표 (압축 MP3 128kbps)
- **SEO**: 랜딩 페이지는 SSG, 나머지는 CSR (오디오 인터랙션 중심)
- **브라우저 지원**: Chrome, Firefox, Safari, Edge (최신 2버전)
