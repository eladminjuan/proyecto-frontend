import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private apiUrl = 'https://backend-szcj.onrender.com/api';

  constructor(private http: HttpClient) { }

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/habitaciones`);
  }
  
}

export interface Habitacion {
  _id: string;
  estilo: string;
  precio: number;
  descripcion: string;
  foto: string; // Asegúrate de que el backend envía la imagen en Base64
}