import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  usuario: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backend-szcj.onrender.com/api'; 
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) { 
    const currentUserJson = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(currentUserJson ? JSON.parse(currentUserJson) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login( correo: string, password: string ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/loginC`, { correo, password }).pipe(
      map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        if (user.usuario.foto) {
          localStorage.setItem('foto', user.usuario.foto);
        } else {
          localStorage.removeItem('foto');
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getCurrentUser(): any {
    return this.currentUserValue;
  }

  updateCurrentUser(updatedUser: any): void {
    const currentUser = this.currentUserValue;
    currentUser.usuario = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    this.currentUserSubject.next(currentUser);
  }
}
