import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject  } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'https://backend-szcj.onrender.com/api'; // Ajusta la URL según sea necesario
  cartUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  createReserva(reservaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservas`, reservaData).pipe(
      tap(() => this.cartUpdated.next())  // Notificar sobre la actualización del carrito
    );
  }

  getReservasPendientes(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/pendientes/${userId}`);
  }
  getReservas(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/${userId}`);
  }

  updateReservas(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/reservas/update`, data); // Nueva endpoint para actualizar reservas
  }

  deleteReserva(reservaId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reservas/${reservaId}`).pipe(
      tap(() => this.cartUpdated.next())  // Notificar sobre la actualización del carrito
    );
  }

  verificarDisponibilidad(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservas/verificarDisponibilidad`, data);
  }

  verificarReservaExistente(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservas/verificar-reserva-existente`, data);
  }
}
