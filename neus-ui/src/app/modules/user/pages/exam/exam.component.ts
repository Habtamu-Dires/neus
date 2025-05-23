import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService, UserExamService } from '../../../../services/services';
import { ExamDetailDto, QuestionDetailDto, QuestionDto, UpdateUserExamDto, UserDto, UserExamDto } from '../../../../services/models';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionListDrawerComponent } from '../../components/question-list-drawer/question-list-drawer.component';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { ExamResultDialogComponent } from '../../components/exam-result-dialog/exam-result-dialog.component';
import { ResumeExamDialogComponent } from '../../components/resume-exam-dialog/resume-exam-dialog.component';
import { ImagePreviewComponent } from '../../../../components/image-preview/image-preview.component';
import { VideoPreviewComponent } from '../../../../components/video-preview/video-preview.component';
import { QuillViewComponent } from 'ngx-quill';
import { FirefoxQuillViewPatchDirective } from '../../../../firefox-quill-view-patch.directive';


@Component({
  selector: 'app-exam',
  imports: [CommonModule, FormsModule, QuestionListDrawerComponent, QuillViewComponent,FirefoxQuillViewPatchDirective],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent {

  examId:string | undefined;
  mode: 'TEST' | 'STUDY' | undefined;
  department:string | undefined;
  blockNumber:string | undefined;
  title:string | undefined;
  examDto:ExamDetailDto | undefined;
  questionList: QuestionDetailDto[] = []; 
  currentQuestionIndex: number = 0;
  showExplanation:boolean = false;
  userAnswers: Map<string, string> = new Map(); // questionId -> selectedChoiceId
  correctAnswers: Map<string, boolean> = new Map(); // questionId -> isCorrect
  timer: number = 0; // Remaining time in seconds
  examDuration: number = 0; // Duration in minutes from backend
  interval: any;
  examStarted: boolean = false;
  isLoading:boolean = true;
  isSubmitted:boolean = false;
  isAuthenticated:boolean = false;
  hasFullAccess:boolean = false;
  userExamData: UserExamDto | undefined;  // saved answers
  showQuestionsDrawer:boolean = false;
  subscriptionLevel:string | null = null;
  resourceNotFound:boolean = false;

  @ViewChild('questionContainer') questionContainer!: ElementRef;

  constructor(
    private activatedRoute:ActivatedRoute,
    private examsService:ExamsService,
    private router:Router,
    private toastrService:ToastrService,
    private keycloakService:KeycloakService,
    private dialog: MatDialog,
    private userExamService:UserExamService,
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.examId = params['examId'];
      this.mode = params['mode'];
        // get query params from query 
        this.activatedRoute.queryParams.subscribe((params) => {
          this.department = params['department'];
          this.blockNumber = params['block'];           
            if(this.examId){
              this.fetchExamDetail(this.examId);
            }
        });
    });

    // Check login status
    this.isAuthenticated = this.keycloakService.isAuthenticated;
    if (this.isAuthenticated) {
      const subscriptionType = this.keycloakService.subscriptionLevel as string;
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
      'exam-id': examId,
      'department': this.department,
      'block': this.blockNumber
    }).subscribe({
      next:(res:ExamDetailDto)=>{
        this.examDto = res;
        this.questionList = res.questions as QuestionDto[];
        this.examDuration = res.duration as number;
        this.title = res.title;
        console.log("the content " + this.questionList[0].questionText);
        if(this.questionList.length === 0){
          this.resourceNotFound = true;
          this.isLoading = false;
        } else {
          // check access status
          this.hasFullAccess = this.isEqualOrHigherTier(res.requiredSubLevel as string);
          // if logged in and has full access
          if(this.isAuthenticated && this.hasFullAccess && this.mode === 'TEST') {
            // fetch previous user answers
            this.fetchUserAnswers();
          } else {
            if(this.mode === 'TEST') this.isLoading=false; // show exam-info section
            else this.startExam();  // start exam
          }        
        }
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Someting went wrong', 'Error');
      }
    })
  }

  // fetch previous user answers
  fetchUserAnswers(changeMode:boolean = false){
    this.userExamService.getUserAnswers({
      'exam-id': this.examId as string
    }).subscribe({
      next:(res:UserExamDto)=>{
        this.userExamData = res;
        if(this.userExamData?.testModeUserAnswers 
            && Object.entries(this.userExamData.testModeUserAnswers).length > 0
          ){
            this.isLoading = false;
            // this.examStarted = true;
            this.showResumeExamDialog();
        } else {
          // show exam-info or start exam
          if(this.mode === 'TEST') this.isLoading=false; // show exam-info section
          else this.startExam();
        }
      },
      error:(err)=>{
        console.log("no saved prgress");
        // show exam-info or start exam
        if(this.mode === 'TEST') this.isLoading=false; // show exam-info section
        else this.startExam();
      }
    });
  }

  // start exam
  startExam(){
    this.isLoading = false;
    this.userAnswers.clear();
    this.correctAnswers.clear();
    if(this.mode === 'TEST'){
      clearInterval(this.interval);
      this.examDuration = this.examDto?.duration as number;
      this.startTimer();
    }
    this.isSubmitted = false;
    this.currentQuestionIndex = 0;
    this.showExplanation = false;
    this.examStarted = true;
  }

  // resume dialog
  showResumeExamDialog() {
    const dialog = this.dialog.open(ResumeExamDialogComponent,{
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
          //start exam
          this.examStarted=true;
          
          if(this.getOldScore() !== null){
            this.isSubmitted = true;
          } else {
            // set time left
            this.examDuration = this.userExamData?.timeLeftInMinutes as number;
            //set time
            this.startTimer();
          }

        } 
      } else {  // retake exam
        // this.startExam();
        if(this.mode === 'STUDY') {
          this.startExam();
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
    } 
    return null;
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
    if(this.hasFullAccess && this.isAuthenticated){
      this.userExamService.saveUserAnswers({
        body: request,
      }).subscribe({
        next:(res:UserExamDto)=>{
         if(status === 'IN_PROGRESS'){
           this.toastrService.success('Progress saved successfully');
         }
        },
        error:(err)=>{
          console.log(err);
          if(status === 'IN_PROGRESS'){
            this.toastrService.error('Unable to save progress');
          }
        }
      })
    }
    
  }

  // select answer
  selectAnswer(choiceId:any){
    this.userAnswers.set(this.currentQuestion.id as string, choiceId);
    const correctChoice = this.currentQuestion.choices?.find(c => c.isCorrect);
    const isCorrect = correctChoice?.id === choiceId;
    this.correctAnswers.set(this.currentQuestion.id as string, isCorrect);
  }

  // submit exam
  submitExam(){
    if (this.mode === 'TEST') {
      const dialog = this.dialog.open(ConfirmDialogComponent,{
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
        if(this.isAuthenticated && this.hasFullAccess && this.userAnswers.size >= (this.questionList.length * 3/4)){
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
      // save user answers if user answers all questions
      // if(this.isAuthenticated && this.hasFullAccess && this.userAnswers.size === this.questionList.length){
      //   this.saveUserAnswers('COMPLETED');
      // }
    }
  }

  // show results
  showResults(score: number) {
    this.dialog.open(ExamResultDialogComponent, {
      width: '400px',
      data: {
        score:score,
        total: this.questionList.length,
        mode: this.mode,
      }
    });
  }

  // retake exam
  retakeExam(){
    const dialog = this.dialog.open(ConfirmDialogComponent,{
      width: '400px',  
      data:{
        message:'you wants to retake the exam?',
        buttonName: 'Retake',
        isWarning: false
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.startExam();
      }
    }
    ); 
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

   // save and exit 
  saveAndExit(){
    if(this.mode === 'TEST' && this.isAuthenticated && this.hasFullAccess && this.userAnswers.size > 0){
      this.saveUserAnswers('IN_PROGRESS');
      clearInterval(this.interval);
      this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
    }
  }

  // clsoe 
  close(){
    if(!this.examStarted || this.isSubmitted || this.userAnswers.size === 0){
      clearInterval(this.interval);
      this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
      return;
    }
    // if exam started ask confirmation
    const dialog = this.dialog.open(ConfirmDialogComponent,{
      width: '400px',
      data:{
        message:'you want exit this exam?',
        buttonName: 'Exit',
        isWarning: true
      }
    });
    dialog.afterClosed().subscribe(result => {
      if(result){
        // if it has full access and answers all questions 
        if( this.mode === 'TEST'
          && this.isAuthenticated && this.hasFullAccess
          && this.userAnswers.size === this.questionList.length 
          && !this.isSubmitted
        ){
          this.saveUserAnswers('COMPLETED');
        }
        clearInterval(this.interval);
        this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
      }
    })
  }

  // start timer
  startTimer() {
    this.timer = this.examDuration * 60; // Convert minutes to seconds
    // interval
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

  // compare subscription level
  isEqualOrHigherTier(requiredSubLevel: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const userIndex = this.subscriptionLevel ? tiers.indexOf(this.subscriptionLevel) : -1;
    const resourceIndex = tiers.indexOf(requiredSubLevel);
    return userIndex >= resourceIndex;
  }

  // scroll top on new question
  scrollToTop() {
    if (this.questionContainer) {
      this.questionContainer.nativeElement.scrollTop = 0;
    }
  }

  // toggle question lists on mobile view
  toggleQuestionsDrawer() {
    this.showQuestionsDrawer = !this.showQuestionsDrawer;
  } 

  // format time
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  }

  // open image and dialog images
  handleLinkClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href) {
        if (this.isImageUrl(href)) {
          event.preventDefault();
          this.openImageDialog(href);
        } else if (this.isVideoUrl(href)) {
          event.preventDefault();
          this.openVideoDialog(href);
        }
      }
    }
  }
  // is image url
  isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
    const ext = url.split('.').pop()?.toLowerCase();
    return ext ? imageExtensions.includes('.' + ext) : false;
  }

  // is video url
  isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const ext = url.split('.').pop()?.toLowerCase();
    return ext ? videoExtensions.includes('.' + ext) : false;
  }
  
  // open image dialog
  openImageDialog(url: string) {
    this.dialog.open(ImagePreviewComponent, {
      data: { url: url },
      maxWidth: '80vw',
      maxHeight: '80vh',
    });
  }
  
  // open video dialog
  openVideoDialog(url: string) {
    this.dialog.open(VideoPreviewComponent, {
      data: { url: url },
      maxWidth: '70vw',
      maxHeight: '70vh',
    });
  }

  
}
