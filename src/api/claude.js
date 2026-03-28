const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export async function callClaude(messages, tools = [], mcpServers = []) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages,
  };
  if (tools.length) body.tools = tools;
  if (mcpServers.length) body.mcp_servers = mcpServers;

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  return res.json();
}

export function extractText(data) {
  if (!data?.content) return "";
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
