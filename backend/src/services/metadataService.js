const axios = require('axios');
const cheerio = require('cheerio');
const { validateUrlSafety } = require('../middleware/ssrfProtection');

// Circuit breaker: Pause Gemini API calls when free tier quota limit is hit
let geminiQuotaCooldownUntil = 0;

/**
 * Auto-generate AI notes using Groq AI API as fallback
 * Models verified for this Groq API Key: groq/compound-mini, groq/compound, qwen/qwen3.6-27b, allam-2-7b
 */
async function generateGroqNotes(domainName, title, description) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
    console.warn(`[GroqAI] Skipped: GROQ_API_KEY is missing in backend/.env`);
    return '';
  }

  const models = ['groq/compound-mini', 'groq/compound', 'qwen/qwen3.6-27b', 'allam-2-7b'];
  const prompt = `Provide a concise 1-sentence summary note for a website domain named "${domainName}". Title: "${title}". Description: "${description}". Keep it under 15 words. Do not use quotes.`;

  console.log(`⚡ [GroqAI] Generating AI note for ${domainName}...`);

  for (const model of models) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 60,
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${groqApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      const generated = res.data?.choices?.[0]?.message?.content;
      if (generated) {
        const cleanNote = generated.trim().replace(/^"|"$/g, '');
        console.log(`✅ [GroqAI] Note generated for ${domainName} via (${model}): "${cleanNote}"`);
        return cleanNote;
      }
    } catch (err) {
      console.warn(`[GroqAI] Model ${model} failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  return '';
}

/**
 * Auto-generate AI notes using Google Gemini API
 */
async function generateGeminiNotes(domainName, title, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    return '';
  }

  // If rate limit was hit recently, skip Gemini
  if (Date.now() < geminiQuotaCooldownUntil) {
    return '';
  }

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-pro'];
  const prompt = `Provide a concise 1-sentence summary note for a website domain named "${domainName}". Title: "${title}". Description: "${description}". Keep it under 15 words.`;

  for (const model of models) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        { timeout: 6000 }
      );

      const generated = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generated) {
        return generated.trim().replace(/^"|"$/g, '');
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.message || '';

      if (status === 429 || msg.includes('quota') || msg.includes('Quota')) {
        geminiQuotaCooldownUntil = Date.now() + 5 * 60 * 1000; // 5 minute pause
        console.info(`ℹ️ [GeminiAI] Quota reached. Auto-switching to Groq AI...`);
        return '';
      }

      if (status === 404 || err.code === 'ECONNABORTED' || msg.includes('timeout')) {
        continue;
      }
    }
  }

  return '';
}

/**
 * Master AI function: Tries Gemini AI first. If Gemini fails or hits quota limit, automatically switches to Groq AI!
 */
async function generateAINotes(domainName, title, description) {
  // 1. Try Gemini AI first
  let note = await generateGeminiNotes(domainName, title, description);
  if (note) return note;

  // 2. Fallback to Groq AI if Gemini is on quota cooldown or failed
  note = await generateGroqNotes(domainName, title, description);
  return note;
}

/**
 * Fetches website metadata (Title, Description, Favicon, OG Image) safely.
 */
async function fetchMetadata(domainName, fullUrl) {
  const targetUrl = fullUrl || `https://${domainName}`;
  const validation = validateUrlSafety(targetUrl);

  if (!validation.safe) {
    throw new Error(validation.reason);
  }

  // Default fallback values
  let metadata = {
    domain: domainName,
    title: domainName,
    description: `Website domain: ${domainName}`,
    favicon: `https://www.google.com/s2/favicons?domain=${domainName}&sz=128`,
    image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80`,
    aiNotes: '',
  };

  try {
    const response = await axios.get(validation.url, {
      timeout: 5000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 3,
      maxContentLength: 2 * 1024 * 1024, // 2MB max html size
    });

    const $ = cheerio.load(response.data);

    // Extract Title
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text().trim();
    metadata.title = ogTitle || twitterTitle || pageTitle || domainName;

    // Extract Description
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');
    const twitterDesc = $('meta[name="twitter:description"]').attr('content');
    metadata.description = ogDesc || metaDesc || twitterDesc || metadata.description;

    // Extract Image
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (ogImage) {
      metadata.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, validation.url).href;
    } else if (twitterImage) {
      metadata.image = twitterImage.startsWith('http') ? twitterImage : new URL(twitterImage, validation.url).href;
    }

    // Extract Favicon
    const faviconHref =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href');
    if (faviconHref) {
      metadata.favicon = faviconHref.startsWith('http')
        ? faviconHref
        : new URL(faviconHref, validation.url).href;
    }

    // Generate AI notes (Gemini AI primary -> Groq AI automatic fallback)
    metadata.aiNotes = await generateAINotes(domainName, metadata.title, metadata.description);
  } catch (err) {
    // Protected sites fall back cleanly
  }

  return metadata;
}

module.exports = { fetchMetadata, generateGeminiNotes, generateGroqNotes, generateAINotes };
