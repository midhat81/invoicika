import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment'; // Import the environment

@Injectable({ providedIn: 'root' })
export class CustomerInvoiceService {
  private apiUrl = environment.apiUrl + 'customerinvoices'; // Use the environment variable
  private vatUrl = environment.apiUrl + 'vat'; // VAT API URL
  private customersUrl = environment.apiUrl + 'customers'; // Customers API URL
  private usersUrl = environment.apiUrl + 'users'; // Users API URL
  private itemsUrl = environment.apiUrl + 'items'; // Users API URL
  constructor(private http: HttpClient) {}

  getCustomerInvoices(
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

  addCustomerInvoice(customerInvoice: any): Observable<void> {
    return this.http.post<void>(this.apiUrl, customerInvoice);
  }

  updateCustomerInvoice(
    customerInvoiceId: string,
    customerInvoice: any
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${customerInvoiceId}`,
      customerInvoice
    );
  }

  getCustomerInvoiceById(customerInvoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${customerInvoiceId}`);
  }

  deleteCustomerInvoice(customerInvoiceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${customerInvoiceId}`);
  }

  getVats(): Observable<any[]> {
    return this.http.get<any[]>(this.vatUrl).pipe(catchError(() => of([])));
  }

  getCustomers(): Observable<any[]> {
    return this.http
      .get<any[]>(this.customersUrl)
      .pipe(catchError(() => of([])));
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl).pipe(catchError(() => of([])));
  }
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.itemsUrl).pipe(catchError(() => of([])));
  }
  
  makePdfInvoice(customerInvoiceId: string) {
    const url = `${this.apiUrl}/pdf/${customerInvoiceId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  emailInvoice(customerInvoiceId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/email/${customerInvoiceId}`, {});
  }
}
