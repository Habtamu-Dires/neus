import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CreateQuestionDto, TextDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';
import { SharedStateService } from '../../../../services/shared-state/shared-state.service';
import { environment } from '../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ImagePreviewComponent } from '../../../../components/image-preview/image-preview.component';
import { VideoPreviewComponent } from '../../../../components/video-preview/video-preview.component';
import { QuillViewComponent } from 'ngx-quill';
import { FirefoxQuillViewPatchDirective } from '../../../../firefox-quill-view-patch.directive';


@Component({
  selector: 'app-create-question',
  imports: [CommonModule,FormsModule,QuillViewComponent,FirefoxQuillViewPatchDirective],
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent implements OnInit{
  
  createQuestionDto:CreateQuestionDto = {
    questionNumber: 1,
    choices:[],
    mediaUrls:[]
  }
  
  examId:string = '';
  title:string = '';
  examType:string = '';
  numberOfQuestions:number = 1;
  errMsgs:string[]=[];
  showBlockList:boolean = false;
  blockNumberList:String[] = [];
  showDepartmentList:boolean = false;
  departmentList:string[] = [];
  filteredDepartmentList:string[] = [];
  isUploading:boolean = false;
  selectedFile:any;

  @ViewChild('blockListElement') blockListElement!:ElementRef;

  constructor(
    private questionsService:QuestionsService,
    private activatedRoute:ActivatedRoute,
    private matDialog:MatDialog,
    private toastrService:ToastrService,
    public adminUxService:AdminUxService,
    private sharedStateService:SharedStateService,
    private http:HttpClient,
    private dialog:MatDialog
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.examId = params['examId']; 
      this.title =params['title'];
      this.examType=params['examType'];
      this.createQuestionDto.questionNumber = Number(params['numberOfQuestions']) + 1;
      this.createQuestionDto.examId = params['examId'];
    });

    // fill lists
    this.blockNumberList = this.sharedStateService.blockNumberList;
    this.departmentList = this.sharedStateService.departmentList;
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
          width: '70%',
          height: 'auto',
          data: { title: 'Edit Question', content: this.createQuestionDto.questionText },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createQuestionDto.questionText = result.content;
        if(result.mediaUrls.length > 0){
          this.createQuestionDto.mediaUrls?.push(...result.mediaUrls);
        }
      }
    });
  }

  // edit explanation
  editExplanation(){
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '70%',
      height: 'auto',
      data: { title: 'Edit Question', content: this.createQuestionDto.explanation },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createQuestionDto.explanation = result.content;
        if(result.mediaUrls.length > 0){
          this.createQuestionDto.mediaUrls?.push(...result.mediaUrls);
        }
      }
    });
  }

  // add choice
  addChoice() {
    const dialog = this.matDialog.open(EditDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '70%',
      height: 'auto',
      data: { title: 'Add new Choice', content: '' },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        const choiceText = result.content;
        const tempNumb = this.createQuestionDto.choices?.length;
        this.createQuestionDto.choices?.push({id:`${tempNumb}`,  text: choiceText, isCorrect: false });
        if(result.mediaUrls.length > 0){
          this.createQuestionDto.mediaUrls?.push(...result.mediaUrls);
        }
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
      width: '70%',
      height: 'auto',
      data: { title: 'Edit Choice', content: choice.text },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result && choice) {
        choice.text = result.content;
        if(result.mediaUrls.length > 0){
          this.createQuestionDto.mediaUrls?.push(...result.mediaUrls);
        }
      }
    });
  }

  // remove choice
  removeChoice(index: number) {
    if (this.createQuestionDto.choices && this.createQuestionDto.choices.length > 1) {
      this.createQuestionDto.choices?.splice(index, 1);
    }
  }
  
  // toggle correct
  toggleCorrect(index: number) {
    this.createQuestionDto.choices?.forEach((c, i) => (c.isCorrect = i === index)); // Single correct answer
  }

  // submit
  submit() {
    this.errMsgs = [];
    if(['USMLE_STEP_1','USMLE_STEP_2','ERMP'].includes(this.examType) && !this.createQuestionDto.department){
      this.errMsgs.push('Department is mandatory.')
      this.toastrService.error('Department is mandatory.');
      return;
    }
    if(['USMLE_STEP_1','USMLE_STEP_2'].includes(this.examType) && !this.createQuestionDto.blockNumber){
      this.errMsgs.push('Block is mandatory.')
      this.toastrService.error('Block is mandatory.');
      return;
    }
    // Ensure at least one choice is marked correct
    if (!this.createQuestionDto.choices?.some((c) => c.isCorrect)) {
      this.errMsgs.push('Please mark one choice as correct.')
      this.toastrService.error('Please mark one choice as correct.');
      return;
    } 

    this.createQuestion();
  }
  
  // on delete image
  onDeleteMedia(url:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '150px',
      data: { 
        message: 'Are you sure you want to delete this image?', 
        buttonName: 'Delete',
        isWarning: true
      },
    });
    // dialog after closed
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createQuestionDto.mediaUrls = this.createQuestionDto.mediaUrls?.filter(imgUrl => imgUrl !== url);
        this.deleteMedia(url);
      }
    });
  }
  
  // delete image
  deleteMedia(url:string){
    this.questionsService.deleteMedia({
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
        // console.log('URL copied to clipboard:', url);
        this.toastrService.success('Copied')
      }).catch(err => {
        console.error('Failed to copy URL:', err);
        this.toastrService.error('failed to copy url');
      });
    } else {
      // Fallback if clipboard API is not supported
      console.warn('Clipboard API not supported');
      this.toastrService.error('Clipboard API not supported');
    }
  }

  cancel() {
    if(this.createQuestionDto.mediaUrls && this.createQuestionDto.mediaUrls?.length > 0){
      this.errMsgs.push('Please delete uploaded images');
      return;
    }
    window.history.back();
  }

  // toogle showdrawer
  toggleShowDrawer(){
    this.adminUxService.toggleShowDrawerStatus();
  }

  // on Block number selected
  onBlockNumberSelected(block:any){
    this.createQuestionDto.blockNumber = block;
    this.showBlockList = false;
  }

  // on department selected
  onDepartmentSelected(department:any){
    this.createQuestionDto.department = department;
    this.showDepartmentList = false;
  }

  // on department search
  onDepartmentSearch(text:string){
    this.filteredDepartmentList = this.departmentList
    .filter(dep => dep.toLocaleLowerCase().startsWith(text.toLocaleLowerCase()));
  }

   //file methods
  onFileSelected(event:any){
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  uploadFile(){
    if(this.selectedFile){
      this.saveMedia(this.selectedFile);
    }
  }

  // upload
  saveMedia(file: any) {
    this.isUploading = true; // Show the loading animation
    const formData = new FormData();
    formData.append('file', file); 

    this.http.post<TextDto>(`${environment.apiUrl}/questions/upload-media`, formData) 
      .subscribe({
        next: (res: TextDto) => {
          this.isUploading = false; // Hide the loading animation
          const mediaUrl = res.value;
          if(mediaUrl){
            
            // push to image urls list
            this.createQuestionDto.mediaUrls?.push(mediaUrl);
            this.toastrService.success('Image uploaded Sucessfully');

            // clear the input 
            this.selectedFile = null;

          }
        },
        error: (err) => {
          this.isUploading = false; // Hide loading animation even on error
          console.error('Image upload failed:', err);
          this.toastrService.error('Image upload failed', 'Error');
        }
      });
  }
  resetFileInput(element:HTMLInputElement){
    element.value = '';
    this.selectedFile = null;
    //this.router.navigate(['admin', 'test'])
  }

  // view media
  // view image
  viewMedia(url:any){
    if (this.isImageUrl(url)) {
      this.openImageDialog(url);
    } else if (this.isVideoUrl(url)) {
      this.openVideoDialog(url);
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

  // on file type selected
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showBlockList && this.blockListElement && !this.blockListElement.nativeElement.contains(target)) {
      this.showBlockList = false;
    }    
  }

}
