import { Component, ElementRef, ViewChild } from '@angular/core';
import { ExamDetailDto, QuestionDto, UpdateUserExamDto, UserExamDto } from '../../../../services/models';
import { ExamsService, UserExamService } from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamResultDialogComponent } from '../../components/exam-result-dialog/exam-result-dialog.component';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { ResumeExamDialogComponent } from '../../components/resume-exam-dialog/resume-exam-dialog.component';
import { QuestionListDrawerComponent } from "../../components/question-list-drawer/question-list-drawer.component";

@Component({
  selector: 'app-exam-detail',
  imports: [CommonModule, FormsModule, QuestionListDrawerComponent],
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
  mode: 'STUDY' | 'TEST' = 'STUDY'; // Default to STUDY mode
  userAnswers: Map<string, string> = new Map(); // questionId -> selectedChoiceId
  correctAnswers: Map<string, boolean> = new Map(); // questionId -> isCorrect
  timer: number = 0; // Remaining time in seconds
  examDuration: number = 0; // Duration in minutes from backend
  interval: any;
  examStarted: boolean = false;
  isLoading:boolean = true;
  isSubmitted:boolean = false;
  hasFullAccess:boolean = false;
  // saved answers
  userExamData: UserExamDto | undefined;
  showQuestionsDrawer:boolean = false;



  @ViewChild('questionContainer') questionContainer!: ElementRef;

  constructor(
    private examsService:ExamsService,
    private keyclaokService:KeycloakService,
    private userExamService:UserExamService,
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

  // current question
  get currentQuestion():  QuestionDto{
    return this.questionList[this.currentQuestionIndex];
  }
  
  // get choice letter
  getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // fetch exam detail
  fetchExamDetail(examId:string){
    this.examsService.getExamDetail({
      'exam-id': examId 
    }).subscribe({
      next:(res:ExamDetailDto)=>{
        this.examDto = res;
        this.questionList = res.questions as QuestionDto[];
        this.examDuration = res.duration as number;
        this.checkFullAccess(res.requiredSubLevel as string);
        if(this.hasFullAccess){
          this.fetchUserAnswers();
        } else {
          this.isLoading = false;
        }
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Someting went wrong', 'Error');
      }
    })
  }

  // fetch user answers
  fetchUserAnswers(){
    this.userExamService.getUserAnswers({
      'exam-id': this.examId as string
    }).subscribe({
      'next':(res:UserExamDto)=>{
        this.userExamData = res;
        // set loading false
        this.isLoading = false;
      },
      'error':(err)=>{
        console.log(err);
        this.toastrService.error('Someting went wrong', 'Error');
        this.isLoading = false;
      }
    })
  }

  // update user answer 
  saveUserAnswers(){
    const request:UpdateUserExamDto = {
      examId: this.examId as string,
      mode: this.mode,
      userAnswers: Array.from(this.userAnswers.entries()).map(([questionId, choiceId]) => ({
        questionId,
        choiceId
      })),
      correctAnswers: Array.from(this.correctAnswers.entries()).map(([questionId, isCorrect]) => ({
        questionId,
        isCorrect
      })),
      timeLeftInMinutes: this.timer / 60,
    };

    // save user answers
    if(this.hasFullAccess){
      this.userExamService.saveUserAnswers({
        body: request,
      }).subscribe({
        next:(res:UserExamDto)=>{
          this.toastrService.success('Progress saved successfully');
        },
        error:(err)=>{
          console.log(err);
          this.toastrService.error('Unable to save answers');
        }
      })
    }
    
  }

  // reset user answers
  resetUserAnswers(){
    console.log("resting the mode ----> " + this.mode)
    this.userExamService.restUserAnswers({
      'exam-id': this.examId as string,
      'user-id': this.keyclaokService.profile?.id as string,
      'mode': this.mode as 'STUDY' | 'TEST'
    }).subscribe({
      next:()=>{
        console.log("success fullly reset");
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Someting went wrong', 'Error');
      } 
    });
  }

  // set exam mode
  setMode(mode: 'STUDY' | 'TEST') {
    this.mode = mode;
    this.userAnswers.clear();
    this.correctAnswers.clear();

    if(this.mode === 'TEST' && this.userExamData?.testModeUserAnswers 
      && this.userExamData.testModeUserAnswers?.length > 0)
    {
      this.showResumeExamDialog();
    } else if(this.mode === 'STUDY' && this.userExamData?.studyModeUserAnswers 
      && this.userExamData.studyModeUserAnswers?.length > 0)
    {
      this.showResumeExamDialog();
    } else {
      if (mode === 'TEST' && this.examDuration > 0) {
        clearInterval
        this.startTimer();
      }
    }

    // start exam
    this.currentQuestionIndex = 0;
    this.showExplanation = false;
    this.examStarted = true;
    
  }

  // resume dialog
  showResumeExamDialog() {
    console.log("hello show resume dialog")
    const dialog = this.matDialog.open(ResumeExamDialogComponent,{
      width: '400px',
      data:{
        answeredCount: this.mode === 'STUDY' 
          ? this.userExamData?.studyModeUserAnswers?.length
          : this.userExamData?.testModeUserAnswers?.length,
        total: this.questionList.length,
        mode: this.mode,
        lastUpdatedDate: this.userExamData?.lastModifiedDate,
        timeLeft: this.userExamData?.timeLeftInMinutes
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        if(this.mode === 'TEST'){

          this.userExamData?.testModeUserAnswers?.forEach((item) => { 
            this.userAnswers.set(item.questionId as string, item.choiceId as string);
          });
          this.userExamData?.testModeCorrectAnswers?.forEach((item) => { 
            this.correctAnswers.set(item.questionId as string, item.isCorrect as boolean);
          });

          // set time left
          this.examDuration = this.userExamData?.timeLeftInMinutes as number;

          //set time
          clearInterval
          this.startTimer();

        } else if (this.mode === 'STUDY') {
          this.userExamData?.studyModeUserAnswers?.forEach((item) => {
            this.userAnswers.set(item.questionId as string, item.choiceId as string);
          });
          this.userExamData?.studyModeCorrectAnswers?.forEach((item) => { 
            this.correctAnswers.set(item.questionId as string, item.isCorrect as boolean);
          });
        }
      } else {
        // reset user answers
        this.resetUserAnswers();
      }
    });
  }


  // start timer
  startTimer() {
    this.timer = this.examDuration * 60; // Convert minutes to seconds
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
        this.submitExam();
      }
    }, 1000);
  }

  // format time
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  }

  // select answer
  selectAnswer(choiceId: any) {
    // if (this.userAnswers.has(this.currentQuestionIndex)) return; // Prevent changing answers
    this.userAnswers.set(this.currentQuestion.id as string, choiceId);

    if (this.mode === 'STUDY') {
      const correctChoice = this.currentQuestion.choices?.find(c => c.isCorrect);
      const isCorrect = correctChoice?.id === choiceId;
      this.correctAnswers.set(this.currentQuestion.id as string, isCorrect);
    }
  }

  // select question
  selectQuestion(index: any) {
    this.currentQuestionIndex = index as number;
    this.showExplanation = false;
    this.scrollToTop();
    if(this.showQuestionsDrawer){
      this.toggleQuestionsDrawer();
    }
  }

  // next question
  nextQuestion() {
    if (this.currentQuestionIndex < this.questionList.length - 1) {
      this.currentQuestionIndex++;
      this.showExplanation = false;
      this.scrollToTop();
    }
  }

  // previous question
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showExplanation = false;
      this.scrollToTop();
    }
  }

  // submit exam
  submitExam() {
    if (this.mode === 'TEST') {
      const dialog = this.matDialog.open(ConfirmDialogComponent,{
        width: '400px',
        data:{
          message:'you wants to the mode to submit?',
          buttonName: 'submit',
          isWarning: false
        }
      });
      dialog.afterClosed().subscribe((result) => {
      if(result){
        clearInterval(this.interval);
        let score = 0;
        this.questionList.forEach((question, index) => {
          const userAnswer = this.userAnswers.get(question.id as string);
          const correctChoice = question.choices?.find(c => c.isCorrect);
          const isCorrect = userAnswer === correctChoice?.id;
          this.correctAnswers.set(question.id as string, isCorrect);
          if (isCorrect) score++;
        });
        this.showResults(score);
        this.isSubmitted = true;
        // save user answers
        if(this.hasFullAccess){
          this.saveUserAnswers();
        }
      }
      });
    } else if (this.mode === 'STUDY' && this.userAnswers.size === this.questionList.length) {
      let score = 0;
      this.correctAnswers.forEach(isCorrect => {
        if (isCorrect) score++;
      });
      this.showResults(score);
    }
  }

  // show results
  showResults(score: number) {
    this.matDialog.open(ExamResultDialogComponent, {
      width: '400px',
      data: {
        score:score,
        total: this.questionList.length,
        mode: this.mode,
      }
    });
  }

  // show retake exam
  retakeExam() {
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
      width: '400px',  
      data:{
        message:'you wants to retake the exam?',
        buttonName: 'retake',
        isWarning: false
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.userAnswers.clear();
        this.correctAnswers.clear();
        if(this.mode === 'TEST'){
          this.isSubmitted = false;
          clearInterval(this.interval);
          this.examDuration = this.examDto?.duration as number;
          this.startTimer();
        }
        this.currentQuestionIndex = 0;
        this.showExplanation = false;
        this.examStarted = true;
        // reset user answers
        if(this.hasFullAccess){
          this.resetUserAnswers();
        }
      }
    }
    ); 
  }

  // on mode change
  onModeChange(mode:string){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
        width: '400px',
        data:{
          message:'you wants to the mode to ' + mode,
          buttonName: 'change',
          isWarning: false
        }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.examStarted = false;
        this.isSubmitted = false;
        clearInterval(this.interval);
        this.isLoading = true;
        // if(this.userAnswers.size > 0){
        //   this.saveUserAnswers(this.mode === 'STUDY' ? 'TEST' : 'STUDY');
        // }
        this.fetchUserAnswers();
        if(this.isLoading){
          this.setMode(mode as 'STUDY' | 'TEST');
        }
      }
    });
  }

  // save progess
  saveProgess(){
    if(this.hasFullAccess){
      if(this.userAnswers.size > 0){
        this.saveUserAnswers();
      }
    }
  }

  // on close
  close(){
    this.router.navigate(['user']);
  }

  // scroll top
  scrollToTop() {
    if (this.questionContainer) {
      this.questionContainer.nativeElement.scrollTop = 0;
    }
  }

  // check if user has full access
  checkFullAccess(requiredSubLevl:string){
    if(this.keyclaokService.isAuthenticated){
      const subscriptionLevel = this.keyclaokService.subscriptionLevel as string;
      if(requiredSubLevl === 'NONE'){
        this.hasFullAccess = true;
      }
      else if(subscriptionLevel && this.mapToRequiredSubLevel(subscriptionLevel) === requiredSubLevl){
        this.hasFullAccess = true;
      }
      else {
        this.hasFullAccess = false;
      }
    }
  }

  // map subscription level
  mapToRequiredSubLevel(subscriptionLevel:string){
    if(subscriptionLevel === 'basic_subscriber'){
      return 'BASIC';
    } else if(subscriptionLevel === 'advanced_subscriber'){
      return 'ADVANCED';
    } else if(subscriptionLevel === 'premium_subscriber'){
      return 'PREMIUM';
    } else {
      return 'NONE';
    }
  }

  // toggle question lists on mobile view
  toggleQuestionsDrawer() {
    this.showQuestionsDrawer = !this.showQuestionsDrawer;
  }
}
