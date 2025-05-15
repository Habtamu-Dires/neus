import { Component, CSP_NONCE } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService, QuestionsService } from '../../../../services/services';
import { ExamNameDto, TextDto, UserDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-part-selection',
  imports: [CommonModule],
  templateUrl: './part-selection.component.html',
  styleUrl: './part-selection.component.css'
})
export class PartSelectionComponent {

  examType: 'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP' | undefined;
  year:number | undefined;
  mode: 'TEST' | 'STUDY' | undefined;
  department:string | undefined;
  examList:ExamNameDto[] = [];
  title:string = '';

   constructor(
    private activatedRoute:ActivatedRoute,
    private examsService:ExamsService,
    private router:Router
  ){}

    ngOnInit(): void {
      this.activatedRoute.params.subscribe((params) => {
        this.examType = params['examType'];
        this.year = params['year'];
        this.mode = params['mode'];
        if(this.examType && this.year){
          this.fetchExamListByExamTypeAndYear(this.examType,this.year);
        }
        // title
        this.title = `${this.examType} ${this.year}`
      });

      // get department from query 
      this.activatedRoute.queryParams.subscribe((params) => {
        this.department = params['department'];
      });
    }


    // fetch exam list by exam type, year 
    fetchExamListByExamTypeAndYear(examType: 'USMLE_STEP_1'|'USMLE_STEP_2'|'ERMP' , year:number){
      this.examsService.getExamNamesByExamTypeAndYear({
        'exam-type':examType,
        'year': year
      }).subscribe({
        next:(res)=>{
          this.examList = res;
        },
        error:(err)=>{
          console.log(err);
        }
      })
    }

    // select part
    selectPart(part: ExamNameDto) {
      if(this.mode === 'STUDY'){
        console.log("department " + this.department)
        this.router.navigate(['user','exam',part.id, this.mode],
          {queryParams: {'department': this.department}});
      } else if(this.mode === 'TEST'){
        this.router.navigate(['user','exam',part.id, this.mode]);
      }
    }


}
