import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResourceDetailDto } from '../../../../services/models';

@Component({
  selector: 'app-lectures-drawer',
  imports: [],
  templateUrl: './lectures-drawer.component.html',
  styleUrl: './lectures-drawer.component.css'
})
export class LecturesDrawerComponent {

  @Input() resourceList: ResourceDetailDto[] = [];
  @Input() currentResourceIndex: number = 0;
  @Output() onResourceSelect = new EventEmitter<number>();


  // select resource
  selectResource(index: number) {
    this.onResourceSelect.emit(index);
  }

}
