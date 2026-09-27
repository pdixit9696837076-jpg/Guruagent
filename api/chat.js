const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite'
];

function cleanMessages(messages) {
  return messages
    .filter(m => m && ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 16000) }));
}

function getOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  const output = Array.isArray(data?.output)
    ? data.output
    : Array.isArray(data?.steps)
      ? data.steps
      : [];
  return output
    .filter(item => item.type === 'text' || item.type === 'model_output')
    .flatMap(item => item.content || [item])
    .filter(item => item.type === 'text' && typeof item.text === 'string')
    .map(item => item.text)
    .join('')
    .trim();
}

function shouldFallback(status, message) {
  return [400, 403, 429, 500, 502, 503, 504].includes(status) ||
    /rate.?limit|quota|daily.*limit|high demand|overload|temporarily|unavailable|try again|not available|unknown model/i.test(message);
}

function isQuotaError(message) {
  return /rate.?limit|quota|daily.*limit|free tier/i.test(message);
}

async function generateReply(apiKey, requestBody) {
  const errors = [];
  for (const model of [...new Set([MODEL, ...FALLBACK_MODELS])]) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ ...requestBody, model })
      });
      const raw = await response.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}
      if (!response.ok) {
        const message = data?.error?.message || `Gemini returned HTTP ${response.status}`;
        errors.push(message);
        console.error(`Gemini model ${model} failed:`, message);
        if (shouldFallback(response.status, message)) continue;
        return { error: message };
      }
      const reply = getOutputText(data);
      if (reply) return { reply };
      errors.push('Gemini returned an empty response');
    } catch (error) {
      const message = error.message || 'Gemini request failed';
      errors.push(message);
      console.error(`Gemini model ${model} request failed:`, message);
    }
  }
  if (errors.length && errors.every(isQuotaError)) {
    return { error: 'Gemini free-tier quota is exhausted for the available models. Try again after the quota resets or check your Google AI Studio rate limits.' };
  }
  return { error: `Gemini is temporarily unavailable across its fallback models. ${errors.at(-1) || 'No response received.'}` };
}

async function handler(req, res) {
  const origin = req.headers?.origin;
  if (origin === 'null' || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, configured: Boolean(process.env.GEMINI_API_KEY), model: MODEL, fallbackModels: FALLBACK_MODELS });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI service is not configured: GEMINI_API_KEY is missing' });
  const body = req.body || {};
  const messages = cleanMessages(Array.isArray(body.messages) ? body.messages : []);
  if (!messages.length) return res.status(400).json({ error: 'Messages are required' });

  try {
    const systemMessage = messages.find(message => message.role === 'system');
    const input = messages
      .filter(message => message.role !== 'system')
      .map(message => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
      .join('\n\n');
    const requestBody = { input, store: false };
    if (systemMessage) requestBody.system_instruction = systemMessage.content;
    const result = await generateReply(apiKey, requestBody);
    if (result.error) return res.status(502).json({ error: result.error });
    return res.status(200).json({ reply: result.reply });
  } catch (error) {
    console.error('Gemini request failed:', error);
    return res.status(502).json({ error: 'AI provider request failed. Check GEMINI_API_KEY, GEMINI_MODEL and deployment settings.' });
  }
}

module.exports = handler;