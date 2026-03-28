import { callClaude, extractText } from "./claude";

const NOTION_MCP = import.meta.env.VITE_NOTION_MCP_URL || "https://mcp.notion.com/mcp";

export async function saveToNotion({ dbUrl, article, url, paragraphs }) {
  let content = `# ${article?.title || "Article Analysis"}\n\n`;
  content += `**Source:** ${article?.source || "Unknown"}\n`;
  content += `**URL:** ${url}\n`;
  content += `**분석일:** ${new Date().toLocaleDateString("ko-KR")}\n\n---\n\n`;

  paragraphs.forEach((p, i) => {
    content += `## 단락 ${i + 1}\n\n`;
    content += `> ${p.original}\n\n`;
    content += `**번역:** ${p.translation}\n\n`;
    if (p.summary) content += `**핵심:** ${p.summary}\n\n`;
    if (p.keyExpressions?.length) {
      content += `**주요 표현:** ${p.keyExpressions.join(" | ")}\n\n`;
    }
    if (p.detailed) content += `**상세 해설:**\n${p.detailed}\n\n`;
    content += `---\n\n`;
  });

  const notionRes = await callClaude(
    [
      {
        role: "user",
        content: `I need to add a new page to a Notion database.
The database URL is: ${dbUrl}

First, fetch the database to understand its properties/schema using the notion-fetch tool with the database URL.

Then create a new page in that database. The page should have:
- Title/Name: "${article?.title || "Article Analysis"}"

Page content (body):
${content}

If the database has properties like URL, Source, Date, or Tags, fill them:
- URL property: ${url}
- Source: ${article?.source || ""}
- Date: ${new Date().toISOString().split("T")[0]}`,
      },
    ],
    [],
    [{ type: "url", url: NOTION_MCP, name: "notion-mcp" }]
  );

  const responseText = extractText(notionRes);
  if (
    responseText.toLowerCase().includes("error") &&
    !responseText.toLowerCase().includes("created")
  ) {
    throw new Error(responseText.slice(0, 200));
  }
}
