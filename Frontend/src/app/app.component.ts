import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  username: string | null = null;
  userId: string | null = null;
  role: string | null = null;
  private authSubscription: Subscription | null = null; 

  constructor(public authService: AuthService) {}


  ngOnInit(): void {
    this.updateUserInfo();
    this.authSubscription = this.authService.userInfoUpdated.subscribe(() => {
      this.updateUserInfo();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateUserInfo(): void {
    const userInfo = this.authService.getUserInfo();
    this.username = userInfo.username;
    this.userId = userInfo.userId;
    this.role = userInfo.role;
  }
}
