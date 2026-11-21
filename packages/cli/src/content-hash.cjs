const { createHash } = require('node:crypto');

/** @param {string} content */
function getNormalizedHash(content) {
  const normalized = content.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, '').toLowerCase();
  return createHash('sha256').update(normalized).digest('hex');
}

module.exports = { getNormalizedHash };
