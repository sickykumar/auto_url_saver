const test = require('node:test');
const assert = require('node:assert');
const { validateUrlSafety, isPrivateIp } = require('../src/middleware/ssrfProtection');
const domainController = require('../src/controllers/domainController');

test('SSRF Protection - Blocks private and local IP addresses', () => {
  assert.strictEqual(isPrivateIp('127.0.0.1'), true);
  assert.strictEqual(isPrivateIp('10.0.0.1'), true);
  assert.strictEqual(isPrivateIp('192.168.1.1'), true);
  assert.strictEqual(isPrivateIp('169.254.169.254'), true);
  assert.strictEqual(isPrivateIp('8.8.8.8'), false);
});

test('SSRF Protection - Blocks local URLs', () => {
  const localhostCheck = validateUrlSafety('http://localhost:5000');
  assert.strictEqual(localhostCheck.safe, false);

  const internalIpCheck = validateUrlSafety('http://169.254.169.254/latest/meta-data');
  assert.strictEqual(internalIpCheck.safe, false);

  const validCheck = validateUrlSafety('https://github.com/facebook/react');
  assert.strictEqual(validCheck.safe, true);
  assert.strictEqual(validCheck.domain, 'github.com');
});
