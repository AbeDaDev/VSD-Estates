import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const CHAT_PROMPT = `You are Victor, an expert real estate AI assistant helping clients find their dream home. You work alongside a real estate agent and your job is to:

1. Understand the client's needs: budget, location preferences, home size (bedrooms/bathrooms), must-haves (garage, yard, pool, etc.), lifestyle (commute, schools, walkability), and timeline.
2. Ask smart, natural follow-up questions one at a time - don't overwhelm with a list of questions.
3. Help narrow down neighborhoods, home styles, and features based on what they share.
4. Provide helpful context about home-buying (mortgage basics, what to look for in a home tour, etc.) when relevant.
5. Summarize the client's preferences clearly so the agent can act on them.
6. Be warm, encouraging, and conversational - not robotic.

Start by warmly greeting the client and asking one opening question to understand what brings them here today.

Keep responses concise and friendly - this is a chat, not an essay. Use short paragraphs. Occasionally use an emoji to keep the tone warm 🏡`;

const SUMMARY_PROMPT = `You are a real estate assistant. Given a conversation, produce a clean structured summary for the agent with: Budget, Location Preferences, Home Requirements, Lifestyle Needs, Timeline, and any Red Flags or Notes. Be concise and use bullet points.`;

function toMessageList(messages = []) {
  return messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? ""),
    }))
    .filter((message) => message.content.trim().length > 0);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(500, { error: "OPENAI_API_KEY is not set." });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const mode = payload.mode === "summary" ? "summary" : "chat";
  const messages = toMessageList(payload.messages);
  const prompt = mode === "summary" ? SUMMARY_PROMPT : CHAT_PROMPT;
  const input = messages.length > 0
    ? messages
    : [{ role: "user", content: "Hello, I'm looking for a home." }];

  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: prompt,
      input,
      max_output_tokens: mode === "summary" ? 600 : 500,
    });

    return json(200, {
      reply: response.output_text || "I'm having trouble connecting. Please try again.",
    });
  } catch (error) {
    console.error("OpenAI chat function error:", error);
    return json(500, {
      error: "Unable to contact OpenAI.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
