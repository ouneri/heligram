import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Sidebar} from '../../components/sidebar/sidebar';
import {Rightbar} from '../../components/rightbar/rightbar';
import { Router} from '@angular/router';
import {NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,     // Добавляем поддержку роутинга внутри страницы
    Sidebar,
    Rightbar,
    CommonModule
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout {
  ifProfilePage = false;

  constructor(
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.ifProfilePage = event.url.includes('/profile');
      }
    })

  }
}
