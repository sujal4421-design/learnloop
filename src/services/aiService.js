// src/services/aiService.js
// Talks to Groq's API to generate a one-line summary of a learning log.
// Deliberately isolated — knows nothing about logs, users, or the database.
// Its only job: given some text, return a short summary (or null on failure).

const Groq = require('groq-sdk');

let groqClient = null;

function getClient() {
  // Created lazily, and only if a key is actually configured — this way
  // the app doesn't crash on startup if GROQ_API_KEY is blank in .env.
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const AIService = {
  async generateSummary(title, description) {
    const client = getClient();
    if (!client) {
      console.warn('GROQ_API_KEY not set — skipping AI summary.');
      return null;
    }

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // fast + cheap, ideal for a short one-line task
        messages: [
          {
            role: 'system',
            content: 'You summarize a student\'s learning log entry in ONE short sentence (under 20 words). Be concrete and specific, not generic. Respond with ONLY the summary sentence — no preamble, no quotes.'
          },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description}`
          }
        ],
        temperature: 0.5,
        max_tokens: 60
      });

      const summary = response.choices[0]?.message?.content?.trim();
      return summary || null;
    } catch (err) {
      // Never let an AI failure break log creation — log it and move on.
      console.error('Groq AI summary failed:', err.message);
      return null;
    }
  }
};

module.exports = AIService;
