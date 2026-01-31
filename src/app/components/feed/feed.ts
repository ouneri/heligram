import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { PostService } from '../../services/post-service';
import { CommonModule } from '@angular/common';
import { Post as PostComponent } from '../post/post';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, PostComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Feed implements OnInit {

  posts: Post[] = [];

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.postService.onPostsRefresh$.subscribe(() => {
      this.loadPosts();
    });
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Ошибка загрузки постов', e);
      }
    });


  }

  trackByPostId(index: number, post: Post): string | number {
    return post.id; // Возвращаем уникальный идентификатор поста
  }
}
