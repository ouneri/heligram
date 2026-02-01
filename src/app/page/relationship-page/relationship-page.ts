import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { FollowService } from '../../services/follow.service';
import { Authservices } from '../../services/authservices';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-relationship-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relationship-page.html',
  styleUrl: './relationship-page.scss'
})
export class RelationshipPage implements OnInit {
  activeTab: 'followers' | 'following' = 'followers';
  followers: User[] = [];
  following: User[] = [];
  isLoading = false;
  currentUserId: string | number | null = null;

  constructor(
    private followService: FollowService,
    private authService: Authservices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = currentUser.id;
    this.loadFollowers();
    this.loadFollowing();
  }

  loadFollowers(): void {
    if (!this.currentUserId) return;
    this.isLoading = true;
    this.followService.getFollowers(this.currentUserId).pipe(
      switchMap((follows) => {
        const ids = follows.map((f) => f.followerId);
        if (ids.length === 0) return of([]);
        return forkJoin(ids.map((id) => this.authService.getUserById(String(id)))).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe({
      next: (users) => {
        this.followers = users;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFollowing(): void {
    if (!this.currentUserId) return;
    this.followService.getFollowing(this.currentUserId).pipe(
      switchMap((follows) => {
        const ids = follows.map((f) => f.followingId);
        if (ids.length === 0) return of([]);
        return forkJoin(ids.map((id) => this.authService.getUserById(String(id)))).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe({
      next: (users) => {
        this.following = users;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  setActiveTab(tab: 'followers' | 'following'): void {
    this.activeTab = tab;
  }

  navigateToProfile(userId: string | number): void {
    this.router.navigate(['/main/profile', userId]);
  }

  trackByUserId(_index: number, user: User): string | number {
    return user.id;
  }
}
