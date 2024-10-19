import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private apiUrl = 'https://backend-szcj.onrender.com/api';

  constructor(private http: HttpClient) { }

  createHabitacion(habitacion: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitaciones`, habitacion);
  }

  getHabitaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitaciones`);
  }
  getHabitacionesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitaciones/count`);
  }

  getHabitacion(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitaciones/${id}`);
  }

  updateHabitacion(id: string, habitacion: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/habitaciones/${id}`, habitacion);
  }

  deleteHabitacion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/habitaciones/${id}`);
  }

  
}

