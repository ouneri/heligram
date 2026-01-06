import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Authservices } from '../../services/authservices';


@Component({
  selector: 'app-register-page',
  imports: [CommonModule,  ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss', 
  standalone: true,
})


export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: Authservices,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if(this.registerForm.valid) {
      this.isLoading = true;

      const registerData = this.registerForm.value;

      this.authService.register(registerData).subscribe({


        next: (response) => {
          console.log('Регистрация успешна!', response);
          this.router.navigate(['/login'])

        },

        error: (error) => {
          this.isLoading = false;
        }
      });
    }
  } 
}
