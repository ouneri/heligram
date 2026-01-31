import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit {
  searchQuery = '';
  searchSubject = new Subject<string>();
  users: User[] = [];
  posts: Post[] = [];
  isLoading = false;
  activeTab: 'users' | 'posts' = 'users';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          return of({ users: [], posts: [] });
        }
        this.isLoading = true;
        return this.performSearch(query);
      })
    ).subscribe({
      next: (results) => {
        this.users = results.users;
        this.posts = results.posts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {}

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string): Promise<{ users: User[], posts: Post[] }> {
    return Promise.all([
      this.http.get<User[]>(`${API_URL}/users?q=${query}`).toPromise().catch(() => this.http.get<User[]>(`${API_URL}/users`).toPromise()),
      this.http.get<Post[]>(`${API_URL}/posts?q=${query}`).toPromise().catch(() => this.http.get<Post[]>(`${API_URL}/posts`).toPromise())
    ]).then(([usersResult, postsResult]) => {
      const users = (usersResult || []).filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      const posts = (postsResult || []).filter(post =>
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.username.toLowerCase().includes(post.username.toLowerCase())
      );
      return { users, posts };
    }).catch(() => {
      return { users: [], posts: [] };
    });
  }

  setActiveTab(tab: 'users' | 'posts'): void {
    this.activeTab = tab;
  }

  navigateToProfile(userId: string | number): void {
    this.router.navigate(['/main/profile', userId]);
  }

  navigateToPost(postId: string | number): void {
    this.router.navigate(['/main/feed']);
  }

  // 🎓 TrackBy функции для оптимизации списков
  trackByUserId(index: number, user: User): string | number {
    return user.id;
  }

  trackByPostId(index: number, post: Post): string | number {
    return post.id;
  }
}
