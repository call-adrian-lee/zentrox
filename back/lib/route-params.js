/** Parse positive integer route/query params; returns null when invalid. */
function parsePositiveInt(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

module.exports = { parsePositiveInt };
