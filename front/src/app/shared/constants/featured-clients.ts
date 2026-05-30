/** Featured client names shared by logos, testimonials, and DB seed data. */
export const FEATURED_CLIENT_NAMES = ['HowTube', 'OohYeah', 'Youtopia'] as const;

export type FeaturedClientName = (typeof FEATURED_CLIENT_NAMES)[number];

export const FEATURED_CLIENT_LOGOS: ReadonlyArray<{
  name: FeaturedClientName;
  outcomeKey: 'clients.howtube' | 'clients.oohyeah' | 'clients.youtopia';
}> = [
  { name: 'HowTube', outcomeKey: 'clients.howtube' },
  { name: 'OohYeah', outcomeKey: 'clients.oohyeah' },
  { name: 'Youtopia', outcomeKey: 'clients.youtopia' }
];
