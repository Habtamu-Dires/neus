import { Component, HostListener, OnInit } from '@angular/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { HeaderComponent } from "../../components/header/header.component";
import { CommonModule, DatePipe } from '@angular/common';
import { UserDto } from '../../../../services/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { UsersService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';

@Component({
  selector: 'app-user',
  imports: [PaginationComponent, HeaderComponent,CommonModule],
  providers:[DatePipe],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  userList:UserDto[] = [];
  showActions:boolean = false;
  selectedUserId:string | undefined;
  isLoading:boolean=true;
  // pagination
  page:number = 0;
  size:number = 5;
  isEmptyPage: boolean = true;
  isFirstPage: boolean |undefined; 
  isLastPage: boolean |undefined;
  totalPages: number | undefined;
  totalElements: number | undefined;
  numberOfElements: number | undefined;
  //filter
  emailFilter:string | undefined;
  subLevelFilter:string | undefined;
  

  constructor(
    private userService:UsersService,
    private matDialog:MatDialog,
    private toastr:ToastrService,
    private datePipe:DatePipe,
    private adminUxService:AdminUxService
  ) { }

  ngOnInit(): void {
    this.page = this.adminUxService.userPageNo();
    this.fetchPageOfUsers();
  }

  // fetch page of users
  fetchPageOfUsers(){
    this.userService.getPageOfUsers({
      'page': this.page,
      'size': this.size
    }).subscribe({
      next: (res) => {
        this.userList = res.content as UserDto[];
        this.isLoading=false;
        //pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
        // update page number
        this.adminUxService.updateExamPageNo(this.page);
      },
      error: (error) => {
        this.isLoading=false;
        console.log(error);
        this.toastr.error('Error fetching users', 'Error')
      }
    });
  }

  // filter user
  filterUser(){
    this.userService.filterUser({
      'email': this.emailFilter,
      'subLevel': this.subLevelFilter
    }).subscribe({
      next:(res)=>{
        this.userList = res.content as UserDto[];
        //pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // on show action
  onShowActions(userId:any){
    this.selectedUserId =  userId as string;
    this.showActions = true;
  }

  // on delete user
  onDelete(userId:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
      width: '400px',
      data:{
        message:'you wants to delete this user',
        buttonName: 'Delete',
        isWarning: true
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.deleteSelectedUser(userId)
        console.log('user deleted');
      }
    });
  }

  //delete selected user
  deleteSelectedUser(userId:string){
    this.userService.deleteUser({
      "user-id": userId
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.fetchPageOfUsers();
        this.toastr.success('User deleted successfully', 'Success')
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('Error deleting user', 'Error')
      }
    });
  }

  // toggle active satus
  onToggleEnabledStatus(userId:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
      width: '400px',
      data:{
        message:'you wants to toggle this user status',
        buttonName: 'Toggle',
        isWarning: true
      }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.toggleUserStatus(userId)
        console.log('user status toggled');
      }
    });
  }

  // toggle user status
  toggleUserStatus(userId:string){
    this.userService.toggleUserStatus({
      "user-id": userId
    }).subscribe({
      next: () => { 
        this.fetchPageOfUsers();
        this.toastr.success('User status toggled successfully', 'Success')
      }
      ,error: (error) => {
        console.log(error);
        this.toastr.error('Error toggling user status', 'Error')
      }
    });
  }

  // convert date format 
  formatDate(dateTime:any){
    if(dateTime){
      const date = new Date(dateTime as string);
      return this.datePipe.transform(date, 'MMM dd, yyyy');
    }
    return '';
  }

  // on search 
  onSearch(text:any){
    if(text.length >=3){
      this.emailFilter = text;
      this.filterUser();
    } else {
      this.fetchPageOfUsers();
    }
  }

  // on subl level filter
  onSubLevelFilter(level:string){
    this.subLevelFilter = level;
    this.filterUser();
  }

  // pagination
  onSizeChanged(size:number){
    this.size=size;
    this.fetchPageOfUsers();
  }

  onPageChanged(page:number){
    this.page=page;
    this.fetchPageOfUsers();
  }

  // hide delete & edit btn onclick outside the btn
  @HostListener('document:click', ['$event'])
  hideDeleteBtn(event: MouseEvent){
    const target = event.target as HTMLElement;
    if(!target.classList.contains('donthide')){
      this.showActions = false;
    }
  }

}
