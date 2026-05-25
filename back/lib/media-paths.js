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
  const primary = leadershipExpectedPublicPhotoPath(member.id);
  const legacyFlat = `/img/leadership-${member.id}.png`;
  for (const url of [primary, legacyFlat]) {
    const fsPath = publicPathToFsPath(url);
    if (fsPath && fs.existsSync(fsPath)) {
      return { ...member, photo_path: url };
    }
  }
  return { ...member, photo_path: LEADERSHIP_PLACEHOLDER };
}

function resolvePortfolioImageForResponse(item) {
  const primary = portfolioExpectedPublicImagePath(item.id);
  const legacyFlat = `/img/portfolio-${item.id}.png`;
  for (const url of [primary, legacyFlat]) {
    const fsPath = publicPathToFsPath(url);
    if (fsPath && fs.existsSync(fsPath)) {
      return { ...item, image_path: url };
    }
  }
  return { ...item, image_path: PORTFOLIO_PLACEHOLDER };
}

async function syncLeadershipPhotoPaths(pool) {
  await pool.query("UPDATE leadership_members SET photo_path = CONCAT('leadership-', id)");
}

async function syncPortfolioImagePaths(pool) {
  await pool.query("UPDATE portfolio_items SET image_path = CONCAT('portfolio-', id)");
}

module.exports = {
  LEADERSHIP_PLACEHOLDER,
  PORTFOLIO_PLACEHOLDER,
  leadershipStaticPhotoPath,
  leadershipExpectedPublicPhotoPath,
  portfolioStaticImagePath,
  portfolioExpectedPublicImagePath,
  resolveLeadershipPhotoForResponse,
  resolvePortfolioImageForResponse,
  syncLeadershipPhotoPaths,
  syncPortfolioImagePaths
};
