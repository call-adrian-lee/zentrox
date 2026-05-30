import { TestBed } from '@angular/core/testing';
import { FaIconComponent, type FaIconName } from './fa-icon.component';

const ICON_NAMES: FaIconName[] = [
  'bars',
  'bullseye',
  'calendar',
  'check',
  'check-circle',
  'chevron-up',
  'clock-o',
  'code',
  'cogs',
  'cubes',
  'database',
  'desktop',
  'ellipsis-v',
  'external-link',
  'eye',
  'gamepad',
  'globe',
  'handshake-o',
  'history',
  'link',
  'list-alt',
  'paper-plane',
  'comments',
  'rocket',
  'server',
  'sitemap',
  'times',
  'users'
];

describe('FaIconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaIconComponent]
    }).compileComponents();
  });

  it('renders an svg path for every icon name', () => {
    for (const name of ICON_NAMES) {
      const fixture = TestBed.createComponent(FaIconComponent);
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      const paths = fixture.nativeElement.querySelectorAll('path');
      expect(paths.length, `icon "${name}" should render at least one path`).toBeGreaterThan(0);
    }
  });
});
