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
      responseType: 'text',
      withCredentials: true   // ✅ recebe e envia o cookie automaticamente
    }).pipe(
      tap((response: HttpResponse<string>) => {
        const perfil = response.body; // ✅ agora o body retorna só o perfil
        if (perfil) {
          localStorage.setItem('perfil', perfil); // perfil não é sensível
        }
      })
    );
  }

  logout(): void {
    // ✅ chama o backend para apagar o cookie
    this.httpClient.post(`${this.api}/logout`, {}, {
      withCredentials: true
    }).subscribe();
    localStorage.removeItem('perfil');
  }

  getPerfil(): string | null {
    return localStorage.getItem('perfil');
  }

  isLoggedIn(): boolean {
    // ✅ verifica pelo perfil já que o token está no cookie HttpOnly
    return !!this.getPerfil();
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMIN';
  }

  isCliente(): boolean {
    return this.getPerfil() === 'CLIENTE';
  }
}

