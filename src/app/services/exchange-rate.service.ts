import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private apiUrl = 'https://v6.exchangerate-api.com/v6/bac76367d7334ddb49dd245b/latest/CLP'; // Reemplaza YOUR_API_KEY con tu clave API

  constructor(private http: HttpClient) { }

  getExchangeRate(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
