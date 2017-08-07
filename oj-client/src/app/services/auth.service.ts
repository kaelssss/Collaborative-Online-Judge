import { Injectable } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { Router } from '@angular/router';

declare var Auth0Lock: any;

@Injectable()
export class AuthService {

  clientId: string = 'KsvtvTf6dbzfCf6sEQR963g73c2GRnJX';
  domain: string = 'kaelssss.auth0.com';
  lock = new Auth0Lock(this.clientId, this.domain, {});

  constructor(private router: Router) {
  }

  public login() {
    // this.lock.show() is to show the navbar to the user
    // the logging takes time so we put it in promised way
    // after logging in, users' profile(flattened) and id_tkn should be in localStorage
    return new Promise((resolve, reject) => {
      this.lock.show((error: string, profile: Object, id_token: string) => {
        if (error) {
          reject(error);
        } else {
          localStorage.setItem('profile', JSON.stringify(profile));
          localStorage.setItem('id_token', id_token);
          resolve(profile);
        }
      });
    })
  }

  public authenticated() {
    // use ang jwt tool to see if this client's id_tkn is exped
    return tokenNotExpired('id_token');
  }

  public logout() {
    // throw up his id_tkn and profile and nav back to homepage
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    this.router.navigate(['/']);
  }

  public getProfile(): Object {
    return JSON.parse(localStorage.getItem('profile'));
  }
}