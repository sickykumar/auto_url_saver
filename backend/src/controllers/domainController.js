const Domain = require('../models/Domain');
const { fetchMetadata, generateAINotes } = require('../services/metadataService');
const { validateUrlSafety, getCleanDomain } = require('../middleware/ssrfProtection');
const { isMongoConnected, getFallbackStore, saveFallbackFile } = require('../config/db');

// Track ongoing metadata fetch promises to prevent race conditions
const inFlightRequests = new Map();

// Generate unique string ID for fallback items
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Clean & normalize domain name (keeps subdomains like learn.sickykumar.in vs pathkhojo.sickykumar.in separate)
 */
function normalizeDomain(rawDomain) {
  if (!rawDomain) return '';
  return getCleanDomain(rawDomain);
}

/**
 * Categorize domain into tags (Dev, AI, Tools, Learning, etc.) based on domain keywords
 */
function autoCategorizeTags(domain, title, description) {
  const text = `${domain} ${title} ${description}`.toLowerCase();
  const tags = new Set();

  if (text.includes('github') || text.includes('code') || text.includes('dev') || text.includes('react') || text.includes('script') || text.includes('api')) {
    tags.add('Dev');
  }
  if (text.includes('ai') || text.includes('gpt') || text.includes('llm') || text.includes('openai') || text.includes('anthropic') || text.includes('gemini') || text.includes('claude')) {
    tags.add('AI');
  }
  if (text.includes('tool') || text.includes('util') || text.includes('convert') || text.includes('app') || text.includes('generate') || text.includes('youtube') || text.includes('render') || text.includes('video')) {
    tags.add('Tools');
  }
  if (text.includes('learn') || text.includes('doc') || text.includes('guide') || text.includes('tutorial') || text.includes('edu') || text.includes('course') || text.includes('job') || text.includes('khojo')) {
    tags.add('Learning');
  }

  if (tags.size === 0) tags.add('Dev');
  return Array.from(tags);
}

/**
 * Helper to scan and auto-fill missing AI notes for domains without notes
 * Uses Gemini AI primary -> Groq AI automatic fallback
 */
async function processMissingNotes() {
  let updatedCount = 0;

  try {
    if (isMongoConnected()) {
      const emptyDomains = await Domain.find({
        $or: [
          { notes: '' },
          { notes: null },
          { notes: { $exists: false } },
          { notes: /^\s*$/ },
          { notes: 'No notes added...' },
        ],
      }).limit(5);

      for (const domainItem of emptyDomains) {
        const note = await generateAINotes(domainItem.domain, domainItem.title, domainItem.description);
        if (note) {
          domainItem.notes = note;
          await domainItem.save();
          updatedCount++;
        }
      }
    } else {
      const store = getFallbackStore();
      const emptyDomains = store
        .filter((item) => !item.notes || item.notes.trim() === '' || item.notes === 'No notes added...')
        .slice(0, 5);

      for (const domainItem of emptyDomains) {
        const note = await generateAINotes(domainItem.domain, domainItem.title, domainItem.description);
        if (note) {
          domainItem.notes = note;
          updatedCount++;
        }
      }
      if (updatedCount > 0) saveFallbackFile();
    }
  } catch (err) {
    console.warn(`[AIWorker] Note generation check error: ${err.message}`);
  }

  return updatedCount;
}

/**
 * POST /api/domains/generate-ai-notes
 * Scans saved domains missing notes and fills them using Gemini / Groq AI
 */
exports.generateAiNotesForEmptyDomains = async (req, res) => {
  try {
    const updatedCount = await processMissingNotes();

    return res.json({
      success: true,
      message: updatedCount > 0 ? `AI generated notes for ${updatedCount} domain(s)` : 'All saved domains already have notes.',
      updatedCount,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Background AI Notes Worker (runs every 60s to retroactively fill missing notes)
 */
setInterval(() => {
  processMissingNotes();
}, 60000);

/**
 * POST /api/domains/check
 * Quick check if a domain is already saved
 */
exports.checkDomain = async (req, res) => {
  try {
    const { domain, userId = 'default_user' } = req.body;
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain is required' });
    }

    const cleanDomain = normalizeDomain(domain);

    if (isMongoConnected()) {
      const existing = await Domain.findOne({ userId, domain: cleanDomain });
      return res.json({
        success: true,
        alreadySaved: !!existing,
        data: existing || null,
      });
    } else {
      const store = getFallbackStore();
      const existing = store.find((item) => item.userId === userId && normalizeDomain(item.domain) === cleanDomain);
      return res.json({
        success: true,
        alreadySaved: !!existing,
        data: existing || null,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/domains
 * Save new domain automatically or manually (One card per domain/subdomain e.g. pathkhojo.sickykumar.in)
 * Saves page paths (e.g. pathkhojo.sickykumar.in/jobs) into visitedUrls array!
 */
exports.saveDomain = async (req, res) => {
  try {
    const { url, domain, fullUrl, userId = 'default_user' } = req.body;
    const rawTarget = fullUrl || url || domain;

    if (!rawTarget) {
      return res.status(400).json({ success: false, message: 'URL or Domain is required' });
    }

    const validation = validateUrlSafety(rawTarget);
    if (!validation.safe) {
      return res.status(400).json({ success: false, message: validation.reason });
    }

    const cleanDomain = normalizeDomain(validation.domain);
    const exactUrl = fullUrl || url || validation.url;

    const lockKey = `${userId}:${cleanDomain}`;

    // If another request for this exact domain is currently fetching metadata, wait for it
    if (inFlightRequests.has(lockKey)) {
      await inFlightRequests.get(lockKey);
    }

    // Step 1: Immediate Check before doing expensive network fetch
    if (isMongoConnected()) {
      let existing = await Domain.findOne({ userId, domain: cleanDomain });
      if (existing) {
        existing.visitedUrls = existing.visitedUrls || [];
        if (exactUrl && !existing.visitedUrls.includes(exactUrl)) {
          existing.visitedUrls.push(exactUrl);
          await existing.save();
        }
        return res.json({
          success: true,
          message: 'Domain already saved. Updated visited list.',
          alreadySaved: true,
          data: existing,
        });
      }
    } else {
      const store = getFallbackStore();
      let existing = store.find((item) => item.userId === userId && normalizeDomain(item.domain) === cleanDomain);
      if (existing) {
        existing.visitedUrls = existing.visitedUrls || [];
        if (exactUrl && !existing.visitedUrls.includes(exactUrl)) {
          existing.visitedUrls.push(exactUrl);
          saveFallbackFile();
        }
        return res.json({
          success: true,
          message: 'Domain already saved in memory. Updated visited list.',
          alreadySaved: true,
          data: existing,
        });
      }
    }

    // Lock domain during async metadata fetch
    let fetchPromiseResolver;
    const fetchPromise = new Promise((resolve) => {
      fetchPromiseResolver = resolve;
    });
    inFlightRequests.set(lockKey, fetchPromise);

    try {
      // Fetch Metadata
      const meta = await fetchMetadata(cleanDomain, exactUrl);
      const tags = autoCategorizeTags(cleanDomain, meta.title, meta.description);

      if (isMongoConnected()) {
        let existing = await Domain.findOne({ userId, domain: cleanDomain });
        if (existing) {
          existing.visitedUrls = existing.visitedUrls || [];
          if (exactUrl && !existing.visitedUrls.includes(exactUrl)) {
            existing.visitedUrls.push(exactUrl);
            await existing.save();
          }
          return res.json({
            success: true,
            message: 'Domain already saved.',
            alreadySaved: true,
            data: existing,
          });
        }

        const newDomain = await Domain.create({
          userId,
          domain: cleanDomain,
          title: meta.title,
          description: meta.description,
          favicon: meta.favicon,
          image: meta.image,
          notes: meta.aiNotes || '',
          tags,
          visitedUrls: exactUrl ? [exactUrl] : [],
        });

        return res.status(201).json({
          success: true,
          message: 'Domain saved successfully',
          alreadySaved: false,
          data: newDomain,
        });
      } else {
        const store = getFallbackStore();
        let existing = store.find((item) => item.userId === userId && normalizeDomain(item.domain) === cleanDomain);
        if (existing) {
          existing.visitedUrls = existing.visitedUrls || [];
          if (exactUrl && !existing.visitedUrls.includes(exactUrl)) {
            existing.visitedUrls.push(exactUrl);
            saveFallbackFile();
          }
          return res.json({
            success: true,
            message: 'Domain already saved in local memory.',
            alreadySaved: true,
            data: existing,
          });
        }

        const newDomain = {
          _id: generateId(),
          userId,
          domain: cleanDomain,
          title: meta.title,
          description: meta.description,
          favicon: meta.favicon,
          image: meta.image,
          notes: meta.aiNotes || '',
          tags,
          visitedUrls: exactUrl ? [exactUrl] : [],
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.unshift(newDomain);
        saveFallbackFile();
        return res.status(201).json({
          success: true,
          message: 'Domain saved successfully in local memory',
          alreadySaved: false,
          data: newDomain,
        });
      }
    } finally {
      fetchPromiseResolver();
      inFlightRequests.delete(lockKey);
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/domains
 * Fetch saved domains with search, tag filter, favorites
 */
exports.getDomains = async (req, res) => {
  try {
    const { userId = 'default_user', search, tag, favorite } = req.query;

    if (isMongoConnected()) {
      const query = { userId };

      if (tag && tag !== 'All') {
        query.tags = tag;
      }
      if (favorite === 'true') {
        query.isFavorite = true;
      }
      if (search) {
        query.$or = [
          { domain: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
        ];
      }

      const domains = await Domain.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: domains.length, data: domains });
    } else {
      let store = getFallbackStore();

      // Clean up deduplication keeping distinct subdomains intact
      const domainMap = new Map();
      for (const item of store) {
        const d = normalizeDomain(item.domain);
        if (!domainMap.has(d)) {
          domainMap.set(d, {
            ...item,
            domain: d,
            visitedUrls: Array.from(new Set(item.visitedUrls || [])),
          });
        } else {
          const existing = domainMap.get(d);
          const mergedUrls = new Set([...(existing.visitedUrls || []), ...(item.visitedUrls || [])]);
          existing.visitedUrls = Array.from(mergedUrls);
        }
      }

      store.length = 0;
      store.push(...Array.from(domainMap.values()));
      saveFallbackFile();

      let filtered = store.filter((item) => item.userId === userId);

      if (tag && tag !== 'All') {
        filtered = filtered.filter((item) => item.tags && item.tags.includes(tag));
      }
      if (favorite === 'true') {
        filtered = filtered.filter((item) => item.isFavorite);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.domain.toLowerCase().includes(s) ||
            (item.title && item.title.toLowerCase().includes(s)) ||
            (item.description && item.description.toLowerCase().includes(s)) ||
            (item.notes && item.notes.toLowerCase().includes(s))
        );
      }

      return res.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/domains/:id
 * Update notes, tags, favorite toggle
 */
exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, tags, isFavorite } = req.body;

    if (isMongoConnected()) {
      const domain = await Domain.findById(id);
      if (!domain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (notes !== undefined) domain.notes = notes;
      if (tags !== undefined) domain.tags = tags;
      if (isFavorite !== undefined) domain.isFavorite = isFavorite;

      await domain.save();
      return res.json({ success: true, message: 'Domain updated', data: domain });
    } else {
      const store = getFallbackStore();
      const domain = store.find((item) => item._id === id);
      if (!domain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (notes !== undefined) domain.notes = notes;
      if (tags !== undefined) domain.tags = tags;
      if (isFavorite !== undefined) domain.isFavorite = isFavorite;
      domain.updatedAt = new Date().toISOString();
      saveFallbackFile();

      return res.json({ success: true, message: 'Domain updated', data: domain });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/domains/:id/visited-url
 * Remove a specific visited URL link from a domain
 */
exports.deleteVisitedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUrl } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'targetUrl is required' });
    }

    if (isMongoConnected()) {
      const domain = await Domain.findById(id);
      if (!domain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      domain.visitedUrls = domain.visitedUrls.filter((u) => u !== targetUrl);
      await domain.save();
      return res.json({ success: true, message: 'Visited URL removed', data: domain });
    } else {
      const store = getFallbackStore();
      const domain = store.find((item) => item._id === id);
      if (!domain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      domain.visitedUrls = (domain.visitedUrls || []).filter((u) => u !== targetUrl);
      saveFallbackFile();
      return res.json({ success: true, message: 'Visited URL removed', data: domain });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/domains/:id
 * Delete saved domain entry
 */
exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Domain.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Domain deleted successfully' });
    } else {
      const store = getFallbackStore();
      const index = store.findIndex((item) => item._id === id);
      if (index !== -1) {
        store.splice(index, 1);
        saveFallbackFile();
      }
      return res.json({ success: true, message: 'Domain deleted successfully' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
