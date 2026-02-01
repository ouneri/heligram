import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreatePostModalService {
  private showModal$ = new BehaviorSubject<boolean>(false);

  get isOpen$() {
    return this.showModal$.asObservable();
  }

  get isOpen(): boolean {
    return this.showModal$.getValue();
  }

  open(): void {
    this.showModal$.next(true);
  }

  close(): void {
    this.showModal$.next(false);
  }
}
