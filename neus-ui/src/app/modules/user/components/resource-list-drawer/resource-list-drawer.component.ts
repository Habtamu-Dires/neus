import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResourceDetailDto } from '../../../../services/models';

@Component({
  selector: 'app-resource-list-drawer',
  imports: [],
  templateUrl: './resource-list-drawer.component.html',
  styleUrl: './resource-list-drawer.component.css'
})
export class ResourceListDrawerComponent {
  
  @Input() resourceList: ResourceDetailDto[] = [];
  @Input() currentResourceIndex: number = 0;
  @Output() onResourceSelect = new EventEmitter<number>();

  // select resource
  selectResource(index: number) {
    this.onResourceSelect.emit(index);
  }

}
