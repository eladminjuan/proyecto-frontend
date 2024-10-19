import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://backend-szcj.onrender.com/api';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  getUsuariosSinRolesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/usuarios/sin-roles/count`);
  }

  createUsuario(usuario: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/usuarios/${id}`);
  }
}
