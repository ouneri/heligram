import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservices } from '../../services/authservices';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: Authservices,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    
    if (this.loginForm.valid) {
      
      this.isLoading = true;
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        
        next: (response) => {
          console.log('Вход успешен!', response);
          this.isLoading = false;
          this.router.navigate(['/main/feed']);
        },
        
        error: (error) => {
          console.error('Ошибка входа:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.log('Форма невалидна');
    }
  }
}
