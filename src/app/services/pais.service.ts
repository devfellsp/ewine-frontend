import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Pais, PaisFormValue } from '../models/pais.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

@Injectable({
  providedIn: 'root',
})
export class PaisService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/paises';

  findAll(filtros?: Partial<PaisFormValue>): Observable<Pais[]> {
    return this.findPage(filtros, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(filtros: Partial<PaisFormValue> | undefined, paginacao: ConsultaPaginada): Observable<Pagina<Pais>> {
    let params = new HttpParams();

    if (filtros?.nome?.trim()) {
      params = params.set('nome', filtros.nome.trim());
    }

    if (filtros?.sigla?.trim()) {
      params = params.set('sigla', filtros.sigla.trim());
    }

    params = params.set('page', paginacao.page).set('size', paginacao.size);

    return this.httpClient
      .get<Pais[] | PaginaResponse<Pais> | null>(`${this.api}/filter`, { params })
      .pipe(map((response) => normalizarPagina(response, paginacao.page, paginacao.size)));
  }

  findById(id: number): Observable<Pais> {
    return this.httpClient.get<Pais>(`${this.api}/${id}`);
  }

  create(payload: PaisFormValue): Observable<Pais> {
    return this.httpClient.post<Pais>(this.api, payload);
  }

  update(id: number, payload: PaisFormValue): Observable<Pais> {
    return this.httpClient.put<Pais>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
