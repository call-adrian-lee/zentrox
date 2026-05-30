const fs = require('fs');
const path = require('path');

const LEADERSHIP_PLACEHOLDER = '/img/leadership/placeholder-avatar.svg';
const PORTFOLIO_PLACEHOLDER = '/img/portfolio/placeholder.svg';

function leadershipStaticPhotoPath(id) {
  return `leadership-${id}`;
}

function leadershipExpectedPublicPhotoPath(id) {
  return `/img/leadership/leadership-${id}.png`;
}

function portfolioStaticImagePath(id) {
  return `portfolio-${id}`;
}

function portfolioExpectedPublicImagePath(id) {
  return `/img/portfolio/portfolio-${id}.png`;
}

function publicPathToFsPath(publicPath) {
  const rel = String(publicPath || '').trim().replace(/^\/+/, '');
  if (!rel) return null;
  return path.join(__dirname, '..', '..', 'front', ...rel.split('/'));
}

function resolveLeadershipPhotoForResponse(member) {
  const nestedPath = leadershipExpectedPublicPhotoPath(member.id);
  const nestedFs = publicPathToFsPath(nestedPath);
  if (nestedFs && fs.existsSync(nestedFs)) {
    return { ...member, photo_path: nestedPath };
  }
  const legacyFlat = `/img/leadership-${member.id}.png`;
  const legacyPath = publicPathToFsPath(legacyFlat);
  if (legacyPath && fs.existsSync(legacyPath)) {
    return { ...member, photo_path: legacyFlat };
  }
  return { ...member, photo_path: LEADERSHIP_PLACEHOLDER };
}

function resolvePortfolioImageForResponse(item) {
  const nestedPath = portfolioExpectedPublicImagePath(item.id);
  const nestedFs = publicPathToFsPath(nestedPath);
  if (nestedFs && fs.existsSync(nestedFs)) {
    return { ...item, image_path: nestedPath };
  }
  const legacyFlat = `/img/portfolio-${item.id}.png`;
  const legacyPath = publicPathToFsPath(legacyFlat);
  if (legacyPath && fs.existsSync(legacyPath)) {
    return { ...item, image_path: legacyFlat };
  }
  return { ...item, image_path: PORTFOLIO_PLACEHOLDER };
}

async function syncLeadershipPhotoPaths(pool) {
  await pool.query(
    "UPDATE leadership_members SET photo_path = CONCAT('leadership-', id) WHERE photo_path IS NULL OR photo_path = ''"
  );
}

async function syncPortfolioImagePaths(pool) {
  await pool.query(
    "UPDATE portfolio_items SET image_path = CONCAT('portfolio-', id) WHERE image_path IS NULL OR image_path = ''"
  );
}

module.exports = {
  leadershipStaticPhotoPath,
  leadershipExpectedPublicPhotoPath,
  portfolioStaticImagePath,
  portfolioExpectedPublicImagePath,
  resolveLeadershipPhotoForResponse,
  resolvePortfolioImageForResponse,
  syncLeadershipPhotoPaths,
  syncPortfolioImagePaths
};
