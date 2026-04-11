import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Safra, SafraFormValue } from '../models/safra.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

@Injectable({
  providedIn: 'root',
})
export class SafraService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/safras';

  findAll(filtros?: Partial<{ ano: string; descricao: string }>): Observable<Safra[]> {
    return this.findPage(filtros, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(
    filtros: Partial<{ ano: string; descricao: string }> | undefined,
    paginacao: ConsultaPaginada,
  ): Observable<Pagina<Safra>> {
    let params = new HttpParams();

    if (filtros?.ano?.trim()) {
      params = params.set('ano', filtros.ano.trim());
    }

    if (filtros?.descricao?.trim()) {
      params = params.set('descricao', filtros.descricao.trim());
    }

    params = params.set('page', paginacao.page).set('size', paginacao.size);

    return this.httpClient
      .get<Safra[] | PaginaResponse<Safra> | null>(`${this.api}/filter`, { params })
      .pipe(map((response) => normalizarPagina(response, paginacao.page, paginacao.size)));
  }

  findById(id: number): Observable<Safra> {
    return this.httpClient.get<Safra>(`${this.api}/${id}`);
  }

  create(payload: SafraFormValue): Observable<Safra> {
    return this.httpClient.post<Safra>(this.api, payload);
  }

  update(id: number, payload: SafraFormValue): Observable<Safra> {
    return this.httpClient.put<Safra>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
