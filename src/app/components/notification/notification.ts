import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class Notification {
  notifications$;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.getNotifications();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  // 🎓 TrackBy для уведомлений
  trackByNotificationId(index: number, notification: any): string {
    return notification.id;
  }
}
