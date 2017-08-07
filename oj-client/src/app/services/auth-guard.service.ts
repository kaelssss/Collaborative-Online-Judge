import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
// so that at the app's client side routing,
// some url can use this service to asg their 'canActivate'
export class AuthGuardService implements CanActivate {

  constructor(@Inject('auth') private auth,
              private router: Router) { }
  
  canActivate(): boolean {
    if(this.auth.authenticated()) return true;
    else {
      this.router.navigate(['/']);
      return false;
    }
  }

  isAdmin(): boolean {
    if(this.auth.authenticated() && this.auth.getProfile().roles.includes('admin')) return true;
    else return false;
  }
}
