import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { Authservices } from '../../services/authservices';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class Sidebar {
  showLogoutModal = false; 
  
  constructor(
    private router: Router,
    private authService: Authservices) {}

  logout(): void {
    // Показываем модальное окно вместо прямого выхода
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.showLogoutModal = false;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }
}