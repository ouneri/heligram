import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post as PostData } from '../../models/post.interface';
import { PostService } from '../../services/post-service';
import { NotificationService } from '../../services/notification.service';
import { Authservices } from '../../services/authservices';
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
  isDeleting = false;
  showEditModal = false;
  editDescription = '';
  editImage = '';
  isUpdating = false;

  constructor(
    private postService: PostService,
    private notificationService: NotificationService,
    private authService: Authservices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /** Пост принадлежит текущему пользователю — можно удалить */
  isOwnPost(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser && !!this.post && this.post.userId === currentUser.id;
  }

  ngOnInit(): void {
  }

  toggleLike(): void {
    if (this.isLiking || !this.post) return;

    this.isLiking = true;
    this.cdr.detectChanges();
    if (this.post.isLiked) {
      this.postService.unlikePost(this.post.id).subscribe({
        next: () => {
          this.post!.isLiked = !this.post!.isLiked;
          this.post!.likesCount = (this.post!.likesCount || 0) - 1;
          this.isLiking = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.notificationService.error('Ошибка при лайке поста');
          this.isLiking = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.postService.likePost(this.post.id).subscribe({
        next: () => {
          this.post!.isLiked = !this.post!.isLiked;
          this.post!.likesCount = (this.post!.likesCount || 0) + 1;
          this.isLiking = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.notificationService.error('Ошибка при лайке поста');
          this.isLiking = false;
          this.cdr.detectChanges();
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
    this.cdr.detectChanges();
    this.postService.addComment(this.post.id, this.commentText.trim()).subscribe({
      next: (comment) => {
        if (!this.post.comments) {
          this.post.comments = [];
        }
        this.post.comments.push(comment);
        this.post.commentsCount = (this.post.commentsCount || 0) + 1;
        this.commentText = '';
        this.isCommenting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Ошибка при добавлении комментария');
        this.isCommenting = false;
        this.cdr.detectChanges();
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

  deletePost(){
    if(!this.post || this.isDeleting) {
      return
    }

    if(!confirm('Удалить пост?')) {
      return
    }
      this.isDeleting = true;
      this.cdr.detectChanges();
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.notificationService.success('Пост удален');
          this.postService.refreshPosts();
          this.isDeleting = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.notificationService.error('Ошибка при удалении поста');
          this.isDeleting = false;
          this.cdr.detectChanges();
        }
      });
  }

  trackByCommentId(index: number, comment: any): string {
    return `${comment.postId}-${comment.userId}-${comment.createdAt}`;
  }

  openEditModal(): void {
    this.editDescription = this.post.description;
    this.editImage = this.post.image;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editDescription = '';
    this.editImage = '';
  }

  handleEditImageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.editImage = e.target.result as string;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveEdit(): void {
    if (!this.post || this.isUpdating) return;
    
    this.isUpdating = true;
    this.cdr.detectChanges();
    
    this.postService.updatePost(this.post.id, {
      description: this.editDescription,
      image: this.editImage
    }).subscribe({
      next: (updatedPost) => {
        this.post.description = updatedPost.description;
        this.post.image = updatedPost.image;
        this.isUpdating = false;
        this.closeEditModal();
        this.notificationService.success('Пост обновлён');
        this.postService.refreshPosts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Ошибка при обновлении поста');
        this.isUpdating = false;
        this.cdr.detectChanges();
      }
    });
  }
}
