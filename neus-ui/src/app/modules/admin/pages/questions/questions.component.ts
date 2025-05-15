import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { CreateChoiceDto, CreateQuestionDto, QuestionDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';
import { QuestionsService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { ViewChild, ElementRef } from '@angular/core';
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component';
import { SharedStateService } from '../../../../services/shared-state/shared-state.service';

@Component({
  selector: 'app-questions',
  imports: [CommonModule, FormsModule],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css'
})
export class QuestionsComponent {
  examId: string | undefined;
  title:string='';
  examType:string='';
  questionList: QuestionDto[] = []; 
  currentQuestionIndex: number = 0;
  showExplanation:boolean = false;
  errMsgs:string[]=[];
  showBlockList:boolean = false;
  blockNumberList:String[] = [];
  showDepartmentList:boolean = false;
  departmentList:string[] = [];
  filteredDepartmentList:string[] = [];

  constructor(
    private qustionsService:QuestionsService,
    private activatedRoute: ActivatedRoute, 
    private matDialog: MatDialog,
    public adminUxService:AdminUxService,
    private router:Router,
    private toastrService:ToastrService,
    private sharedStateService:SharedStateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.examId = params['examId']; // Get exam ID from route
      this.title =params['title'];
      this.examType = params['examType']
      this.fetchQuestionByExamId(); // Replace with API call later
    });

    // fill lists
    this.blockNumberList = this.sharedStateService.blockNumberList;
    this.departmentList = this.sharedStateService.departmentList;

  }

  @ViewChild('questionContainer') questionContainer!: ElementRef;


  // fetch questoin by exam id
  fetchQuestionByExamId(){
    this.qustionsService.getQuestionsByExamId({
      'exam-id': this.examId as string
    }).subscribe({
      next:(res)=>{
        this.questionList = res;
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Something went wrong', 'Error');
      }
    })
  }

  // update question
  onUpdateQuestion(){
    const createQuestionDto:CreateQuestionDto = {
      id: this.currentQuestion.id,
      examId:this.currentQuestion.examId,
      questionNumber: this.currentQuestion.questionNumber as number,
      questionText: this.currentQuestion.questionText,
      explanation:this.currentQuestion.explanation,
      choices: this.currentQuestion.choices as CreateChoiceDto[],
      imgUrls: this.currentQuestion.imgUrls,
      department: this.currentQuestion.department,
      blockNumber: this.currentQuestion.blockNumber
    }
    if (!this.currentQuestion.choices?.some((c) => c.isCorrect)) {
      this.errMsgs.push('Please mark one choice as correct.')
      this.toastrService.error('Please mark one choice as correct.');
      return;
    }
    this.updateQuestion(createQuestionDto);
  }

  // update questions
  updateQuestion(createQuestionDto:CreateQuestionDto){
    // update question
    this.qustionsService.updateQuestion({
      body: createQuestionDto
    }).subscribe({
      next:(res)=>{
          this.toastrService.success('successfully update the question')
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error("Couldn't update the question", 'Error');
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
    this.errMsgs = [];
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

  // create new question
  createNewQuestion() {
    this.router.navigate(['admin','create-question'],
        {queryParams:{
          'examId': this.examId, 
          'title': this.title, 
          'numberOfQuestions': this.questionList.length,
          'examType': this.examType
        }});
  }

  // edit question
  editQuestion() {
    console.log("hoha hoha")
    console.log(this.currentQuestion.questionText);
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '65%',
      height: 'auto',
      autoFocus: true,
      data: {id:this.currentQuestion.id, title: 'Edit Question', content: this.currentQuestion.questionText },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.currentQuestion.questionText = result.content;
        if(result.imageUrls.length > 0){
          this.currentQuestion.imgUrls?.push(...result.imageUrls);
        }
      }
    });
  }

  // edit choice
  editChoice(id: any) {
    const choice = this.currentQuestion.choices?.find(c => c.id === id);
    if (!choice) return;
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '65%',
      height: 'auto',
      data: { title: 'Edit Choice', content: choice.text },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result && choice) {
        choice.text = result.content;
        if(result.imageUrls.length > 0){
          this.currentQuestion.imgUrls?.push(...result.imageUrls);
        }
      }
    });
  }

  // add choice
  addChoice() {
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '65%',
      height: 'auto',
      data: { title: 'Add new Choice', content: '' },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        const choiceText = result.content;
        const choices = this.currentQuestion.choices || [];
        this.currentQuestion.choices?.push({id: String(choices.length),  text: choiceText, isCorrect: false });
        if(result.imageUrls.length > 0){
          this.currentQuestion.imgUrls?.push(...result.imageUrls);
        }
      }
    });    
  }

  // edit explanation
  editExplanation() {
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '65%',
      height: 'auto',
      data: {id:this.currentQuestion.id, title: 'Edit Explanation', content: this.currentQuestion.explanation },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.currentQuestion.explanation = result.content;
        if(result.imageUrls.length > 0){
          this.currentQuestion.imgUrls?.push(...result.imageUrls);
        }
      }
    });
  }

  // on delete question
  onDeleteQuestion() {
    const dialog = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '150px',
      data: { 
        message: 'Are you sure you wants to delete the question', 
        buttonName: 'Delete',
        isWarning: true
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        // delete all images in the question
        this.currentQuestion.imgUrls?.forEach(img => {
          this.deleteImage(img);
        })
        this.deleteQuestion(this.currentQuestion.id as string);
      }
    });
  }

  // delete question
  deleteQuestion(questionId:string){
    this.qustionsService.deleteQuestion({
      'question-id': questionId
    }).subscribe({
      next:()=>{
        this.toastrService.success('Successfull delete the question', 'Done');
        this.questionList = this.questionList.filter(c => c.id !== this.currentQuestion.id);
        this.currentQuestionIndex = this.currentQuestionIndex > 0 ? this.currentQuestionIndex -1 : 0;
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error("Couldn't delete the question", 'Error');
      }
    })
  }

  // delete choice
  deleteChoice(id: any) {
    const dialog = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '150px',
      data: { 
        message: 'Are you sure you want to delete this choice?', 
        buttonName: 'Delete',
        isWarning: true
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        if(this.currentQuestion.choices?.length !== 1){
          this.currentQuestion.choices = this.currentQuestion?.choices?.filter(c=> c.id !== id);
        } else {
          this.toastrService.error('Minimum one choice is mandatory', 'Error');
        }
      }
    });
  }

  // view image
  viewImage(url:any){
    this.matDialog.open(ImageViewerComponent, {
      width: '400px',
      height: '150px',
      data: { 
        imageUrl:url
      },
    });
    
  }

  // on delete image
  onDeleteImage(url:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '150px',
      data: { 
        message: 'Are you sure you want to delete this image?', 
        buttonName: 'Delete',
        isWarning: true
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.currentQuestion.imgUrls = this.currentQuestion.imgUrls?.filter(imgUrl => imgUrl !== url);
        this.deleteImage(url);
      }
    });
  }

  // delete image
  deleteImage(url:string){
    this.qustionsService.deleteImage({
      'url':url 
    }).subscribe({
      next:()=>{
        this.toastrService.success('Image deleted','Done');
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error("Couldn't delete image", 'Error');
      }
    })
  }

  // on copy image
  onCopyUrl(url:any){
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        console.log('URL copied to clipboard:', url);
        this.toastrService.success('Copied')
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    } else {
      // Fallback if clipboard API is not supported
      console.warn('Clipboard API not supported');
    }
  }


  // toogle showdrawer
  toggleShowDrawer(){
    this.adminUxService.toggleShowDrawerStatus();
  }

  // scroll top
  scrollToTop() {
    if (this.questionContainer) {
      this.questionContainer.nativeElement.scrollTop = 0;
    }
  }

  // on Block number selected
  onBlockNumberSelected(block:any){
    this.currentQuestion.blockNumber = block;
    this.showBlockList = false;
  }

  // on department selected
  onDepartmentSelected(department:any){
    this.currentQuestion.department = department;
    this.showDepartmentList = false;
  }

  // on department search
  onDepartmentSearch(text:string){
    this.filteredDepartmentList = this.departmentList
    .filter(dep => dep.toLocaleLowerCase().startsWith(text.toLocaleLowerCase()));
  }
}
