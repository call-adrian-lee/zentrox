type HeroSlideBase = {
  image: string;
  altKey: string;
  titleKey: string;
  textKey: string;
  ctaKey: string;
};

export type HeroSlide = HeroSlideBase & { route: string };
