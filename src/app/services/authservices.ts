import { Injectable, signal } from '@angular/core';

import { Router } from '@angular/router';

import { Observable, of, BehaviorSubject } from 'rxjs';

import { User } from '../models/user.interface';

import { LoginCredentials } from '../models/logincredentsials.interface';

import { AuthResponse } from '../models/authResponse.interface';

import { Registerdata } from '../models/registerdata.interface';

import { HttpClient } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class Authservices {

  private currentUser = signal<User | null>(null);

  public currentUser$ = this.currentUser.asReadonly();

  private isAuthenticated = new BehaviorSubject<boolean>(false);

  public isAuthenticated$ = this.isAuthenticated.asObservable();


  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuth();
  }


  private checkAuth(): void {

    const token = localStorage.getItem('auth_token');

    const userString = localStorage.getItem('user');

    if (token && userString) {

      try {

        const user = JSON.parse(userString);

        this.currentUser.set(user);

        this.isAuthenticated.next(true);

      } catch (error) {
        this.logout();
      }
    }
  }


  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.get<User[]>(`${API_URL}/users?email=${credentials.email}&password=${credentials.password}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('Invalid credentials');
          }

          const user = users[0];
          const token = 'token-' + Date.now();

          const response: AuthResponse = {
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio,
              createdAt: new Date(user.createdAt)
            }
          };

          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.next(true);

          return response;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }




  register(data: Registerdata): Observable<AuthResponse> {
    return this.http.get<User[]>(`${API_URL}/users?email=${data.email}`)
      .pipe(
        switchMap((existingUsers: User[]) => {
          if (existingUsers.length > 0) {
            return throwError(() => new Error('Email already exists'));
          }

          const newUser = {
            username: data.username,
            email: data.email,
            password: data.password,
            avatar: '/free-icon-profile-7710521.png',
            bio: '',
            createdAt: new Date().toISOString()
          };

          return this.http.post<User>(`${API_URL}/users`, newUser);
        }),
        map((user: User) => {
          const token = 'token-' + Date.now();

          const response: AuthResponse = {
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio || '',
              createdAt: new Date(user.createdAt)
            }
          };

          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.next(true);

          return response;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }


  logout(): void {

    localStorage.removeItem('auth_token');

    localStorage.removeItem('user');

    this.currentUser.set(null);

    this.isAuthenticated.next(false);

    this.router.navigate(['/login']);
  }


   public isAuthenticate(): boolean {

    return this.isAuthenticated.value;
  }




  getCurrentUser(): User | null {

    return this.currentUser();
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${API_URL}/users/${id}`)
      .pipe(
        map((userData: any) => {

          const user: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
            bio: userData.bio || '',
            createdAt: new Date(userData.createdAt)
          };
          console.log('✅ Mapped user:', user);
          return user;
        }),
        catchError(error => {
          console.error('❌ Error in getUserById:', error);
          return throwError(() => error);
        })
      );
  }

  updateCurrentUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateUser(id: string | number, data: { username?: string; bio?: string; avatar?: string }): Observable<User> {
    return this.http.patch<any>(`${API_URL}/users/${id}`, data).pipe(
      map((userData) => {
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          bio: userData.bio || '',
          createdAt: new Date(userData.createdAt)
        };
        return user;
      }),
      catchError((error) => {
        console.error('❌ Error in updateUser:', error);
        return throwError(() => error);
      })
    );
  }
}
