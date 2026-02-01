import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { CreatePostButton } from '../create-post-button/create-post-button';
import {Authservices} from '../../services/authservices';
import {User} from '../../models/user.interface';

@Component({
  selector: 'app-rightbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    CreatePostButton
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

}
