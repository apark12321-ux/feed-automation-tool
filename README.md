# FeedFlow Auto 개인용 자동 발행기

하루 1~10개 인스타 피드를 자동 수집, 생성, 예약 발행하기 위한 개인용 툴입니다. 기존 단순 화면형 데모에서 백엔드, SQLite DB, RSS 수집, AI 카드뉴스 생성, 이미지 렌더링, Meta API 발행 구조로 변경했습니다.

## 핵심 흐름

1. RSS/키워드 소스 등록
2. 글감 자동 수집
3. OpenAI로 카드뉴스 5장 기획
4. 1080x1080 PNG 이미지 자동 생성
5. 캡션과 해시태그 생성
6. 예약 시간에 Instagram Graph API 발행
7. DB에 결과 저장

## 설치

```bash
npm install
cp .env.example .env
npm run server
```

프론트 화면은 별도 터미널에서 실행합니다.

```bash
npm run dev
```

## 필수 환경변수

`.env`에 입력합니다.

```bash
OPENAI_API_KEY=
POSTS_PER_DAY=3
RSS_FEEDS=https://example.com/rss
META_ACCESS_TOKEN=
META_IG_USER_ID=
PUBLIC_BASE_URL=https://your-public-domain.com
```

Meta 값이 없으면 발행은 건너뛰고 `publish_failed` 또는 skipped 로그만 저장됩니다.

## API

```bash
POST /api/run/collect   # RSS 수집
POST /api/run/generate  # AI 카드뉴스 생성
POST /api/run/publish   # 예약 발행 시도
GET  /api/dashboard     # 현황
GET  /api/posts         # 생성 피드 목록
GET  /api/items         # 수집 글감 목록
```

## 자동 스케줄

서버 실행 시 기본값으로 작동합니다.

- 매일 07:00 글감 수집
- 매일 07:30 피드 생성
- 15분마다 발행 대상 확인

`.env`에서 변경할 수 있습니다.

```bash
COLLECT_CRON=0 7 * * *
GENERATE_CRON=30 7 * * *
PUBLISH_CRON=*/15 * * * *
```

## 현재 구현 상태

- 실제 RSS 수집 가능
- SQLite 저장 가능
- OpenAI 키가 있으면 카드뉴스 기획 가능
- OpenAI 키가 없으면 fallback 카드뉴스 생성
- 서버에서 1080x1080 PNG 파일 생성
- Meta API 발행 함수 포함
- 발행 로그 DB 저장

## 남은 설정

인스타 자동 발행을 하려면 Instagram Business 계정, Facebook Page 연결, Meta Developer App, 장기 Access Token, 공개 이미지 URL이 필요합니다.
