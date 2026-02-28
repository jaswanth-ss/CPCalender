import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private msalService = inject(MsalService);
  private router = inject(Router);

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    this.restoreActiveAccount();
  }

  private restoreActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();

    if (activeAccount) {
      this.updateUser(activeAccount);
      this.isAuthenticatedSubject.next(true);
      return;
    }

  
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.updateUser(accounts[0]);
      this.isAuthenticatedSubject.next(true);
    }
  }

  private updateUser(account: any): void {
    const profile: UserProfile = {
      name: account.name || 'User',
      email: account.username || '',
      username: account.username || '',
      roles: account.idTokenClaims?.roles || [],
    };
    this.userProfileSubject.next(profile);
  }

  login(): void {
    this.isLoadingSubject.next(true);
    this.msalService.loginRedirect({
      scopes: ['openid', 'profile', 'user.read'],
    });
  }

  logout(): void {
    this.isLoadingSubject.next(true);
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/auth',
    });
  }

  getCurrentUser(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  async getAccessToken(): Promise<string> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      throw new Error('No active user account found');
    }

    try {
      const response = await firstValueFrom(
        this.msalService.acquireTokenSilent({
          scopes: ['user.read'],
          account,
        })
      );
      return response?.accessToken || '';
    } catch {
      this.login();
      return '';
    }
  }

  isLoggedIn(): boolean {
    return !!this.msalService.instance.getActiveAccount();
  }
}
