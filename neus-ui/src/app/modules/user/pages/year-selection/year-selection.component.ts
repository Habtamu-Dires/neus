import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService } from '../../../../services/services';
import { CommonModule } from '@angular/common';
import { ExamNameDto, NumberDto } from '../../../../services/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-year-selection',
  imports: [CommonModule],
  templateUrl: './year-selection.component.html',
  styleUrl: './year-selection.component.css'
})
export class YearSelectionComponent implements OnInit{

  examType:'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP' | undefined;
  yearList:NumberDto[] = [];
  examList:ExamNameDto[] = [];
  selectedYear: number | undefined = undefined;
  isLoading:boolean = true;
  resourceNotFound:boolean = false;
 
  constructor(
    private activatedRoute:ActivatedRoute,
    private examsService:ExamsService,
    private router:Router,
    private toastrService:ToastrService,
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.examType = params['examType'];
      if(this.examType === 'ERMP'){
        this.fetchYearList(this.examType);
      } else if(this.examType?.startsWith("USMLE")){
        this.fetchExamList(this.examType);
      }
    });
    
  }


  // fetch years By exam Type
  fetchYearList(examType: 'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP'){
    this.examsService.getYearsByExamType({
      'exam-type': examType 
    }).subscribe({
      next:(res:NumberDto[])=>{
        this.yearList = res;
        this.isLoading = false;
        if(res.length === 0){
          this.resourceNotFound = true;
        }
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error(err);
      }
    })
  }

  // fetch exam list by exam Type
  fetchExamList(examType: 'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP'){
    this.examsService.getExamNamesByExamType({
      'exam-type':examType
    }).subscribe({
      next:(res)=>{
        this.examList = res;
        this.isLoading = false;
         if(res.length === 0){
          this.resourceNotFound = true;
        }
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error(err);
      }
    })
  }

  // on year selected
  selectYear(year: any) {
    this.selectedYear = year;
    this.router.navigate(['user','mode',this.examType],
      {queryParams: {'year': this.selectedYear}}
    )
  }

  // selectExam()
  selectExam(exam:ExamNameDto){
    // navigate to mode selextion
    this.router.navigate(['user','mode',this.examType],
      {queryParams: {'examId': exam.id, 'year':exam.year, 'title':exam.title}}
    )
  }

  // close
  onClose(){
    this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
  }



}
