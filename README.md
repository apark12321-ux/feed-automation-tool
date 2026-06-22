# FeedFlow Auto

혜택로와 분리해서 운영하는 독립형 피드 자동화 사이트입니다.

## 기능

- 브랜드 톤/컬러 설정
- 1080x1080 피드 이미지 자동 생성
- 캡션/해시태그 자동 생성
- 발행 큐 상태 관리
- JSON 백업
- Google Alerts RSS → Google Sheet 수집용 Apps Script 포함

## 실행

```bash
npm install
npm run dev
```

## 배포

Vercel에서 새 GitHub 저장소를 Import하면 됩니다.

Build Command:

```bash
npm run build
```

Output Directory:

```bash
dist
```

## 자동화 구조

Google Alerts RSS → Apps Script → Google Sheet FeedQueue → FeedFlow Auto → Meta Business Suite/Buffer/Make/Zapier → Published

## Apps Script

`automation/google_apps_script_rss_to_sheet.js` 파일을 Google Sheet Apps Script에 붙여넣고 `RSS_FEEDS`에 구글알리미 RSS 주소를 넣으세요.
