import dotenv from "dotenv";

dotenv.config();

const openRouterUrl = process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";
const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;
const openAIKey = process.env.OPENAI_API_KEY;

if (!openRouterKey && !openAIKey) {
  throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY is not defined in environment variables");
}

export const generateResponse = async (prompt) => {
  const headers = {
    "Content-Type": "application/json",
  };

  let requestUrl;
  let body;

  if (openAIKey && !openRouterKey) {
    requestUrl = "https://api.openai.com/v1/chat/completions";
    headers.Authorization = `Bearer ${openAIKey}`;
    body = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You must return ONLY valid raw JSON" },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    };
  } else {
    requestUrl = openRouterUrl;
    headers.Authorization = `Bearer ${openRouterKey}`;
    body = {
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "You must return ONLY valid raw JSON" },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    };
  }

  const res = await fetch(requestUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data);
};
