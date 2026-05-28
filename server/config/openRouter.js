import dotenv from "dotenv";
dotenv.config();

const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

export const generateResponse = async (prompt) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    throw new Error("OPENROUTER_API_KEY is missing in Render environment");
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
    console.error("OpenRouter Error:", response.status, text);
    throw new Error(`OpenRouter Error ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);
  return data.choices?.[0]?.message?.content || "";
};
