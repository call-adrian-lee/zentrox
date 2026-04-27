import { Pipe, PipeTransform, inject } from '@angular/core';
import { TextService } from './text.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TextPipe implements PipeTransform {
  private readonly text = inject(TextService);

  transform(key: string): string {
    this.text.lang();
    return this.text.t(key);
  }
}
