import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PdfDetailComponent } from './pages/pdf-detail/pdf-detail.component';
import { VideoDetailComponent } from './pages/video-detail/video-detail.component';
import { ResourceCollectionComponent } from './pages/resource-collection/resource-collection.component';
import { YearSelectionComponent } from './pages/year-selection/year-selection.component';
import { ModeSelectionComponent } from './pages/mode-selection/mode-selection.component';
import { StudyModeSelectionComponent } from './pages/study-mode-selection/study-mode-selection.component';
import { PartSelectionComponent } from './pages/part-selection/part-selection.component';
import { ExamComponent } from './pages/exam/exam.component';
import { CollectionSelectionComponent } from './pages/collection-selection/collection-selection.component';


const routes: Routes = [
  {path: '',
      redirectTo: 'home',
      pathMatch: 'full'
  },
  {path:'home', component:HomeComponent},
  {path:'notes/:pdfId',component:PdfDetailComponent},
  {path:'videos/:videoId', component:VideoDetailComponent},
  {path:'collections/:collectionId', component:ResourceCollectionComponent},
  {path:'year/:examType', component:YearSelectionComponent},   
  {path:'mode/:examType', component:ModeSelectionComponent},
  {path:'study-mode/:examType/:year',component:StudyModeSelectionComponent},
  {path:'part/:examType/:year/:mode',component:PartSelectionComponent},
  {path:'exam/:examId/:mode',component:ExamComponent},
  {path:'collection-selection/:lectureId',component:CollectionSelectionComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
