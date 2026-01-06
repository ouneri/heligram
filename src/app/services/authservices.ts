// ============================================
// ИМПОРТЫ - Подключаем нужные модули и типы
// ============================================

import { Injectable, signal } from '@angular/core';
// Injectable - декоратор, делает класс сервисом для Dependency Injection
// signal - реактивное значение из Angular 17+ для хранения состояния

import { Router } from '@angular/router';
// Router - сервис для навигации между страницами (редиректы)

import { Observable, of, BehaviorSubject } from 'rxjs';
// Observable - асинхронный поток данных
// of - создаёт Observable из обычного значения
// BehaviorSubject - хранит текущее значение и уведомляет подписчиков об изменениях

import { User } from '../models/user.interface';
// Импортируем интерфейс User - структура данных пользователя

import { LoginCredentials } from '../models/logincredentsials.interface';
// Импортируем интерфейс LoginCredentials - email и password для входа

import { AuthResponse } from '../models/authResponse.interface';
// Импортируем интерфейс AuthResponse - ответ от сервера (токен + пользователь)

import { Registerdata } from '../models/registerdata.interface';
// Импортируем интерфейс RegisterData - данные для регистрации (username, email, password)
// ИСПРАВЛЕНО: было Registerdata, стало RegisterData (правильное именование)

import { HttpClient } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

// ============================================
// КОНСТАНТЫ
// ============================================

const API_URL = 'http://localhost:3000';

// ============================================
// ДЕКОРАТОР И КЛАСС
// ============================================

@Injectable({
  providedIn: 'root',
  // providedIn: 'root' означает:
  // - Singleton (один экземпляр на всё приложение)
  // - Автоматически доступен везде через Dependency Injection
  // - Не нужно добавлять в providers
})
export class Authservices {
  // Экспортируем класс, чтобы можно было использовать в других файлах


  // ============================================
  // СВОЙСТВА КЛАССА - Хранилище состояния
  // ============================================

  private currentUser = signal<User | null>(null);
  // private - доступно только внутри этого класса
  // signal<User | null> - реактивное значение, может быть User или null
  // (null) - начальное значение (пользователь не авторизован)
  // signal автоматически обновляет UI при изменении значения

  public currentUser$ = this.currentUser.asReadonly();
  // public - доступно извне класса
  // currentUser$ - конвенция: $ означает Observable или readonly signal
  // asReadonly() - создаёт readonly версию, можно только читать, нельзя изменять
  // Это защита: компоненты могут читать, но не могут изменять напрямую

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  // private - доступно только внутри класса
  // BehaviorSubject<boolean> - хранит текущее значение (true/false)
  // (false) - начальное значение (не авторизован)
  // BehaviorSubject хранит последнее значение и отдаёт его новым подписчикам

  public isAuthenticated$ = this.isAuthenticated.asObservable();
  // public - доступно извне
  // asObservable() - создаёт readonly версию, можно только читать
  // Компоненты могут подписаться через subscribe() для отслеживания изменений


  // ============================================
  // КОНСТРУКТОР - Вызывается при создании экземпляра
  // ============================================

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // private router: Router - Dependency Injection
    // Angular автоматически передаст экземпляр Router
    // private означает, что router доступен как this.router

    this.checkAuth();
    // При создании сервиса проверяем, есть ли сохранённая сессия
    // Если пользователь был авторизован, восстанавливаем его данные
  }


  // ============================================
  // МЕТОДЫ КЛАССА
  // ============================================

  private checkAuth(): void {
    // private - метод доступен только внутри класса
    // void - метод ничего не возвращает
    // Проверяет localStorage на наличие сохранённой сессии

    const token = localStorage.getItem('auth_token');
    // localStorage - хранилище браузера (сохраняется между перезагрузками)
    // getItem('auth_token') - получаем токен авторизации
    // Если токена нет, вернётся null

    const userString = localStorage.getItem('user');
    // Получаем строку с данными пользователя
    // localStorage хранит только строки, поэтому объект был сохранён как JSON

    if (token && userString) {
      // Если и токен, и данные пользователя есть - значит была авторизация
      // && означает "И" - оба условия должны быть true

      try {
        // try/catch - обработка ошибок
        // Если что-то пойдёт не так, не упадём, а обработаем ошибку

        const user = JSON.parse(userString);
        // JSON.parse() - преобразует строку обратно в объект
        // Например: '{"id":1,"username":"user"}' → {id: 1, username: "user"}

        this.currentUser.set(user);
        // Обновляем signal с данными пользователя
        // set() - метод signal для установки нового значения

        this.isAuthenticated.next(true);
        // Обновляем BehaviorSubject - теперь пользователь авторизован
        // next() - метод для установки нового значения и уведомления подписчиков

      } catch (error) {
        // Если произошла ошибка (например, повреждённые данные в localStorage)
        this.logout();
        // Вызываем logout() для очистки повреждённых данных
      }
    }
    // Если токена или данных нет - ничего не делаем (пользователь не авторизован)
  }


  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.get<User[]>(`${API_URL}/users?email=${credentials.email}&password=${credentials.password}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('Invalid credentials');
          }

          const user = users[0];
          const token = 'token-' + Date.now();

          const response: AuthResponse = {
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio,
              createdAt: new Date(user.createdAt)
            }
          };

          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.next(true);

          return response;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }




  register(data: Registerdata): Observable<AuthResponse> {
    // Сначала проверяем, нет ли уже пользователя с таким email
    return this.http.get<User[]>(`${API_URL}/users?email=${data.email}`)
      .pipe(
        switchMap((existingUsers: User[]) => {
          // Если пользователь с таким email уже есть - ошибка
          if (existingUsers.length > 0) {
            return throwError(() => new Error('Email already exists'));
          }

          // Если email свободен - создаём нового пользователя
          const newUser = {
            username: data.username,
            email: data.email,
            password: data.password,
            avatar: '/avatarka.jpg',
            bio: '',
            createdAt: new Date().toISOString()
          };

          // Создаём пользователя через POST запрос
          return this.http.post<User>(`${API_URL}/users`, newUser);
        }),
        map((user: User) => {
          // После создания пользователя создаём токен и ответ
          const token = 'token-' + Date.now();

          const response: AuthResponse = {
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio || '',
              createdAt: new Date(user.createdAt)
            }
          };

          // Сохраняем в localStorage
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.next(true);

          return response;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }


  logout(): void {
    // logout - метод для выхода из системы
    // void - ничего не возвращает

    localStorage.removeItem('auth_token');
    // Удаляем токен из localStorage
    // removeItem(ключ) - удаляет данные по ключу

    localStorage.removeItem('user');
    // Удаляем данные пользователя

    this.currentUser.set(null);
    // Очищаем signal - устанавливаем null
    // Все компоненты, читающие currentUser$, получат null

    this.isAuthenticated.next(false);
    // Устанавливаем статус "не авторизован"
    // Все подписчики isAuthenticated$ получат false

    this.router.navigate(['/login']);
    // router.navigate() - перенаправляет на другую страницу
    // ['/login'] - массив с путём (можно указать параметры)
    // После выхода перенаправляем на страницу логина
  }


   public isAuthenticate(): boolean {
    // isAuthenticated - метод для проверки статуса авторизации
    // boolean - возвращает true или false
    // ИСПРАВЛЕНО: было isAuthenticate(), стало isAuthenticated()

    return this.isAuthenticated.value;
    // .value - получаем текущее значение из BehaviorSubject
    // Возвращаем true если авторизован, false если нет
    // Используется в guards и компонентах для проверки
  }


  getCurrentUser(): User | null {
    // getCurrentUser - метод для получения текущего пользователя
    // User | null - возвращает User или null (если не авторизован)

    return this.currentUser();
    // this.currentUser() - вызываем signal как функцию для получения значения
    // Возвращает User если авторизован, null если нет
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${API_URL}/users/${id}`)  // ← Используем any для сырых данных
      .pipe(
        map((userData: any) => {

          const user: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
            bio: userData.bio || '',
            createdAt: new Date(userData.createdAt)
          };
          console.log('✅ Mapped user:', user);
          return user;
        }),
        catchError(error => {
          console.error('❌ Error in getUserById:', error);
          return throwError(() => error);
        })
      );
  }
}
