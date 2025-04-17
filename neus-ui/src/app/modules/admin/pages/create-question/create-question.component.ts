import { Component, OnInit } from '@angular/core';
import { CreateQuestionDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';

@Component({
  selector: 'app-create-question',
  imports: [CommonModule,FormsModule],
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent implements OnInit{
  
  createQuestionDto:CreateQuestionDto = {
    questionNumber: 1,
    choices:[],
    imgUrls:[]
  }
  
  examId:string = '';
  title:string = '';
  numberOfQuestions:number = 1;
  errMsgs:string[]=[];
  onShowDrawer:boolean =false;

  constructor(
    private questionsService:QuestionsService,
    private activatedRoute:ActivatedRoute,
    private matDialog:MatDialog,
    private toastrService:ToastrService,
    private adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.examId = params['examId']; 
      this.title =params['title'];
      this.createQuestionDto.questionNumber = Number(params['numberOfQuestions']) + 1;
      this.createQuestionDto.examId = this.examId;
    });

    // on show drawer status
    this.adminUxService.showDrawer$.subscribe((onShowDrawer:boolean)=>{
      this.onShowDrawer = onShowDrawer;
    });
  }

  // create question
  createQuestion(){
    this.questionsService.createQuestions({
      body: this.createQuestionDto
    }).subscribe({
      next:()=>{
        this.toastrService.success('Successful created question', 'Done');
        // this.router.navigate(['/admin/questions', {queryP}])
        window.history.back();
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

  // get choice letter
  getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
  
  // edit question
  editQuestion(){
    const dialog = this.matDialog.open(EditDialogComponent, {
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '65%',
          height: 'auto',
          data: { title: 'Edit Question', content: this.createQuestionDto.questionText },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createQuestionDto.questionText = result.content;
        if(result.imageUrls.length > 0){
          this.createQuestionDto.imgUrls?.push(...result.imageUrls);
        }
      }
    });
  }

  // edit explanation
  editExplanation(){
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '65%',
      height: 'auto',
      data: { title: 'Edit Question', content: this.createQuestionDto.explanation },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createQuestionDto.explanation = result.content;
        if(result.imageUrls.length > 0){
          this.createQuestionDto.imgUrls?.push(...result.imageUrls);
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
        this.createQuestionDto.choices?.push({ text: choiceText, isCorrect: false });
      }
    });    
  }

  // edit choice
  editChoice(index: number) {
    const choice = this.createQuestionDto.choices?.find((v,i)=> i == index);
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
          this.createQuestionDto.imgUrls?.push(...result.imageUrls);
        }
      }
    });
  }

  removeChoice(index: number) {
    if (this.createQuestionDto.choices && this.createQuestionDto.choices.length > 1) {
      this.createQuestionDto.choices?.splice(index, 1);
    }
  }

  toggleCorrect(index: number) {
    this.createQuestionDto.choices?.forEach((c, i) => (c.isCorrect = i === index)); // Single correct answer
  }

  // submit
  submit() {
    // Ensure at least one choice is marked correct
    if (!this.createQuestionDto.choices?.some((c) => c.isCorrect)) {
      this.errMsgs.push('Please mark one choice as correct.')
      return;
    }
    this.createQuestion();
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
          this.createQuestionDto.imgUrls = this.createQuestionDto.imgUrls?.filter(imgUrl => imgUrl !== url);
          this.deleteImage(url);
        }
      });
    }
  
    // delete image
    deleteImage(url:string){
      this.questionsService.deleteImage({
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

  cancel() {
    if(this.createQuestionDto.imgUrls && this.createQuestionDto.imgUrls?.length > 0){
      this.errMsgs.push('Please delete uploaded images');
      return;
    }
    window.history.back();
  }

  // toogle showdrawer
  toggleShowDrawer(){
    this.onShowDrawer = !this.onShowDrawer;
    this.updateShowDrawerStatus();
  }

  // update showDrawer status
  updateShowDrawerStatus(){
    this.adminUxService.updateShowDrawerStatus(this.onShowDrawer);
  }
}
