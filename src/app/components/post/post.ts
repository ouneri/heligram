import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post as PostData } from '../../models/post.interface';
import { PostService } from '../../services/post-service';
import { NotificationService } from '../../services/notification.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true,

})
export class Post implements OnInit {
  @Input() post!: PostData;

  showComments = false;
  commentText = '';
  isLiking = false;
  isCommenting = false;

  constructor(
    private postService: PostService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  toggleLike(): void {
    if (this.isLiking || !this.post) return;

    this.isLiking = true;
    if (this.post.isLiked) {
      this.postService.unlikePost(this.post.id).subscribe({
        next: () => {
          this.post!.isLiked = !this.post!.isLiked;
          this.post!.likesCount = (this.post!.likesCount || 0) - 1;
          this.isLiking = false;
        },
        error: (error: any) => {
          this.notificationService.error('Ошибка при лайке поста');
          this.isLiking = false;
        }
      });
    } else {
      this.postService.likePost(this.post.id).subscribe({
        next: () => {
          this.post!.isLiked = !this.post!.isLiked;
          this.post!.likesCount = (this.post!.likesCount || 0) + 1;
          this.isLiking = false;
        },
        error: (error: any) => {
          this.notificationService.error('Ошибка при лайке поста');
          this.isLiking = false;
        }
      });
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  addComment(): void {
    if (!this.commentText.trim() || this.isCommenting || !this.post) return;

    this.isCommenting = true;
    this.postService.addComment(this.post.id, this.commentText.trim()).subscribe({
      next: (comment) => {
        if (!this.post.comments) {
          this.post.comments = [];
        }
        this.post.comments.push(comment);
        this.post.commentsCount = (this.post.commentsCount || 0) + 1;
        this.commentText = '';
        this.isCommenting = false;
      },
      error: (error: any) => {
        this.notificationService.error('Ошибка при добавлении комментария');
        this.isCommenting = false;
      }
    });
  }

  navigateToProfile(): void {
    if (this.post?.userId) {
      this.router.navigate(['/main/profile', this.post.userId]);
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`;

    return date.toLocaleDateString('ru-RU');
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallbackImages = ['/image.jpg', '/IMG_0411.jpg', '/avatarka.jpg'];
    const currentSrc = img.src;
    const currentIndex = fallbackImages.findIndex(url => currentSrc.includes(url));

    if (currentIndex < fallbackImages.length - 1) {
      img.src = fallbackImages[currentIndex + 1];
    } else {
      img.src = '/avatarka.jpg';
      img.style.opacity = '0.5';
    }
  }

  // 🎓 TrackBy для комментариев
  // Используем комбинацию postId + userId + время как уникальный идентификатор
  trackByCommentId(index: number, comment: any): string {
    return `${comment.postId}-${comment.userId}-${comment.createdAt}`;
  }
}
