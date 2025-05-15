import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from '../../../../services/services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedStateService } from '../../../../services/shared-state/shared-state.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-study-mode-selection',
  imports: [CommonModule,FormsModule],
  templateUrl: './study-mode-selection.component.html',
  styleUrl: './study-mode-selection.component.css'
})
export class StudyModeSelectionComponent {
  examType: 'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP' | undefined;
  year:number | undefined;
  mode: 'TEST' | 'STUDY' = 'STUDY';
  departmentList:any[] = [];
  blockList:any[] = [];
  selectedDepartment:string | undefined;
  selectedBlock:string | undefined;
  showDepartmentList:boolean = false;
  showBlockList:boolean = false;
  isLoading:boolean = true;
  examId:string | undefined;
  blocksPriorityOrder:string [] = [];
  resourceNotFound:boolean = false;

  constructor(
    private activatedRoute:ActivatedRoute,
    private questionService:QuestionsService,
    private route:Router,
    private sharedStateService:SharedStateService,
    private toastrService:ToastrService
  ){}

    ngOnInit(): void {
      this.activatedRoute.params.subscribe((params) => {
        this.examType = params['examType'];
        this.year = params['year'];
        if(this.examType && this.year){
          this.fetchDepartmentsByExamTypeAndYear(this.examType,this.year);
        }
      });

      // exam id in case usmle
      this.activatedRoute.queryParams.subscribe((params)=>{
        this.examId = params['examId'];
      })

      this.blocksPriorityOrder = this.sharedStateService.blockNumberList;
    }

    // fetch departments 
    fetchDepartmentsByExamTypeAndYear(examType: 'USMLE_STEP_1'|'USMLE_STEP_2'|'ERMP' , year:number){
      this.questionService.getDepartmentsByExamType({
        'exam-type':examType,
        'year': year
      }).subscribe({
        next:(res)=>{
            this.departmentList = res;
            this.isLoading = false;
            if(res.length === 0){
              this.resourceNotFound = true;
            } else {
              this.showDepartmentList = true;
            }
        },
        error:(err)=>{
          console.log(err);
          this.toastrService.error(err);
        }
      })
    }

    // fetch blocks by examType, year and department
    fetchBlocksByExamTypeYearAndDepartment(examType:'USMLE_STEP_1'|'USMLE_STEP_2'|'ERMP',
      year:number, department:string
    ){
      this.questionService.getBlocksByExamTypeAndYearAndDepartment({
        'exam-type':examType,
        'year':year,
        'department':department
      }).subscribe({
        next:(res)=>{
          this.blockList = res;
          this.sortBlocks();
          this.isLoading = false;
          if(res.length === 0){
            this.resourceNotFound = true;
          } else {
            this.showBlockList=true;
          }
        },
        error:(err)=>{
          console.log(err);
          this.toastrService.error(err);
        }
      })
    }

    // select a department
    selectDepartment(department:string){
      this.selectedDepartment = department;
      const mode = 'STUDY';
      if(this.examType === 'ERMP'){
         this.route.navigate(['user','part', this.examType,this.year,mode],
        {queryParams: {'department': this.selectedDepartment}});
      } else if(this.examType?.startsWith("USMLE")){
        this.isLoading = true;
        this.showDepartmentList = false;
        this.fetchBlocksByExamTypeYearAndDepartment(this.examType,this.year as number,department)
      }
    }

    // select a block
    selectBlock(block:string){
      this.route.navigate(['user', 'exam', this.examId, this.mode],
        {queryParams: {'department': this.selectedDepartment, 'block': block}}
      )
    }


    // sort blocks
    sortBlocks(){
      this.blockList.sort((a, b) => {
        const indexA = this.blocksPriorityOrder.indexOf(a);
        const indexB = this.blocksPriorityOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    // close
    onClose(){
      window.history.back();
    }


}
