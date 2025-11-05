import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080';


  loginWithGoogle() {
    window.location.href = `${this.api}/oauth2/authorization/google`;
  }


  logout() {
    window.location.href = `${this.api}/logout`;
  }
}
