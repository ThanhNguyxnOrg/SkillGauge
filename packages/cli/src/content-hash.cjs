const { createHash } = require('node:crypto');

/** @param {string} content */
function getNormalizedHash(content) {
  // Collect text outside complete comments. An unclosed opener is literal text.
  const text = [];
  let start = 0;
  for (;;) {
    const open = content.indexOf('<!--', start);
    if (open === -1) break;
    const close = content.indexOf('-->', open + 4);
    if (close === -1) break;
    text.push(content.slice(start, open));
    start = close + 3;
  }
  text.push(content.slice(start));
  const normalized = text.join('').replace(/\s+/g, '').toLowerCase();
  return createHash('sha256').update(normalized).digest('hex');
}

module.exports = { getNormalizedHash };
