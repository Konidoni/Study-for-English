# Article Analyzer — 뉴스 기사 한영 해설 + 노션 아카이빙 앱

## 개요

영어 뉴스 기사 URL을 입력하면 **단락별로 한영 병행 해설**을 자동 생성하고, 분석 결과를 **노션 데이터베이스에 저장**하는 React 앱.

-----

## 핵심 기능

### 1. 기사 분석 (2가지 모드)

|모드     |설명                                         |
|-------|-------------------------------------------|
|🔍 상세 해설|단어/표현을 하나씩 뜯어서 설명. 문장 구조, 비즈니스 문맥, 활용 예문 포함|
|⚡ 핵심 요약|단락별 핵심 포인트 2-3문장 + 주요 영어 표현 태그             |

각 단락마다 제공되는 항목:

- 영어 원문
- 자연스러운 한국어 번역
- 핵심 영어 표현 (영어 = 한국어 뜻)
- 상세 해설 or 핵심 요약 (모드에 따라 전환)

### 2. 노션 아카이빙

- 분석 완료 후 "노션 저장" 버튼 클릭
- 노션 데이터베이스 URL 입력
- 제목, 원문, 번역, 해설 전체가 데이터베이스에 페이지로 생성됨
- DB에 URL/Source/Date 속성이 있으면 자동으로 채움

-----

## 기술 스택

- **프론트엔드**: React (Vite)
- **AI 분석**: Anthropic API (Claude Sonnet 4.6) — 기사 파싱 + 한영 해설 생성
- **기사 수집**: Claude web_search 도구로 URL 페치
- **노션 연동**: Notion MCP 서버 (`https://mcp.notion.com/mcp`)

-----

## 동작 흐름

```
1. 사용자가 URL 입력
2. Claude API + web_search로 기사 본문 추출 → JSON (title, source, paragraphs[])
3. 단락 2개씩 배치로 Claude API에 분석 요청
   → 각 단락별: 원문, 번역, 요약, 핵심표현, 상세해설 생성
4. 결과를 카드 UI로 렌더링 (모드 토글 가능)
5. (선택) 노션 저장 → Claude API + Notion MCP로 데이터베이스에 페이지 생성
```

-----

## 주요 컴포넌트 구조

```
ArticleAnalyzer (메인)
├── ModeToggle          — 상세 해설 / 핵심 요약 모드 전환
├── ParagraphCard       — 단락별 분석 결과 카드
│   ├── 원문 표시
│   ├── 한국어 번역
│   ├── 상세 해설 (detailed 모드)
│   └── 핵심 포인트 + 표현 태그 (summary 모드)
└── NotionSaveModal     — 노션 DB URL 입력 모달
```

-----

## API 호출 구조

### 기사 파싱

```javascript
callClaude(messages, [{ type: "web_search_20250305", name: "web_search" }])
// → URL 페치 후 title, source, paragraphs[] JSON 반환
```

### 단락 분석

```javascript
callClaude(messages)
// → 단락별 original, translation, summary, keyExpressions, detailed JSON 반환
```

### 노션 저장

```javascript
callClaude(messages, [], [{ type: "url", url: NOTION_MCP, name: "notion-mcp" }])
// → Notion MCP로 데이터베이스에 페이지 생성
```

-----

## 실행 방법

```bash
cp .env.local.example .env.local
# .env.local에 VITE_ANTHROPIC_API_KEY 입력
npm install
npm run dev
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `VITE_ANTHROPIC_API_KEY` | Anthropic API 키 |
| `VITE_NOTION_MCP_URL` | Notion MCP URL (기본값: `https://mcp.notion.com/mcp`) |
