import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authservices } from '../../services/authservices';
import { ThemeService } from '../../services/theme-service';
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
    private authService: Authservices,
    public themeService: ThemeService
  ) {}

  logout(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.showLogoutModal = false;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
