import { Component } from '@angular/core';
import { COMPANY } from '../../core/company-info';

@Component({
  selector: 'app-us-founder-ceo',
  standalone: true,
  templateUrl: './us-founder-ceo.component.html',
  styleUrl: './us-founder-ceo.component.css'
})
export class UsFounderCeoComponent {
  readonly c = COMPANY;
}
