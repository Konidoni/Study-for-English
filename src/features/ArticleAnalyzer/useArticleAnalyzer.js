import { useState } from "react";
import { callClaude, extractText } from "../../api/claude";
import { saveToNotion } from "../../api/notion";

const BATCH_SIZE = 2;

export function useArticleAnalyzer() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [article, setArticle] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [error, setError] = useState("");
  const [showNotion, setShowNotion] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionDone, setNotionDone] = useState(false);

  async function analyzeArticle() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setParagraphs([]);
    setArticle(null);
    setNotionDone(false);

    try {
      // Step 1: Fetch and parse article
      setProgress("기사를 가져오는 중...");
      const fetchRes = await callClaude(
        [
          {
            role: "user",
            content: `Fetch this article URL and extract its content: ${url}

Return ONLY a JSON object (no markdown, no backticks) with this structure:
{
  "title": "article title",
  "source": "publication name",
  "paragraphs": ["paragraph 1 text", "paragraph 2 text", …]
}

Split the article body into its natural paragraphs. Skip navigation, ads, footers. Only include the main article content. Each paragraph should be a meaningful chunk (not single sentences unless the original is structured that way).`,
          },
        ],
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const fetchText = extractText(fetchRes);
      let articleData;
      try {
        const cleaned = fetchText.replace(/```json|```/g, "").trim();
        articleData = JSON.parse(cleaned);
      } catch {
        setError("기사 파싱에 실패했어요. URL을 다시 확인해 주세요.");
        setLoading(false);
        return;
      }

      setArticle(articleData);
      setProgress(`"${articleData.title}" — 분석 시작...`);

      // Step 2: Analyze each paragraph in batches
      const analyzed = [];
      for (let i = 0; i < articleData.paragraphs.length; i += BATCH_SIZE) {
        const batch = articleData.paragraphs.slice(i, i + BATCH_SIZE);
        setProgress(
          `분석 중... (${Math.min(i + BATCH_SIZE, articleData.paragraphs.length)}/${articleData.paragraphs.length} 단락)`
        );

        const batchPrompt = batch
          .map((p, j) => `— Paragraph ${i + j + 1} —\n${p}`)
          .join("\n\n");

        const analysisRes = await callClaude([
          {
            role: "user",
            content: `You are a bilingual (English-Korean) article analyst and English tutor.

Analyze these paragraphs from a news article. Return ONLY a JSON array (no markdown, no backticks).

For each paragraph, return an object:
{
  "original": "the original English paragraph text",
  "translation": "자연스러운 한국어 번역",
  "summary": "이 단락의 핵심 포인트를 한국어로 2-3문장으로 정리. 무슨 내용인지, 왜 중요한지.",
  "keyExpressions": ["핵심 영어표현1 = 한국어뜻", "핵심 영어표현2 = 한국어뜻", "핵심 영어표현3 = 한국어뜻"],
  "detailed": "상세 해설을 여기에 작성.\n\n1) 주요 단어/표현을 하나씩 뜯어서 설명\n\n2) 문장 구조 설명\n\n3) 다른 상황에서 쓸 수 있는 예문 1-2개\n\n4) 한국어로 자연스럽게 풀어쓴 해석\n\n반드시 한영 병행으로 작성."
}

Paragraphs to analyze:
${batchPrompt}`,
          },
        ]);

        const analysisText = extractText(analysisRes);
        try {
          const cleaned = analysisText.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          analyzed.push(...parsed);
        } catch {
          batch.forEach((p) => {
            analyzed.push({
              original: p,
              translation: "(분석 실패)",
              summary: "",
              keyExpressions: [],
              detailed: "",
            });
          });
        }
      }

      setParagraphs(analyzed);
      setProgress("");
    } catch (e) {
      setError(`오류가 발생했어요: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotionSave(dbUrl) {
    setNotionLoading(true);
    try {
      await saveToNotion({ dbUrl, article, url, paragraphs });
      setNotionDone(true);
      setShowNotion(false);
    } catch (e) {
      alert(`노션 저장 실패: ${e.message}`);
    } finally {
      setNotionLoading(false);
    }
  }

  return {
    url,
    setUrl,
    mode,
    setMode,
    loading,
    progress,
    article,
    paragraphs,
    error,
    showNotion,
    setShowNotion,
    notionLoading,
    notionDone,
    analyzeArticle,
    handleNotionSave,
  };
}
