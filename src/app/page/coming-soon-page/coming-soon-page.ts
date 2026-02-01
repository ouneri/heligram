import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coming-soon-page.html',
  styleUrl: './coming-soon-page.scss'
})
export class ComingSoonPage implements OnInit {
  pageName = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const path = this.route.snapshot.url[0]?.path || '';
    this.pageName = this.getPageName(path);
  }

  getPageName(path: string): string {
    const names: { [key: string]: string } = {
      'messages': 'Сообщения',
      'community': 'Сообщество',
      'payments': 'Платежи',
      'heliprem': 'Heliprem Premium'
    };
    return names[path] || 'Эта страница';
  }
}
