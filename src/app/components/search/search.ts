import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  searchQuery = '';
  searchSubject = new Subject<string>();
  users: User[] = [];
  posts: Post[] = [];
  isLoading = false;
  activeTab: 'users' | 'posts' = 'users';

  constructor(
    private searchService: SearchService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            return of({ users: [], posts: [] });
          }
          this.ngZone.run(() => {
            this.isLoading = true;
            setTimeout(() => this.cdr.detectChanges(), 0);
          });
          return this.searchService.search(query).pipe(
            finalize(() => {
              this.ngZone.run(() => {
                this.isLoading = false;
                setTimeout(() => this.cdr.detectChanges(), 0);
              });
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((results) => {
        this.ngZone.run(() => {
          this.users = results.users;
          this.posts = results.posts;
          // Следующий тик, чтобы представление обновилось сразу без клика
          setTimeout(() => this.cdr.detectChanges(), 0);
        });
      });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 100);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.users = [];
    this.posts = [];
    this.searchSubject.next('');
    this.cdr.detectChanges();
    this.searchInputRef?.nativeElement?.focus();
  }

  setActiveTab(tab: 'users' | 'posts'): void {
    this.activeTab = tab;
  }

  navigateToProfile(userId: string | number): void {
    this.router.navigate(['/main/profile', userId]);
  }

  navigateToPost(postId: string | number): void {
    this.router.navigate(['/main/post', postId]);
  }

  get hasQuery(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  get hasNoResults(): boolean {
    return this.hasQuery && !this.isLoading && this.users.length === 0 && this.posts.length === 0;
  }

  trackByUserId(_index: number, user: User): string | number {
    return user.id;
  }

  trackByPostId(_index: number, post: Post): string | number {
    return post.id;
  }
}
