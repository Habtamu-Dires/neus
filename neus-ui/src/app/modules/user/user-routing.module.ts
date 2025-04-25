import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ExamDetailComponent } from './pages/exam-detail/exam-detail.component';
import { PdfDetailComponent } from './pages/pdf-detail/pdf-detail.component';
import { VideoDetailComponent } from './pages/video-detail/video-detail.component';
import { LecturesComponent } from './pages/lectures/lectures.component';


const routes: Routes = [
  {path: '',
      redirectTo: 'home',
      pathMatch: 'full'
  },
  {path:'home', component:HomeComponent},
  {path:'exams/:examId',component:ExamDetailComponent},
  {path:'notes/:pdfId',component:PdfDetailComponent},
  {path:'videos/:videoId', component:VideoDetailComponent},
  {path:'lectures/:lectureId', component:LecturesComponent},

   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
