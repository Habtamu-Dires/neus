import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './pages/user/user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResourceComponent } from './pages/resource/resource.component';
import { ManageResourceComponent } from './pages/manage-resource/manage-resource.component';
import { VideoStreamComponent } from '../../components/video-stream/video-stream.component';
import { ExamComponent } from './pages/exam/exam.component';
import { ManageExamComponent } from './pages/manage-exam/manage-exam.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { CreateQuestionComponent } from './pages/create-question/create-question.component';
import { SubscriptionPlanComponent } from './pages/subscription-plan/subscription-plan.component';
import { ManageSubPlanComponent } from './pages/manage-sub-plan/manage-sub-plan.component';
import { PdfReaderComponent } from './pages/pdf-reader/pdf-reader.component';
import { VideoStreamerComponent } from './pages/video-streamer/video-streamer.component';

const routes: Routes = [
  {path:'', 
    component: HomeComponent ,
    children:[
      {path:'', redirectTo:'dashboard', pathMatch:'full'},
      {path:'dashboard', component: DashboardComponent},
      {path:'users', component:UserComponent}, 
      {path:'resources',component:ResourceComponent},
      {path:'resources/manage',component:ManageResourceComponent},
      {path:'resources/manage/:resourceId',component:ManageResourceComponent},
      {path:'pdf-reader',component:PdfReaderComponent},
      {path:'video-streamer', component:VideoStreamerComponent},
      {path:'exams', component:ExamComponent},
      {path:'exams/manage',component:ManageExamComponent},
      {path:'exams/manage/:examId',component:ManageExamComponent},
      {path:'questions/:examId/:title',component:QuestionsComponent},
      {path:'create-question',component:CreateQuestionComponent},
      {path:'sub-plans',component:SubscriptionPlanComponent},
      {path:'sub-plans/manage/:planId',component:ManageSubPlanComponent},
          
    ]},
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
