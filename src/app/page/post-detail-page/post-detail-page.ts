import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Post as PostComponent } from '../../components/post/post';
import { PostService } from '../../services/post-service';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, PostComponent, RouterLink],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss'
})
export class PostDetailPage implements OnInit {
  post: Post | null = null;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.error = true;
      this.isLoading = false;
      return;
    }

    this.loadPost(postId);
  }

  loadPost(postId: string): void {
    this.isLoading = true;
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/main/feed']);
  }
}
