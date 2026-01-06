import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Authservices} from '../../services/authservices';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profilelist',
  imports: [CommonModule],
  templateUrl: './profilelist.html',
  styleUrl: './profilelist.scss',
  standalone: true
})
export class Profilelist implements OnInit {

  userId: string | null = null;
  user: User | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private authService: Authservices,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnInit() {
      this.userId = this.route.snapshot.paramMap.get('id');
      if ( this.userId) {
        this.authService.getUserById(this.userId).subscribe({
          next: (user) => {
            this.user = user;
            this.isLoading = false;
            this.cdr.detectChanges();
            console.log('user loaded', user);
          },
          error: (error) => {
            console.error('error loaded', error);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        })
      }
    }



}
