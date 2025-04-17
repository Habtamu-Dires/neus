import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-drawer-item',
  imports: [CommonModule],
  templateUrl: './drawer-item.component.html',
  styleUrl: './drawer-item.component.css'
})
export class DrawerItemComponent {
  @Input() isActiveComponent:boolean = false;
  @Input() componentName:string = '';
}
