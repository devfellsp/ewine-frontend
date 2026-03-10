import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Login } from '../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly api = 'http://localhost:8080/auth';

  constructor(private httpClient: HttpClient) { }

  login(credenciais: Login): Observable<HttpResponse<string>> {
    return this.httpClient.post(this.api, credenciais, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      tap((response: HttpResponse<string>) => {
        const token = response.body;
        if (token) {
          localStorage.setItem('token', token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
