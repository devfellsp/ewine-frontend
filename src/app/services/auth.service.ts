import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Login } from '../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = 'http://localhost:8080/auth';
  private readonly tokenStorageKey = 'token';
  private readonly perfilStorageKey = 'perfil';

  constructor(private httpClient: HttpClient) {}

  login(credenciais: Login): Observable<HttpResponse<string>> {
    return this.httpClient
      .post(this.api, credenciais, {
        observe: 'response',
        responseType: 'text',
        withCredentials: true,
      })
      .pipe(
        tap((response: HttpResponse<string>) => {
          const token = this.extrairToken(response);
          const perfil = this.extrairPerfil(token);

          if (token) {
            localStorage.setItem(this.tokenStorageKey, token);
          }

          if (perfil) {
            localStorage.setItem(this.perfilStorageKey, perfil);
          }
        }),
      );
  }

  logout(): void {
    this.httpClient
      .post(`${this.api}/logout`, {}, { withCredentials: true })
      .subscribe();

    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.perfilStorageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getPerfil(): string | null {
    return this.normalizarPerfil(localStorage.getItem(this.perfilStorageKey));
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getPerfil();
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMIN';
  }

  isCliente(): boolean {
    return this.getPerfil() === 'CLIENTE';
  }

  temPerfilReconhecido(): boolean {
    const perfil = this.getPerfil();
    return perfil === 'ADMIN' || perfil === 'CLIENTE';
  }

  private extrairToken(response: HttpResponse<string>): string | null {
    const authHeader = response.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const body = response.body?.trim();
    return body ? body : null;
  }

  private extrairPerfil(token: string | null): string | null {
    if (!token) {
      return null;
    }

    const partes = token.split('.');
    if (partes.length < 2) {
      return this.normalizarPerfil(token);
    }

    try {
      const payload = JSON.parse(this.base64UrlDecode(partes[1])) as Record<string, unknown>;
      const candidatos = [
        payload['perfil'],
        payload['role'],
        payload['groups'],
        payload['group'],
        payload['authorities'],
        payload['scope'],
      ];

      for (const candidato of candidatos) {
        const perfil = this.normalizarValorPerfil(candidato);
        if (perfil) {
          return perfil;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private normalizarValorPerfil(valor: unknown): string | null {
    if (typeof valor === 'string') {
      if (valor.includes(' ')) {
        for (const item of valor.split(' ')) {
          const perfil = this.normalizarPerfil(item);
          if (perfil === 'ADMIN' || perfil === 'CLIENTE') {
            return perfil;
          }
        }
      }

      const perfil = this.normalizarPerfil(valor);
      return perfil === 'ADMIN' || perfil === 'CLIENTE' ? perfil : null;
    }

    if (Array.isArray(valor)) {
      for (const item of valor) {
        const perfil = this.normalizarValorPerfil(item);
        if (perfil) {
          return perfil;
        }
      }
    }

    return null;
  }

  private normalizarPerfil(perfil: string | null): string | null {
    if (!perfil) {
      return null;
    }

    const perfilNormalizado = perfil.trim().replace(/^"(.*)"$/, '$1').toUpperCase();

    if (perfilNormalizado === 'ROLE_ADMIN') {
      return 'ADMIN';
    }

    if (
      perfilNormalizado === 'ROLE_CLIENTE' ||
      perfilNormalizado === 'ROLE_USER' ||
      perfilNormalizado === 'USER'
    ) {
      return 'CLIENTE';
    }

    if (perfilNormalizado === 'ADMIN' || perfilNormalizado === 'CLIENTE') {
      return perfilNormalizado;
    }

    return perfilNormalizado;
  }

  private base64UrlDecode(valor: string): string {
    const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(base64 + padding);
  }
}
