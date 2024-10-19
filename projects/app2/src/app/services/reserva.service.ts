import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'https://backend-szcj.onrender.com/api'; // Cambia esto a tu URL del backend

  constructor(private http: HttpClient) {}

  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservass`);
  }
  getReservass(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservasss`);
  }

  createReserva(reserva: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, reserva);
  }

  updateReserva(id: string, reserva: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${id}`, reserva);
  }

  deleteReserva(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/reservas/${id}`);
  }

  checkAvailability(idhabitacion: string, fechaIngreso: string, fechaSalida: string): Observable<boolean> {
    const params = {
      idhabitacion,
      fechaIngreso,
      fechaSalida
    };
    return this.http.get<boolean>(`${this.apiUrl}/reservas/check-availability`, { params });
  }
}
