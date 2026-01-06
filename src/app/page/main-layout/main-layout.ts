import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Sidebar} from '../../components/sidebar/sidebar';
import {Rightbar} from '../../components/rightbar/rightbar'; // Для работы <router-outlet>


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,     // Добавляем поддержку роутинга внутри страницы
    Sidebar,
    Rightbar// Добавляем твой сайдбар
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout {}
