import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  usuario: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'https://backend-szcj.onrender.com/api'; // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient) { }

  login(correo: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      map(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        if (response.usuario.foto) {
          localStorage.setItem('foto', response.usuario.foto);
        } else {
          localStorage.removeItem('foto');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('foto');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRoles(): string[] {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.roles || [];
  }

  tieneRolAdministrador(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('Administrador');
  }

  getUserPhoto(): string | null {
    return localStorage.getItem('foto');
  }
}

