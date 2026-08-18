// src/services/aiService.js
// Talks to Groq's API to generate a one-line summary of a learning log.

const Groq = require('groq-sdk');

let groqClient = null;

function getClient() {
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
        // Groq deprecated llama-3.1-8b-instant and llama-3.3-70b-versatile
        // (retired 2026). openai/gpt-oss-20b is Groq's current recommended
        // fast, low-cost general-purpose model — a direct replacement for
        // this kind of short, simple generation task.
        model: 'openai/gpt-oss-20b',
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
      console.error('Groq AI summary failed:', err.message);
      return null;
    }
  }
};

module.exports = AIService;
