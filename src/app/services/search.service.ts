import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { Post } from '../models/post.interface';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

export interface SearchResult {
  users: User[];
  posts: Post[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult> {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return of({ users: [], posts: [] });
    }

    return forkJoin({
      users: this.http.get<User[]>(`${API_URL}/users`).pipe(catchError(() => of([]))),
      posts: this.http.get<Post[]>(`${API_URL}/posts`).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ users, posts }) => ({
        users: users.filter(
          (user) =>
            (user.username && user.username.toLowerCase().includes(q)) ||
            (user.email && user.email.toLowerCase().includes(q))
        ),
        posts: posts.filter(
          (post) =>
            (post.description && post.description.toLowerCase().includes(q)) ||
            (post.username && post.username.toLowerCase().includes(q))
        ),
      }),
      catchError(() => of({ users: [], posts: [] }))
    ));
  }
}
