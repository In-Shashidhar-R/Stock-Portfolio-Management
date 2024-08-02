import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private backendUrl = 'http://localhost:3000/scrape-price';

  constructor(private http: HttpClient) { }

  getStockPrice(ticker: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/${ticker}`);
  }
}