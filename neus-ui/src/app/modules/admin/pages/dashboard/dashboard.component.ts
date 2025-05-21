import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { UsersService } from '../../../../services/services';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{

  showDrawer:boolean = false;

  data:any[] = [];
  view: [number,number] = [900, 200];

  // colorScheme = {
  //   domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  // };
  colorScheme: string = 'vivid';
  cardColor: string = '#232837'; // #232837

  constructor(
    private adminUxService:AdminUxService,
    private usersService:UsersService
  ){
    effect(()=>{
      this.showDrawer = this.adminUxService.showDrawer();
    })
  }

  ngOnInit(): void {
    this.fetchUserAggregateData();
  }

  // fetch usser aggregate data
  fetchUserAggregateData(){
    this.usersService.getUserAggregateData().subscribe({
      next:(res) => {
        console.log(res);
        this.data = Object.entries(res).map(([key, value],index) => {
          // const key 
         return {
            name: key.toUpperCase(),
            value: value
          }
        }); 
      },
      error:(err) => {  

      } 
    }) 
  } 

  // toggle show drawer
  toggleShowDrawer(){
    this.adminUxService.toggleShowDrawerStatus();
    this.showDrawer = this.adminUxService.showDrawer();
  }

  
}
