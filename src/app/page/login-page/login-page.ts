import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservices } from '../../services/authservices';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Нужен для работы Reactive Forms
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  // FormGroup - группа полей формы
  loginForm!: FormGroup;
  // ! означает, что мы инициализируем его позже (в ngOnInit)
  
  isLoading = false; // Флаг для индикации загрузки

  constructor(
    private fb: FormBuilder, // FormBuilder - помогает создавать формы
    private authService: Authservices, // Наш сервис авторизации
    private router: Router // Для редиректа после успешного входа
  ) {}

  ngOnInit(): void {
    // Создаём форму при инициализации компонента
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // email - название поля
      // [''] - начальное значение (пустая строка)
      // [Validators.required, Validators.email] - валидаторы
      // required - поле обязательно
      // email - должен быть валидный email
      
      password: ['', [Validators.required, Validators.minLength(6)]]
      // password - название поля
      // [''] - начальное значение
      // [Validators.required, Validators.minLength(6)] - валидаторы
      // required - обязательно
      // minLength(6) - минимум 6 символов
    });
  }

  onSubmit(): void {
    // Вызывается при отправке формы
    
    if (this.loginForm.valid) {
      // Проверяем, что форма валидна
      // Если все валидаторы прошли - форма valid
      
      this.isLoading = true; // Показываем индикатор загрузки
      
      const credentials = this.loginForm.value;
      // .value - получаем объект со значениями формы
      // { email: "user@mail.com", password: "123456" }
      
      this.authService.login(credentials).subscribe({
        // Вызываем метод login() из сервиса
        // subscribe() - подписываемся на результат
        
        next: (response) => {
          console.log('Вход успешен!', response);
          this.isLoading = false; // Сбрасываем индикатор загрузки
          this.router.navigate(['/main/feed']);
        },
        
        error: (error) => {
          console.error('Ошибка входа:', error);
          this.isLoading = false; // Скрываем индикатор
          // TODO: Показать сообщение об ошибке пользователю
        }
      });
    } else {
      // Если форма невалидна - показываем ошибки
      console.log('Форма невалидна');
      // Angular автоматически покажет ошибки в HTML
    }
  }
}