import dotenv from "dotenv";

dotenv.config();

const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const openRouterKey = process.env.OPENROUTER_API_KEY;

if (!openRouterKey) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

export const generateResponse = async (prompt) => {
  const res = await fetch(openRouterUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey}`,
      "HTTP-Referer": "https://genai-project-1-r3mq.onrender.com",
      "X-Title": "GenWeb AI",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Return only valid raw JSON. No markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("OpenRouter Error:", text);
    throw new Error(`OpenRouter API Error: ${res.status} ${text}`);
  }

  const data = JSON.parse(text);
  return data.choices?.[0]?.message?.content || "";
};
