import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Follow } from '../models/follow.interface';
import { Authservices } from './authservices';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  constructor(
    private http: HttpClient,
    private authService: Authservices
  ) {}

  follow(userId: string | number): Observable<Follow> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const follow: Omit<Follow, 'id' | 'createdAt'> = {
      followerId: currentUser.id,
      followingId: userId
    };

    return this.http.post<Follow>(`${API_URL}/follows`, {
      ...follow,
      createdAt: new Date().toISOString()
    });
  }

  unfollow(userId: string | number): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.get<Follow[]>(`${API_URL}/follows?followerId=${currentUser.id}&followingId=${userId}`).pipe(
      switchMap(follows => {
        if (follows.length === 0) {
          return of(void 0);
        }
        return this.http.delete<void>(`${API_URL}/follows/${follows[0].id}`);
      }),
      catchError(() => of(void 0))
    );
  }

  isFollowing(userId: string | number): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }

    return this.http.get<Follow[]>(`${API_URL}/follows?followerId=${currentUser.id}&followingId=${userId}`).pipe(
      map(follows => follows.length > 0),
      catchError(() => of(false))
    );
  }

  getFollowers(userId: string | number): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${API_URL}/follows?followingId=${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  getFollowing(userId: string | number): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${API_URL}/follows?followerId=${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  getFollowersCount(userId: string | number): Observable<number> {
    return this.getFollowers(userId).pipe(
      map(follows => follows.length)
    );
  }

  getFollowingCount(userId: string | number): Observable<number> {
    return this.getFollowing(userId).pipe(
      map(follows => follows.length)
    );
  }
}
