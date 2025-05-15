import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mode-selection',
  imports: [],
  templateUrl: './mode-selection.component.html',
  styleUrl: './mode-selection.component.css'
})
export class ModeSelectionComponent implements OnInit{

  examType: 'USMLE_STEP_1' | 'USMLE_STEP_2' | 'ERMP' | undefined;
  year:number | undefined;
  selectedMode: 'TEST' | 'STUDY' | undefined;
  title:string = '';
  examId:string | undefined;

  constructor(
    private activatedRoute:ActivatedRoute,
    private route:Router
  ){}

    ngOnInit(): void {
      this.activatedRoute.params.subscribe((params) => {
        this.examType = params['examType'];
        this.year = params['year'];
        this.title = `${this.examType?.replaceAll('_', ' ')}  ${this.year}`;
      });

      // exam id incase of USMLE
      this.activatedRoute.queryParams.subscribe((params)=>{
        this.examId = params['examId']
      })
    }

    selectMode(mode: 'TEST' | 'STUDY') {
      console.log('Mode selected:', this.examType);
      this.selectedMode = mode;
      if(this.examType === 'ERMP' && this.selectedMode === 'STUDY'){
        // go to department selction
        this.route.navigate(['user','study-mode',this.examType,this.year])
      } else if (this.examType === 'ERMP' && this.selectedMode === 'TEST'){
        // go to part section 
          this.route.navigate(['user','part', this.examType,this.year,mode]);
      } else if (this.examType 
                && ['USMLE_STEP_1', 'USMLE_STEP_2'].includes(this.examType) 
                && this.selectedMode === 'STUDY'
      ){ 
          // go to department selction
         this.route.navigate(['user','study-mode',this.examType,this.year],
           {queryParams: {'examId': this.examId}}
         )
      } else if (this.examType 
                && ['USMLE_STEP_1', 'USMLE_STEP_2'].includes(this.examType) 
                && this.selectedMode === 'TEST'
      ){
        // got to exam part
        this.route.navigate(['user','exam', this.examId,mode])
      } 
    }


}
