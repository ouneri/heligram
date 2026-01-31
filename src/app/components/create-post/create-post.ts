import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post-service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePost {
  @Output() postCreated = new EventEmitter<void>();

  description = '';
  imageUrl = '';
  isSubmitting = false;
  showModal = false;

  constructor(
    private postService: PostService,
    private notificationService: NotificationService
  ) {}

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.description = '';
    this.imageUrl = '';
  }

  onSubmit(): void {
    if (!this.description.trim() || !this.imageUrl.trim()) {
      this.notificationService.warning('Заполните все поля');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.postService.createPost(this.description.trim(), this.imageUrl.trim()).subscribe({
      next: () => {
        this.notificationService.success('Пост успешно создан!');
        this.closeModal();
        this.postService.refreshPosts(); // лента обновится без перезагрузки страницы
        this.postCreated.emit();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.error('Ошибка при создании поста');
        this.isSubmitting = false;
      }
    });
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imageUrl = e.target.result as string;
        }
      };
      
      reader.readAsDataURL(file);
    }
  }
}
