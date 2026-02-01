import { Component } from '@angular/core';
import { CreatePostModalService } from '../../services/create-post-modal.service';

@Component({
  selector: 'app-create-post-button',
  standalone: true,
  templateUrl: './create-post-button.html',
  styleUrl: './create-post-button.scss'
})
export class CreatePostButton {
  constructor(public modalService: CreatePostModalService) {}
}
