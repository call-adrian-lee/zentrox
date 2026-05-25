/** Structured stderr logging for production (no console.log in request handlers). */

function formatMeta(meta) {
  if (!meta) return '';
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ' [meta-unserializable]';
  }
}

function error(message, err, meta) {
  const detail = err instanceof Error ? err.stack || err.message : err != null ? String(err) : '';
  process.stderr.write(`[error] ${message}${formatMeta(meta)}${detail ? ` ${detail}` : ''}\n`);
}

function warn(message, meta) {
  process.stderr.write(`[warn] ${message}${formatMeta(meta)}\n`);
}

function info(message, meta) {
  process.stdout.write(`[info] ${message}${formatMeta(meta)}\n`);
}

module.exports = { error, warn, info };
