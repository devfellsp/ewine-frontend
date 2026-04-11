import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TipoVinho, TipoVinhoFormValue } from '../models/tipo-vinho.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

@Injectable({
  providedIn: 'root',
})
export class TipoVinhoService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/tipos-vinho';

  findAll(nome?: string): Observable<TipoVinho[]> {
    return this.findPage(nome, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(nome: string | undefined, paginacao: ConsultaPaginada): Observable<Pagina<TipoVinho>> {
    let params = new HttpParams();

    if (nome?.trim()) {
      params = params.set('nome', nome.trim());
    }

    params = params.set('page', paginacao.page).set('size', paginacao.size);

    return this.httpClient
      .get<TipoVinho[] | PaginaResponse<TipoVinho> | null>(`${this.api}/filter`, { params })
      .pipe(map((response) => normalizarPagina(response, paginacao.page, paginacao.size)));
  }

  findById(id: number): Observable<TipoVinho> {
    return this.httpClient.get<TipoVinho>(`${this.api}/${id}`);
  }

  create(payload: TipoVinhoFormValue): Observable<TipoVinho> {
    return this.httpClient.post<TipoVinho>(this.api, payload);
  }

  update(id: number, payload: TipoVinhoFormValue): Observable<TipoVinho> {
    return this.httpClient.put<TipoVinho>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
