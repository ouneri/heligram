import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post-service';
import { CommonModule } from '@angular/common';
import { Post as PostComponent } from '../post/post';  // Компонент для HTML
import { Post } from '../../models/post.interface';    // Интерфейс для типизации

@Component({
  selector: 'app-feed',
  imports: [CommonModule, PostComponent],  // Компонент для использования в HTML
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
  standalone: true
})
export class Feed implements OnInit {

  posts: Post[] = [];  // Массив постов (тип - интерфейс Post)

  constructor(
    private postService: PostService,
  ) {}

  ngOnInit(): void {
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