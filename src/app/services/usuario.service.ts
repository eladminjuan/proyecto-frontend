import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://backend-szcj.onrender.com/api';

  constructor(private http: HttpClient) { }

  createUsuario(usuario: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  changePassword(id: string, passwords: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/change-password`, passwords);
  }

}

