import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Uva, UvaFormValue } from '../models/uva.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

@Injectable({
  providedIn: 'root',
})
export class UvaService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/uvas';

  findAll(nome?: string): Observable<Uva[]> {
    return this.findPage(nome, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(nome: string | undefined, paginacao: ConsultaPaginada): Observable<Pagina<Uva>> {
    let params = new HttpParams().set('page', paginacao.page).set('size', paginacao.size);

    if (nome?.trim()) {
      params = params.set('nome', nome.trim());
    }

    return this.httpClient
      .get<Uva[] | PaginaResponse<Uva> | null>(this.api, { params })
      .pipe(map((response) => normalizarPagina(response, paginacao.page, paginacao.size)));
  }

  findById(id: number): Observable<Uva> {
    return this.httpClient.get<Uva>(`${this.api}/${id}`);
  }

  create(payload: UvaFormValue): Observable<Uva> {
    return this.httpClient.post<Uva>(this.api, payload);
  }

  update(id: number, payload: UvaFormValue): Observable<Uva> {
    return this.httpClient.put<Uva>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
