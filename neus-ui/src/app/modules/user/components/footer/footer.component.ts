import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Input() showDrawer:boolean = false;
  email:string = 'info-alemtech@gmail.com';
  phoneNumber:string = '+251-910200910';
  address:string = 'Bahir Dar, Ethiopia';
}
