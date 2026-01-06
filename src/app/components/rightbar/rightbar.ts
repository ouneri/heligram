import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-rightbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './rightbar.html',
  styleUrl: './rightbar.scss',
  standalone: true
})
export class Rightbar {

}
