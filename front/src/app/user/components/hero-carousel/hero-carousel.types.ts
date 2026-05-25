import type { HomeSectionKey } from '@core/site-nav';

export type HeroHomeNavKey = HomeSectionKey;

type HeroSlideBase = {
  image: string;
  altKey: string;
  titleKey: string;
  textKey: string;
  ctaKey: string;
};

export type HeroSlide = HeroSlideBase & { route: string };
