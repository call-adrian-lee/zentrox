/** Canonical static image paths under `/img/` — keep in sync with `front/img/` assets. */
export const SITE_IMAGES = {
  logo: '/img/logo.svg',
  favicon: '/img/favicon.svg',
  heroSlides: ['/img/slider-0.svg', '/img/slider-1.svg', '/img/slider-2.svg'] as const,
  testimonialAvatars: ['/img/client-0.svg', '/img/client-1.svg', '/img/client-2.svg'] as const,
  leadershipPlaceholder: '/img/leadership/placeholder-avatar.svg',
  portfolioPlaceholder: '/img/portfolio/placeholder.svg'
} as const;

export function leadershipPhotoPath(id: number): string {
  return `/img/leadership/leadership-${id}.png`;
}

export function portfolioImagePath(id: number): string {
  return `/img/portfolio/portfolio-${id}.png`;
}

/** Map API `photo_path` to a browser-ready leadership image URL. */
export function leadershipPhotoUrl(member: { id: number; photo_path?: string | null }): string {
  const raw = (member.photo_path || '').trim();
  if (!raw) return leadershipPhotoPath(member.id);
  if (raw.startsWith('/')) return raw;
  if (raw.includes('/')) return raw.startsWith('/') ? raw : `/${raw}`;
  if (/^leadership-\d+$/i.test(raw)) return `/img/leadership/${raw}.png`;
  if (/\.(png|jpe?g|webp|gif)$/i.test(raw)) return `/img/${raw}`;
  return `/img/${raw}.png`;
}
