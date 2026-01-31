import { Injectable } from '@angular/core';
import { Post } from '../models/post.interface';
import { Comment } from '../models/comment.interface';
import { Like } from '../models/like.interface';
import { HttpClient } from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Authservices } from './authservices';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private postRefresh$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: Authservices
  ){}

  refreshPosts(): void {
    this.postRefresh$.next();
  }

  get onPostsRefresh$(): Observable<void> {
    return this.postRefresh$.asObservable();
  }

  getPosts(): Observable<Post[]> {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id;

    return this.http.get<Post[]>(`${API_URL}/posts`).pipe(
      switchMap(posts => {
        return this.http.get<Like[]>(`${API_URL}/likes`).pipe(
          catchError(() => of([])),
          switchMap(likes => {
            return this.http.get<Comment[]>(`${API_URL}/comments`).pipe(
              catchError(() => of([])),
              map(comments => {
                return posts.map(post => {
                  const postLikes = likes.filter(like => like.postId === post.id);
                  const postComments = comments.filter(comment => comment.postId === post.id);
                  const isLiked = userId ? postLikes.some(like => like.userId === userId) : false;


                  return {
                    ...post,
                    likes: postLikes,
                    comments: postComments,
                    likesCount: postLikes.length,
                    commentsCount: postComments.length,
                    isLiked
                  };
                });
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error loading posts:', error);
        return of([]);
      })
    );
  }

  likePost(postId: string | number): Observable<Like> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const like: Omit<Like, 'id' | 'createdAt'> = {
      postId,
      userId: currentUser.id
    };

    return this.http.post<Like>(`${API_URL}/likes`, {
      ...like,
      createdAt: new Date().toISOString()
    });
  }

  unlikePost(postId: string | number): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.get<Like[]>(`${API_URL}/likes?postId=${postId}&userId=${currentUser.id}`).pipe(
      switchMap(likes => {
        if (likes.length === 0) {
          return of(void 0);
        }
        return this.http.delete<void>(`${API_URL}/likes/${likes[0].id}`);
      }),
      catchError(() => of(void 0))
    );
  }

  addComment(postId: string | number, text: string): Observable<Comment> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const comment: Omit<Comment, 'id' | 'createdAt'> = {
      postId,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      text
    };

    return this.http.post<Comment>(`${API_URL}/comments`, {
      ...comment,
      createdAt: new Date().toISOString()
    });
  }

  createPost(description: string, image: string): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'likesCount' | 'commentsCount' | 'isLiked'> = {
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      description,
      image
    };

    return this.http.post<Post>(`${API_URL}/posts`, {
      ...post,
      createdAt: new Date().toISOString()
    });
  }

  deletePost(postId: string | number): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.get<Post>(`${API_URL}/posts/${postId}`).pipe(
      switchMap(post => {
        if (post.userId !== currentUser.id) {
          throw new Error('Not authorized to delete this post');
        }
        return this.http.delete<void>(`${API_URL}/posts/${postId}`);
      })
    );
  }

}
