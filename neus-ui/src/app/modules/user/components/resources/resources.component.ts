import { Component, effect, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ResourceDto, ResourceInfoDto } from '../../../../services/models';
import { ResourcesService } from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { CommonModule } from '@angular/common';
import { UserSharedStateService } from '../../services/user-shared-state.service';
import { ResourceBoxComponent } from "../resource-box/resource-box.component";

@Component({
  selector: 'app-resources',
  imports: [CommonModule, ResourceBoxComponent],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent {
  resources: ResourceInfoDto[] = [];
  filteredResources: ResourceInfoDto[] = [];
  examResources: ResourceInfoDto[] = [];
  lectureResources:ResourceInfoDto[] = [];
  noteResources: ResourceInfoDto[] = [];
  videoResources: ResourceInfoDto[] = [];
  bookResources: ResourceInfoDto[] = [];
  activeFilter: string = 'FREE';
  savedFilter:string = '';
  isLoggedIn = false;
  subscriptionLevel: "NONE" | "BASIC" | "ADVANCED" | "PREMIUM" | undefined = undefined;
  showSearchInput:boolean = false;

  @Output() scrollToSection = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputRef!:ElementRef<HTMLInputElement>;

  constructor(
    private resourcesService: ResourcesService,
    private keyclaokService:KeycloakService,
    private userSharedStateService:UserSharedStateService,
    private activatedRoute:ActivatedRoute
  ) {
    // watch singal change
    effect(()=>{
      this.subscriptionLevel = this.userSharedStateService.subscriptionLevel();
      if(this.subscriptionLevel){
        this.applyFilter(this.subscriptionLevel)
      }
    })
  }

  ngOnInit(): void {
    // Check login status
    this.isLoggedIn = this.keyclaokService.isAuthenticated;

    // back to current sub level category
    const isFromResDetail = this.activatedRoute.snapshot.queryParams['from-resource-detail'];

    // fetch resources
    this.fetchResource(isFromResDetail);
    
  }

  // fetch resources
  fetchResource(isFromResDetail:boolean | undefined){
     this.resourcesService.getListOfResources().subscribe({
      next:(res:ResourceDto[])=>{
        this.resources = res;
        if(this.subscriptionLevel && !isFromResDetail){
          this.applyFilter(this.subscriptionLevel);
        } else if(isFromResDetail){
          this.applyFilter(this.userSharedStateService.currentSubLevelCat());
        } else{
          this.applyFilter('FREE');
        }
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
    this.examResources = this.filteredResources.filter(r => 
       ['EXAM','ERMP','USMLE_STEP_1','USMLE_STEP_2'].includes(r.type ? r.type : 'none') ); 
    this.lectureResources = this.filteredResources.filter(r => r.type === 'LECTURE' ); 
    this.noteResources = this.filteredResources.filter(r => 
        r.type === 'READING_MATERIAL' || r.type === 'LECTURE_NOTES');
    this.videoResources = this.filteredResources.filter(r => 
        r.type === 'VIDEO' || r.type === 'LECTURE_VIDEOS');
    this.bookResources = this.filteredResources.filter(r => r.type === 'BOOK');
  }

  // on filter selected
  onFilterSelected(filter: string): void {
    this.applyFilter(filter);
    this.scrollToSection.emit('resources');
    this.showSearchInput = false;
    this.userSharedStateService.updateCurrentSubLevelCat(filter as 'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM');
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

      this.scrollToSection.emit('resources');

      // Group resources by type
      this.examResources = this.filteredResources.filter(r => 
        ['EXAM','ERMP','USMLE_STEP_1','USMLE_STEP_2'].includes(r.type ? r.type : 'none') );
      this.lectureResources = this.filteredResources.filter(r => r.type === 'LECTURE' ); 
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

  // scroll to resources type
  scrollToResouceType(typeId:string){
    setTimeout(() => {
      const element = document.getElementById(typeId);
      if (element) {
        const headerOffset = 200;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
    
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150); // slight delay lets rendering settle 
  }
  
}
