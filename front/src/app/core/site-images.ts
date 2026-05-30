/** Canonical static image paths under `/img/` — keep in sync with `front/img/` assets. */
export const SITE_IMAGES = {
  logo: '/img/logo.svg',
  favicon: '/img/favicon.svg',
  heroSlides: ['/img/slider-0.jpg', '/img/slider-1.jpg', '/img/slider-2.jpg'] as const,
  heroSlideFallbacks: ['/img/slider-0.svg', '/img/slider-1.svg', '/img/slider-2.svg'] as const,
  testimonialAvatars: ['/img/client-0.jpg', '/img/client-1.jpg', '/img/client-2.jpg'] as const,
  testimonialAvatarFallbacks: ['/img/client-0.svg', '/img/client-1.svg', '/img/client-2.svg'] as const,
  leadershipPlaceholder: '/img/leadership/placeholder-avatar.svg',
  portfolioPlaceholder: '/img/portfolio/placeholder.svg'
} as const;

export function leadershipPhotoPath(id: number): string {
  return `/img/leadership/leadership-${id}.png`;
}

export function portfolioImagePath(id: number): string {
  return `/img/portfolio/portfolio-${id}.png`;
}

function normalizePublicAssetPath(raw: string): string {
  if (raw.startsWith('/')) return raw;
  if (raw.includes('/')) return `/${raw.replace(/^\/+/, '')}`;
  return `/img/${raw}`;
}

/** Map API `photo_path` to a browser-ready leadership image URL. */
export function leadershipPhotoUrl(member: { id: number; photo_path?: string | null }): string {
  const raw = (member.photo_path || '').trim();
  if (!raw) return leadershipPhotoPath(member.id);
  if (raw.startsWith('/')) return raw;
  if (/^leadership-\d+$/i.test(raw)) return `/img/leadership/${raw}.png`;
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return normalizePublicAssetPath(raw);
  return leadershipPhotoPath(member.id);
}

/** Map API `image_path` to a browser-ready portfolio cover URL. */
export function portfolioImageUrl(item: { id: number; image_path?: string | null }): string {
  const raw = (item.image_path || '').trim();
  if (!raw) return portfolioImagePath(item.id);
  if (raw.startsWith('/')) return raw;
  if (/^portfolio-\d+$/i.test(raw)) return `/img/portfolio/${raw}.png`;
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return normalizePublicAssetPath(raw);
  return portfolioImagePath(item.id);
}

export function heroSlideFallbackUrl(index: 0 | 1 | 2): string {
  return SITE_IMAGES.heroSlideFallbacks[index];
}

export function testimonialAvatarFallbackUrl(index: 0 | 1 | 2): string {
  return SITE_IMAGES.testimonialAvatarFallbacks[index];
}

/** MIME type for Open Graph / Twitter image meta tags. */
export function publicImageMimeType(publicPath: string): string {
  if (/\.svg$/i.test(publicPath)) return 'image/svg+xml';
  if (/\.png$/i.test(publicPath)) return 'image/png';
  if (/\.webp$/i.test(publicPath)) return 'image/webp';
  return 'image/jpeg';
}
