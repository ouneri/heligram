import { Injectable } from '@angular/core';
import { Post } from '../models/post.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';





const API_URL = 'http://localhost:3000';


@Injectable({
  providedIn: 'root',
})
export class PostService {

  constructor(
    private http: HttpClient,
  ){}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API_URL}/posts`);
  }
  
}
