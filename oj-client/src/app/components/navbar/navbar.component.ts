import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  username: string = '';
  brand: string = 'col ol jdg';

  constructor(@Inject('auth') private auth) {
    // case: reopen this page in browser
    if(this.auth.authenticated()) {
      this.username = this.auth.getProfile().nickname;
    }
  }

  ngOnInit() {
  }

  login(): void {
    this.auth.login().then(profile => {
      this.username = profile.nickname;
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
