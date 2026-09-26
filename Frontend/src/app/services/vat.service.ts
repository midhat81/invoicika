import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment'; // Import the environment

@Injectable({ providedIn: 'root' })
export class VatService {
  private apiUrl = environment.apiUrl + 'vat'; // Use the environment variable for VAT API

  constructor(private http: HttpClient) {}

  getVats(
    pageNumber: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
    filters: Array<{ key: string; value: string[] }>
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', `${pageNumber}`)
      .set('pageSize', `${pageSize}`)
      .set('sortField', sortField || '')
      .set('sortOrder', sortOrder || '');

    filters.forEach((filter) => {
      filter.value.forEach((value) => {
        params = params.append(filter.key, value);
      });
    });

    return this.http
      .get<any>(this.apiUrl, { params })
      .pipe(catchError(() => of([])));
  }

  addVat(vat: any): Observable<void> {
    return this.http.post<void>(this.apiUrl, vat);
  }

  updateVat(vatId: string, vat: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${vatId}`, vat);
  }

  getVatById(vatId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${vatId}`);
  }

  deleteVat(vatId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${vatId}`);
  }
}
