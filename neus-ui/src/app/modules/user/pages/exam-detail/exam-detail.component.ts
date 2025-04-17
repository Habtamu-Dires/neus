import { Component, ElementRef, ViewChild } from '@angular/core';
import { ExamDetailDto, QuestionDto } from '../../../../services/models';
import { ExamsService, QuestionsService } from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-exam-detail',
  imports: [CommonModule,FormsModule],
  templateUrl: './exam-detail.component.html',
  styleUrl: './exam-detail.component.css'
})
export class ExamDetailComponent {
  examId: string | undefined;
  title:string='';
  examDto:ExamDetailDto | undefined;
  questionList: QuestionDto[] = []; 
  currentQuestionIndex: number = 0;
  showExplanation:boolean = false;

  @ViewChild('questionContainer') questionContainer!: ElementRef;

  constructor(
    private examsService:ExamsService,
    private qustionsService:QuestionsService,
    private activatedRoute: ActivatedRoute, 
    private matDialog: MatDialog,
    private router:Router,
    private toastrService:ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.examId = params['examId'];
      if(this.examId){
        this.fetchExamDetail(this.examId);
      }
    });
  }

  // fetch exam detail
  fetchExamDetail(examId:string){
    this.examsService.getExamDetail({
      'exam-id': examId 
    }).subscribe({
      next:(res:ExamDetailDto)=>{
        this.examDto = res;
        console.log("response ===> " + res);
        this.questionList = res.questions as QuestionDto[];
        console.log(res.questions);
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Someting went wrong', 'Error');
      }
    })
  }


  // current question
  get currentQuestion():  QuestionDto{
    return this.questionList[this.currentQuestionIndex];
  }
  
  // get choice letter
  getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // select question
  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
    this.scrollToTop();
  }

  // toggle correct
  toggleCorrect(id: any) {
    const choices = this.currentQuestion.choices;
    // choices?.forEach((c, i) => (c.isCorrect = i === index)); // Single correct answer
    choices?.forEach(c => c.isCorrect = c.id === id);
  }

  // next question
  nextQuestion() {
    if (this.currentQuestionIndex < this.questionList.length - 1) {
      this.currentQuestionIndex++;
      this.showExplanation = false;
      this.scrollToTop();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showExplanation = false;
      this.scrollToTop();
    }
  }

  close(){
    this.router.navigate(['user']);
  }

  // scroll top
  scrollToTop() {
    if (this.questionContainer) {
      this.questionContainer.nativeElement.scrollTop = 0;
    }
  }
}
