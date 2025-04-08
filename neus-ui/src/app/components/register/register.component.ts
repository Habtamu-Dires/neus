
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RegistrationDto } from '../../services/models';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterService, UsersService } from '../../services/services';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  errMsgs:Array<string> = [];
  confirmPassword = new FormControl('');
  passwordControl = new FormControl('');
  showPassConfError:boolean = false;
  showPassMandatoryError:boolean = false;
  showPassLenghtError:boolean = false;

  constructor(
    private registerService: RegisterService,
    private toastrService: ToastrService,
    private keycloakService:KeycloakService,
    private router:Router
  ) {}

  registrationDto:RegistrationDto = {
    email: '',
    password: '',
    username: ''
  };

  ngOnInit(): void {
   this.passwordFormControl();
   this.confirmPasswordControl();
  }

  // password form control
  passwordFormControl(){
    this.passwordControl.valueChanges
    .pipe(
      debounceTime(1000)
    ).subscribe((value:any)=>{
      const password = value as string;
      if(password.length >= 4) {
        this.showPassMandatoryError = false;
        this.showPassLenghtError = false;
        this.registrationDto.password = password;
        if(this.confirmPassword.value?.length !== 0 && 
          password !== this.confirmPassword.value )
        {
          this.showPassConfError = true;
        } else {
          this.showPassConfError = false;
        }
      } else {
        this.showPassLenghtError = true;
        this.showPassConfError =false;
        this.showPassMandatoryError =false;
      }
    })
  }
  
  
  //confirm password form control
  confirmPasswordControl(){
    this.confirmPassword.valueChanges
    .pipe(
      debounceTime(1000)
    ).subscribe((value:any)=>{
      const password = value as string;
      if(password.length >= 4){
        if(password !== this.registrationDto.password){
          this.showPassConfError = true;
        } else{
          this.showPassConfError = false;
        }
      } else {
        this.showPassConfError = true;
      }
    })
  }

  // on save
  onSave(){
    if(!this.registrationDto.password ||  this.registrationDto.password.length < 4){
      this.showPassMandatoryError = true;
    } else if(!this.showPassConfError) {
      this.register();
    }
  }

  // register
  register(){
    this.registerService.register({
      body: this.registrationDto
    }).subscribe({
      next: () => {
        this.toastrService.success('User registered successfully', 'Success');
        setTimeout(()=>{
          this.keycloakService.login();
        },500);
      },
      error: (err) => {
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        } else{
          console.log(err);
          this.toastrService.error(err.error.error, 'Ooops');
        }
      }
    })
  }

  // on cancel
  onCancel(){
    this.router.navigate(['user']);
  }
}
