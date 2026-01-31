import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { CreatePost } from '../create-post/create-post';
import {Authservices} from '../../services/authservices';
import {User} from '../../models/user.interface';

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

  public currentUser: User | null = null;
  constructor(
    private authservices:  Authservices,
  ){
    this.currentUser = this.authservices.getCurrentUser();
  }

  onPostCreated(): void {
  }

}
