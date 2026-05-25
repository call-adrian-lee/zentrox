const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ADMIN_IMAGE_UPLOAD_MIMES = {
  'image/jpeg': true,
  'image/jpg': true,
  'image/png': true,
  'image/webp': true,
  'image/gif': true
};

const ADMIN_IMAGE_UPLOAD_EXTS = {
  '.jpg': true,
  '.jpeg': true,
  '.png': true,
  '.webp': true,
  '.gif': true
};

function isAllowedAdminImageUpload(file) {
  const mime = String(file?.mimetype || '').toLowerCase().trim();
  const ext = path.extname(String(file?.originalname || '')).toLowerCase();
  if (ADMIN_IMAGE_UPLOAD_MIMES[mime]) return true;
  if (!mime || mime === 'application/octet-stream') {
    return !!ADMIN_IMAGE_UPLOAD_EXTS[ext];
  }
  return false;
}

const PORTFOLIO_IMAGE_MAX_WIDTH = 1200;
const PORTFOLIO_IMAGE_MAX_HEIGHT = 800;

function portfolioImageUploadDir() {
  if (process.env.PORTFOLIO_UPLOAD_DIR) {
    return path.resolve(process.env.PORTFOLIO_UPLOAD_DIR);
  }
  return path.join(__dirname, '..', '..', 'front', 'img', 'portfolio');
}

function ensurePortfolioImageUploadDir() {
  const dir = portfolioImageUploadDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const portfolioImageMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (isAllowedAdminImageUpload(file)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  }
});

module.exports = {
  PORTFOLIO_IMAGE_MAX_WIDTH,
  PORTFOLIO_IMAGE_MAX_HEIGHT,
  portfolioImageUploadDir,
  ensurePortfolioImageUploadDir,
  portfolioImageMemoryUpload
};
