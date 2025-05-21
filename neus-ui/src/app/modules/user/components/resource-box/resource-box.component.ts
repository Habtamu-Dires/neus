import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserSharedStateService } from '../../services/user-shared-state.service';
import { ResourceInfoDto } from '../../../../services/models';

@Component({
  selector: 'app-resource-box',
  imports: [CommonModule],
  templateUrl: './resource-box.component.html',
  styleUrl: './resource-box.component.css'
})
export class ResourceBoxComponent {
  @Input() resourceList: ResourceInfoDto[] = [];

  constructor(private router:Router,
    private userSharedStateService:UserSharedStateService
  ) {}

  navigateToDetails(resource: ResourceInfoDto) {
    const routeMap: { [key: string]: string } = {
      EXAM: 'mode',
      VIDEO: 'videos',
      NOTE: 'notes',
      BOOK: 'notes',
      READING_MATERIALS: 'collections',
      LECTURE_VIDEOS: 'collections',
      LECTURE_NOTES: 'collections',
      READING_MATERIAL: 'notes',
      ERMP: 'year',
      USMLE_STEP_1: 'year',
      USMLE_STEP_2: 'year',
      LECTURES: 'collection-selection',
      BOOKS: 'collection-selection'
    };
    const route = routeMap[resource.type as string];
    if(route === 'year' || resource.type === 'EXAM'){
      this.router.navigate([`user/${route}/${resource.type}`],
        {queryParams: {'examId':resource.resourceId, 'title': resource.title}}
      );
    } else{
      this.router.navigate([`user/${route}/${resource.resourceId}`]);
    }

  }

  isEqualOrHigherTier(requiredSubLevel: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const subscriptionLevel = this.userSharedStateService.subscriptionLevel();
    const userIndex = subscriptionLevel ? tiers.indexOf(subscriptionLevel) : -1;
    const resourceIndex = tiers.indexOf(requiredSubLevel);
    return userIndex >= resourceIndex;
  }
}
