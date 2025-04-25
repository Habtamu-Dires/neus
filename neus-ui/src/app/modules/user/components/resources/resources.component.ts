import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ListOfResourcesDto, ResourceDto } from '../../../../services/models';
import { ResourcesService } from '../../../../services/services';
import { Router } from '@angular/router';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources',
  imports: [CommonModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent {
  resources: ListOfResourcesDto[] = [];
  filteredResources: ListOfResourcesDto[] = [];
  examResources: ListOfResourcesDto[] = [];
  noteResources: ListOfResourcesDto[] = [];
  videoResources: ListOfResourcesDto[] = [];
  bookResources: ListOfResourcesDto[] = [];
  activeFilter: string = 'FREE';
  savedFilter:string = '';
  isLoggedIn = false;
  subscriptionLevel: string | null = null;
  showSearchInput:boolean = false;

  @Output() onFilterChanged = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputRef!:ElementRef<HTMLInputElement>;

  constructor(
    private resourcesService: ResourcesService,
    private keyclaokService:KeycloakService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check login status
    this.isLoggedIn = this.keyclaokService.isAuthenticated;
    if (this.isLoggedIn) {
      const subscriptionType = this.keyclaokService.subscriptionLevel as string;
      if(subscriptionType){
        this.subscriptionLevel = subscriptionType.replace('_subscriber','').toUpperCase();
      }
    }
    // fetch resources
    this.fetchResource();
  }

  // fetch resources
  fetchResource(){
     this.resourcesService.getListOfResources().subscribe({
      next:(res:ResourceDto[])=>{
        this.resources = res;
        if(this.subscriptionLevel){
          this.applyFilter(this.subscriptionLevel);
        } else {
          this.applyFilter('FREE');
        }
        console.log(res);
      },
      error:(err)=>{
        console.log(err);
      }
     })
  }


  // apply filter
  applyFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'FREE') {
      this.filteredResources = this.resources.filter(
        resource => resource.requiredSubLevel === 'NONE'
      );
    } else {
      this.filteredResources = this.resources.filter(
        resource => resource.requiredSubLevel === filter
      );
    }

    // Group resources by type
    this.examResources = this.filteredResources.filter(r => r.type === 'EXAM');
    this.noteResources = this.filteredResources.filter(r => 
        r.type === 'READING_MATERIAL' || r.type === 'LECTURE_NOTES');
    this.videoResources = this.filteredResources.filter(r => 
        r.type === 'VIDEO' || r.type === 'LECTURE_VIDEOS');
    this.bookResources = this.filteredResources.filter(r => r.type === 'BOOK');
  }

  // on filter selected
  onFilterSelected(filter: string): void {
    this.applyFilter(filter);
    this.onFilterChanged.emit('resources');
  }

  navigateToDetail(resource: ListOfResourcesDto): void {
    const routeMap: { [key: string]: string } = {
      EXAM: 'exams',
      VIDEO: 'videos',
      NOTE: 'notes',
      LECTURE_VIDEOS: 'lectures',
      LECTURE_NOTES: 'lectures'
    };
    const route = routeMap[resource.type as string];
    this.router.navigate([`user/${route}/${resource.resourceId}`]);
  }

  isEqualOrHigherTier(requiredSubLevel: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const userIndex = this.subscriptionLevel ? tiers.indexOf(this.subscriptionLevel) : -1;
    const resourceIndex = tiers.indexOf(requiredSubLevel);
    return userIndex >= resourceIndex;
  }

  // on seach btn click
  onSearchClick(){
    this.showSearchInput = true;
    this.savedFilter = this.activeFilter;
    this.activeFilter = 'ALL';
    setTimeout(() => {
      this.searchInputRef.nativeElement.focus();
    }, 0);
  }

  // onsearch
  onSearch(text:string){
    console.log(text)
    if(text.length >= 3){
      this.activeFilter = 'ALL';
      this.filteredResources = this.resources.filter(
        resource => resource.title?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      );

    // Group resources by type
    this.examResources = this.filteredResources.filter(r => r.type === 'EXAM');
    this.noteResources = this.filteredResources.filter(r => 
        r.type === 'READING_MATERIAL' || r.type === 'LECTURE_NOTES');
    this.videoResources = this.filteredResources.filter(r => 
        r.type === 'VIDEO' || r.type === 'LECTURE_VIDEOS');
    this.bookResources = this.filteredResources.filter(r => r.type === 'BOOK');
    
    }
  }
  /// clear search area
  clearSearchArea(){
    this.showSearchInput = false;
    this.activeFilter = this.savedFilter;
    this.applyFilter(this.activeFilter);
  }

  
}
