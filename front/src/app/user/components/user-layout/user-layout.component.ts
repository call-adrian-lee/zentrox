import { Component, DestroyRef, HostListener, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackToTopComponent } from '@user/components/back-to-top/back-to-top.component';
import { FooterSectionComponent } from '@user/components/footer-section/footer-section.component';
import { HeaderComponent } from '@user/components/header/header.component';
import { NavigationService } from '@user/services/navigation.service';
import { TextPipe } from '@shared/pipes/text.pipe';

/** Public site chrome: header, page outlet, footer, back-to-top. */
@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, TextPipe, HeaderComponent, FooterSectionComponent, BackToTopComponent],
  templateUrl: './user-layout.component.html',
})
export class UserLayoutComponent {
  private readonly navigation = inject(NavigationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.navigation.syncScrollStateAfterRender());
    this.destroyRef.onDestroy(() => this.navigation.closeMobileNav());
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navigation.onWindowScroll();
  }
}
