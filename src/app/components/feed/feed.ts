import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post-service';
import { CommonModule } from '@angular/common';
import { Post as PostComponent } from '../post/post';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, PostComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
  standalone: true
})
export class Feed implements OnInit {

  posts: Post[] = [];

  constructor(
    private postService: PostService,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (e) => {
        console.error('Ошибка загрузки постов', e);
      }
    });
  }
}
