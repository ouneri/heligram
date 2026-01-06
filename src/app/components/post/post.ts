import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post as PostData } from '../../models/post.interface';

@Component({
  selector: 'app-post',
  imports: [CommonModule],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  standalone: true
})
export class Post {
  @Input() post!: PostData;
}