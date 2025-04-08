import { Component } from '@angular/core';
import { KeycloakService } from '../../../services/keycloak/keycloak.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    private keyclaokService:KeycloakService
  ) {}

  signIn(){
    this.keyclaokService.login();
  }

}
