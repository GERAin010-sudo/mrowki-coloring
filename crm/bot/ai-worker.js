// HTTP client to the local AI worker (whisper + ollama) running on the Mac Mini.
// Uses native fetch (Node 18+). No extra deps needed.

function getConfig() {
  return {
    url: (process.env.AI_WORKER_URL || '').replace(/\/$/, ''),
    token: process.env.AI_WORKER_TOKEN || '',
    timeoutMs: Number(process.env.AI_WORKER_TIMEOUT || 180000),
  };
}

function isEnabled() {
  const cfg = getConfig();
  return Boolean(cfg.url && cfg.token);
}

async function authFetch(path, init = {}) {
  const cfg = getConfig();
  if (!cfg.url) throw new Error('AI_WORKER_URL not configured');
  if (!cfg.token) throw new Error('AI_WORKER_TOKEN not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(`${cfg.url}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${cfg.token}`, ...(init.headers || {}) },
      signal: controller.signal,
    });
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
    if (!res.ok) throw new Error(`ai-worker ${res.status}: ${body.error || text.slice(0, 200)}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// Parse text into a structured task.
async function parseText(text, { users = [], projects = [] } = {}) {
  const body = await authFetch('/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, users, projects }),
  });
  return body.task;
}

// Transcribe + parse an audio file. audioBuffer is a Node Buffer.
async function processAudio(audioBuffer, { filename = 'voice.oga', users = [], projects = [] } = {}) {
  const form = new FormData();
  form.append('audio', new Blob([audioBuffer], { type: 'audio/ogg' }), filename);
  form.append('context', JSON.stringify({ users, projects }));
  return authFetch('/process', { method: 'POST', body: form });
}

module.exports = { isEnabled, parseText, processAudio, getConfig };
