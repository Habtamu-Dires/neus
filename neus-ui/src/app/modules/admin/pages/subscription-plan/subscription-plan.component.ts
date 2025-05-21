import { Component, HostListener, OnInit } from '@angular/core';
import { SubPlanDto } from '../../../../services/models';
import { SbuPlansService } from '../../../../services/services';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from "../../components/header/header.component";
import { ReadDialogComponent } from '../../components/read-dialog/read-dialog.component';

@Component({
  selector: 'app-subscription-plan',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css'
})
export class SubscriptionPlanComponent implements OnInit{

  subPlanList:SubPlanDto[] = [];
  showActions:boolean = false;
  selectedPlanId:string | undefined;
  isLoading=true;

  constructor(
    private SubPlansService:SbuPlansService,
    private matDialog:MatDialog,
    private router:Router,
    private toastr:ToastrService
  ){}

  ngOnInit(): void {
    this.fetchSubPlans();
  }

  //fetch subplans
  fetchSubPlans(){
    this.SubPlansService.getSubPlans().subscribe({
      next:(res:SubPlanDto[])=>{
        this.subPlanList  = res;
        this.isLoading=false;
      },
      error:(err)=>{
        this.isLoading=false;
        console.log();
        this.toastr.error(err);
      }
    })
  }

  // on show action
  onShowActions(planId:any){
    this.selectedPlanId =  planId as string;
    this.showActions = true;
  }


  // on search 
  onSearch(text:any){
    console.log(text);
  }

  // onedit
  onEdit(planId:any){
    this.router.navigate(['admin','sub-plans','manage', planId])
  }

  // open read dialog
  openReadDialog(level:any,benefitList:any){
    const benefits = benefitList as string[];
    let content:string = '<ul>';
    for(let benefit of benefits){
      content += "<li>" + benefit + "</li>"
    }
    content += '</ul>'

    const dialog = this.matDialog.open(ReadDialogComponent,{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '60%',
          height: '60%',
              data:{
                content:content,
                title: level
              }
        });
    
        dialog.afterClosed().subscribe((result) => {
          if(result){
            console.log('user status toggled');
          }
        });
  }

  // hide delete & edit btn onclick outside the btn
  @HostListener('document:click', ['$event'])
  hideDeleteBtn(event: MouseEvent){
    const target = event.target as HTMLElement;
    if(!target.classList.contains('donthide')){
      this.showActions = false;
    }
  }
}
