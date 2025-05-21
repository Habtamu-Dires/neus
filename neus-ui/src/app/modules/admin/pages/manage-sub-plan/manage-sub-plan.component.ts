import { Component, OnInit } from '@angular/core';
import { SubPlanDto, UpdateSubPlanDto } from '../../../../services/models';
import { SbuPlansService } from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-sub-plan',
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-sub-plan.component.html',
  styleUrl: './manage-sub-plan.component.css'
})
export class ManageSubPlanComponent implements OnInit{

  // subPlan:SubPlanDto | undefined;
  updateSubPlanDto:UpdateSubPlanDto = {
    level: '',
    price: 0,
    durationInMonth: 12,
    benefits: [],
    enabled: true,
  };
  errMsgs:Array<string> = [];
  benefit:string = '';
  benefitIndex:number = -1;

  constructor(
    private subPlansService:SbuPlansService,
    private activatedRoute:ActivatedRoute,
    private router:Router,
    private toastrService:ToastrService
  ){}

  ngOnInit(): void {
    const planId = this.activatedRoute.snapshot.params['planId'];
    if(planId){
      this.fetchSubPlanById(planId);
    }
  }

  //fetch sub plan by id
  fetchSubPlanById(planId:string){
    this.subPlansService.getSubPlanById({
      'plan-id': planId
    }).subscribe({
      next:(res)=>{
        this.updateSubPlanDto = {
          id:res.id,
          level: res.level,
          price: res.price as number,
          durationInMonth: res.durationInMonth as number,
          benefits: res.benefits as string[],
          enabled: res.enabled as boolean
        }
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // on save
  onSave(){
    this.updateSubPlan();
  }

  // update subPlan
  updateSubPlan(){
    this.subPlansService.updateSubPlan({
      body: this.updateSubPlanDto 
    })
    .subscribe({
      next:()=>{
        this.toastrService.success('Subscription plan updat sucessfull', 'Done');
        this.router.navigate(['/admin/sub-plans']);
      },
      error:(err)=>{
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        }else {
          this.toastrService.error('Something went wrong', 'Error');
        }

      }
    })
  }

  // on add benefit
  addBenefit(){
    if(this.benefit.length > 3 && this.benefitIndex === -1){
      this.updateSubPlanDto.benefits.push(this.benefit);
      
    } else if(this.benefitIndex !== -1 && this.benefit.length > 3){
      this.updateSubPlanDto.benefits[this.benefitIndex] = this.benefit;
    }

    // reset
      this.benefit = '';
      this.benefitIndex = -1;
  }

  // edit benefit
  editBenefit(benefit:string, index:number){
    this.benefit =benefit;
    this.benefitIndex = index;
  }

  // on remove benefit
  removeBenefit(index:number){
    this.updateSubPlanDto.benefits = this.updateSubPlanDto.benefits.filter((b,i)=> i !== index);
  }

  onCancel(){
    window.history.back();
  }

}
