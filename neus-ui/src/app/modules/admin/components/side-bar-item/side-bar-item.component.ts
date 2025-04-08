import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-bar-item',
  imports: [CommonModule],
  templateUrl: './side-bar-item.component.html',
  styleUrl: './side-bar-item.component.css'
})
export class SideBarItemComponent {
  @Input() component:string | undefined;
  @Input() isActiveComponent: boolean | undefined;
}
