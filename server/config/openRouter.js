import dotenv from "dotenv";

dotenv.config();

const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const openRouterKey = process.env.OPENROUTER_API_KEY;

export const generateResponse = async (prompt) => {
  if (!openRouterKey) {
    throw new Error("OPENROUTER_API_KEY is missing");
  }

  const response = await fetch(openRouterUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey}`,
      "HTTP-Referer": process.env.FRONTEND_URL || "https://genai-project-1-r3mq.onrender.com",
      "X-Title": "GenWeb AI",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Return only valid raw JSON. No markdown. No extra text.",
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

  const text = await response.text();

  if (!response.ok) {
    console.error("OpenRouter error:", text);
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);

  return data.choices?.[0]?.message?.content || "";
};
