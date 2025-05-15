import { Component, ElementRef, ViewChild } from '@angular/core';
import { ExamDetailDto, QuestionDetailDto, QuestionDto, UpdateUserExamDto, UserExamDto } from '../../../../services/models';
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
  questionList: QuestionDetailDto[] = []; 
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
  userExamData: UserExamDto | undefined;  // saved answers
  showQuestionsDrawer:boolean = false;
  subscriptionLevel:string | null = null;

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
    // Check login status
     const isLoggedIn = this.keyclaokService.isAuthenticated;
    if (isLoggedIn) {
      const subscriptionType = this.keyclaokService.subscriptionLevel as string;
      if(subscriptionType){
        this.subscriptionLevel = subscriptionType.replace('_subscriber','').toUpperCase();
      }
    }
  }

  // current question
  get currentQuestion():  QuestionDetailDto{
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
        // check access status
        this.hasFullAccess = this.isEqualOrHigherTier(res.requiredSubLevel as string);
        if(this.hasFullAccess && this.keyclaokService.isAuthenticated){
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
  fetchUserAnswers(changeMode:boolean = false){
    this.userExamService.getUserAnswers({
      'exam-id': this.examId as string
    }).subscribe({
      next:(res:UserExamDto)=>{
        this.userExamData = res;
        // set loading false
        this.isLoading = false;
        if(changeMode){
          this.setMode(this.mode);
        }
      },
      error:(err)=>{
        console.log("no saved prgress")
        // this.toastrService.error('Someting went wrong', 'Error');
        this.isLoading = false;
      }
    });
  }

  // update user answer 
  saveUserAnswers(status: 'IN_PROGRESS' | 'COMPLETED'){
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
      timeLeftInMinutes: this.mode === 'TEST'? this.timer / 60 : undefined,
      status:status
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

  // set exam mode
  setMode(mode: 'STUDY' | 'TEST') {
    // set mode
    this.mode = mode;

    if(this.mode === 'TEST' && this.userExamData?.testModeUserAnswers 
      && Object.entries(this.userExamData.testModeUserAnswers).length > 0)
    {
      this.showResumeExamDialog();
    } else if(this.mode === 'STUDY' && this.userExamData?.studyModeUserAnswers 
      && Object.entries(this.userExamData.studyModeUserAnswers).length > 0)
    {
      this.showResumeExamDialog();
    } else if (mode === 'TEST' && this.examDuration > 0) {
        clearInterval(this.interval);
        this.startTimer();
    }

    // clear and start exam
    this.userAnswers.clear();
    this.correctAnswers.clear();
    this.currentQuestionIndex = 0;
    this.showExplanation = false;
    this.examStarted = true;
    
  }

  // resume dialog
  showResumeExamDialog() {
    const dialog = this.matDialog.open(ResumeExamDialogComponent,{
      width: '500px',
      data:{
        answeredCount: this.mode === 'STUDY' 
          ? this.userExamData?.studyModeUserAnswers?.length
          : this.userExamData?.testModeUserAnswers?.length,
        total: this.questionList.length,
        mode: this.mode,
        lastUpdatedDate: this.userExamData?.lastModifiedDate,
        timeLeft: this.userExamData?.timeLeftInMinutes,
        score:this.getOldScore() as number,
        buttonName: this.getOldScore() === null ? 'Resume' : 'Review'
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

          if(this.getOldScore() !== null){
            this.isSubmitted = true;
          } else {
            // set time left
            this.examDuration = this.userExamData?.timeLeftInMinutes as number;
            //set time
            this.startTimer();
          }

        } else if (this.mode === 'STUDY') {
          this.userExamData?.studyModeUserAnswers?.forEach((item) => {
            this.userAnswers.set(item.questionId as string, item.choiceId as string);
          });
          this.userExamData?.studyModeCorrectAnswers?.forEach((item) => { 
            this.correctAnswers.set(item.questionId as string, item.isCorrect as boolean);
          });
          if(this.getOldScore() !== null){
            this.isSubmitted = true;
          }
        }
      } else {  // retake exam
        this.userAnswers.clear();
        this.correctAnswers.clear();
        if(this.mode === 'TEST'){
          this.examDuration = this.examDto?.duration as number;
          this.startTimer();
        }
      }
    });
  }

  // calculate score for previous finished exam
  getOldScore():number | null{
    if(this.mode === 'TEST' && 
      this.userExamData?.testModeCorrectAnswers?.length === this.questionList.length
    ){
      const score = this.userExamData?.testModeCorrectAnswers.filter(ca => ca.isCorrect).length;
      return score;
    } else if(this.mode === 'STUDY' && 
      this.userExamData?.studyModeCorrectAnswers?.length === this.questionList.length
    ){
      const socre = this.userExamData.studyModeCorrectAnswers.filter(ca => ca.isCorrect).length;
      return socre;
    }
    return null;
  }


  // start timer
  startTimer() {
    this.timer = this.examDuration * 60; // Convert minutes to seconds
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
        let score = 0;
        this.correctAnswers.forEach(isCorrect => {
          if (isCorrect) score++;
        });
        this.showResults(score);
        this.isSubmitted = true;
      }
    }, 1000); // every second
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

    // if (this.mode === 'STUDY') {
      const correctChoice = this.currentQuestion.choices?.find(c => c.isCorrect);
      const isCorrect = correctChoice?.id === choiceId;
      this.correctAnswers.set(this.currentQuestion.id as string, isCorrect);
    // }
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
          message:'you wants to submit the exam?',
          buttonName: 'submit',
          isWarning: false
        }
      });
      dialog.afterClosed().subscribe((result) => {
      if(result){
        clearInterval(this.interval);
        let score = 0;
        this.correctAnswers.forEach(isCorrect => {
          if (isCorrect) score++;
        });
        this.showResults(score);
        this.isSubmitted = true;
        // save user answers if user answers is greater than 3/4 of the questoin
        if(this.hasFullAccess && this.userAnswers.size >= (this.questionList.length * 3/4)){
          this.saveUserAnswers('COMPLETED');
        }
      }
      });
    } else if (this.mode === 'STUDY') { // study mode
      let score = 0;
      this.correctAnswers.forEach(isCorrect => {
        if (isCorrect) score++;
      });
      this.showResults(score);
      this.isSubmitted = true;
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
        buttonName: 'Retake',
        isWarning: false
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.userAnswers.clear();
        this.correctAnswers.clear();
        this.isSubmitted = false;
        if(this.mode === 'TEST'){
          clearInterval(this.interval);
          this.examDuration = this.examDto?.duration as number;
          this.startTimer();
        }
        this.currentQuestionIndex = 0;
        this.showExplanation = false;
        this.examStarted = true;
      }
    }
    ); 
  }

  // on mode change
  onModeChange() {
    // const mode = event.target.value;
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
        width: '400px',
        data:{
          message:`you wants change to ${this.mode} mode`,
          buttonName: 'change',
          isWarning: false
        }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        // save user answer if all question answered and the mode was test mode
        if(this.mode === 'STUDY'  // that is the previous mode was test mode
          && this.hasFullAccess 
          && this.userAnswers.size === this.questionList.length 
          && !this.isSubmitted)
        {
            this.saveUserAnswers('COMPLETED');
        }
        // clear and change mode
        this.examStarted = false;
        this.isSubmitted = false;
        clearInterval(this.interval);
        this.isLoading = true;
        if(this.hasFullAccess){
          this.fetchUserAnswers(true);
        } else {
          this.isLoading = false;
          this.setMode(this.mode);
        }
      } else {
        // back to previous mode
        this.mode = this.mode === 'STUDY' ? 'TEST' : 'STUDY';
      }
    });
  }

  // save progess
  saveAndExit(){
    if(this.hasFullAccess && this.userAnswers.size > 0){
      this.saveUserAnswers('IN_PROGRESS');
      clearInterval(this.interval);
      this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});

    }
  }

  // on close
  close(){
    if(!this.examStarted || this.isSubmitted || this.userAnswers.size === 0){
      clearInterval(this.interval);
      this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
      return;
    }
    // if exam started ask confirmation
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
      width: '400px',
      data:{
        message:'you want exit this exam?',
        buttonName: 'Exit',
        isWarning: true
      }
    });
    dialog.afterClosed().subscribe(result => {
      if(result){
        // if it has full access and answers all questions and in test mode
        if(this.hasFullAccess
          && this.mode === 'TEST' 
          && this.userAnswers.size === this.questionList.length 
          && !this.isSubmitted){
          this.saveUserAnswers('COMPLETED');
        }
        clearInterval(this.interval);
        this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
      }
    })
  }

  // scroll top on new question
  scrollToTop() {
    if (this.questionContainer) {
      this.questionContainer.nativeElement.scrollTop = 0;
    }
  }

  // compare subscription level
  isEqualOrHigherTier(requiredSubLevel: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const userIndex = this.subscriptionLevel ? tiers.indexOf(this.subscriptionLevel) : -1;
    const resourceIndex = tiers.indexOf(requiredSubLevel);
    return userIndex >= resourceIndex;
  }

  // toggle question lists on mobile view
  toggleQuestionsDrawer() {
    this.showQuestionsDrawer = !this.showQuestionsDrawer;
  }
}
