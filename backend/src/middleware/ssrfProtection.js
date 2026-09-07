const net = require('net');
const { URL } = require('url');

/**
 * Extract clean domain name (keeping subdomains like learn.sickykumar.in vs pathkhojo.sickykumar.in distinct)
 * Only strips leading www. and protocol/ports.
 */
function getCleanDomain(hostname) {
  if (!hostname) return '';
  return hostname
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];
}

/**
 * Checks if a hostname or IP address resolves to a private/internal network.
 * Prevents Server-Side Request Forgery (SSRF) targeting internal services.
 */
function isPrivateIp(ip) {
  if (!net.isIP(ip)) return false;

  // IPv4 Private Ranges
  // 127.0.0.0/8 (Loopback)
  if (ip.startsWith('127.')) return true;
  // 10.0.0.0/8
  if (ip.startsWith('10.')) return true;
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // 192.168.0.0/16
  if (ip.startsWith('192.168.')) return true;
  // 169.254.169.254 (Cloud metadata)
  if (ip.startsWith('169.254.')) return true;
  // 0.0.0.0
  if (ip === '0.0.0.0') return true;

  // IPv6 Loopback / Local
  if (ip === '::1' || ip === 'fe80::' || ip.startsWith('fd')) return true;

  return false;
}

function validateUrlSafety(urlStr) {
  try {
    const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const hostname = parsed.hostname.toLowerCase();

    // Protocol check
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { safe: false, reason: 'Invalid protocol (only HTTP/HTTPS allowed)' };
    }

    // Hostname checks
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      isPrivateIp(hostname)
    ) {
      return { safe: false, reason: 'Access to local or private networks is restricted (SSRF Protection)' };
    }

    const cleanDomain = getCleanDomain(hostname);
    return { safe: true, url: parsed.toString(), domain: cleanDomain, rawHostname: hostname };
  } catch (err) {
    return { safe: false, reason: 'Malformed URL or domain' };
  }
}

module.exports = { isPrivateIp, validateUrlSafety, getCleanDomain, getRootDomain: getCleanDomain };
