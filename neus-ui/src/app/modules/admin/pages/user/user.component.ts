import { Component, HostListener, OnInit } from '@angular/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { HeaderComponent } from "../../components/header/header.component";
import { CommonModule } from '@angular/common';
import { UserDto } from '../../../../services/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { UsersService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user',
  imports: [PaginationComponent, HeaderComponent,CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  userList:UserDto[] = [];
  showActions:boolean = false;
  selectedUserId:string | undefined;
  // pagination
  page:number = 0;
  size:number = 5;
  isEmptyPage: boolean = true;
  isFirstPage: boolean |undefined; 
  isLastPage: boolean |undefined;
  totalPages: number | undefined;
  totalElements: number | undefined;
  numberOfElements: number | undefined;

  constructor(
    private userService:UsersService,
    private matDialog:MatDialog,
    private toastr:ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchPageOfUsers();
  }

  // fetch page of users
  fetchPageOfUsers(){
    this.userService.getPageOfUsers({
      'page': this.page,
      'size': this.size
    }).subscribe({
      next: (response) => {
        this.userList = response.content as UserDto[];

        //pagination
        this.isFirstPage = response.first;
        this.isLastPage = response.last;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.numberOfElements = response.numberOfElements;
        this.isEmptyPage = response.empty as boolean;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('Error fetching users', 'Error')
      }
    });
  }

  // on show action
  onShowActions(userId:any){
    this.selectedUserId =  userId as string;
    this.showActions = true;
  }


  // on search 
  onSearch(text:any){
    console.log(text);
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
