import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './pages/user/user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResourceComponent } from './pages/resource/resource.component';
import { ManageResourceComponent } from './pages/manage-resource/manage-resource.component';
import { PdfReaderExtendedComponent } from '../../components/pdf-reader-extended/pdf-reader-extended.component';
import { VideoStreamComponent } from '../../components/video-stream/video-stream.component';

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
      {path:'pdf-reader',component:PdfReaderExtendedComponent},
      {path:'video-streaming', component:VideoStreamComponent}
    ]},
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
