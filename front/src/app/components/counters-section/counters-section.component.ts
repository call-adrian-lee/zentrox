import { DOCUMENT } from '@angular/common';
import { TextPipe } from '../../text/text.pipe';
import { AfterViewInit, Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-counters-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './counters-section.component.html'
})
export class CountersSectionComponent implements AfterViewInit {
  private readonly doc = inject(DOCUMENT);

  readonly countYears = signal(0);
  readonly countProjects = signal(0);
  readonly countClients = signal(0);
  readonly countMilestones = signal(0);

  private countersDone = false;

  ngAfterViewInit(): void {
    const host = this.doc.getElementById('counters');
    if (!host) {
      return;
    }
    const start = () => {
      if (this.countersDone) {
        return;
      }
      this.countersDone = true;
      this.animateCounters();
    };
    if (typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(host);
  }

  private animateCounters(): void {
    const targets = { y: 8, p: 150, c: 80, m: 10 };
    const duration = 1000;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      this.countYears.set(Math.round(targets.y * ease));
      this.countProjects.set(Math.round(targets.p * ease));
      this.countClients.set(Math.round(targets.c * ease));
      this.countMilestones.set(Math.round(targets.m * ease));
      if (p < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
