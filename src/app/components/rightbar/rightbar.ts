import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { CreatePost } from '../create-post/create-post';

@Component({
  selector: 'app-rightbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    CreatePost
  ],
  templateUrl: './rightbar.html',
  styleUrl: './rightbar.scss',
  standalone: true
})
export class Rightbar {
  onPostCreated(): void {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}
