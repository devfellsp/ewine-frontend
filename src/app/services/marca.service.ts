import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Marca, MarcaFormValue } from '../models/marca.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

type MarcaResponse = {
  id: number;
  nome: string;
  paisDeOrigem: string;
  anofundacao: string;
  classificacao: string;
};

@Injectable({
  providedIn: 'root',
})
export class MarcaService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/marcas';

  findAll(nome?: string): Observable<Marca[]> {
    return this.findPage(nome, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(nome: string | undefined, paginacao: ConsultaPaginada): Observable<Pagina<Marca>> {
    let params = new HttpParams();

    if (nome?.trim()) {
      params = params.set('nome', nome.trim());
    }

    params = params.set('page', paginacao.page).set('size', paginacao.size);

    return this.httpClient
      .get<MarcaResponse[] | PaginaResponse<MarcaResponse> | null>(`${this.api}/filter`, { params })
      .pipe(
        map((response) => {
          const pagina = normalizarPagina(response, paginacao.page, paginacao.size);
          return {
            ...pagina,
            itens: pagina.itens.map((item) => this.normalizar(item)),
          };
        }),
      );
  }

  findById(id: number): Observable<Marca> {
    return this.httpClient
      .get<MarcaResponse>(`${this.api}/${id}`)
      .pipe(map((response) => this.normalizar(response)));
  }

  create(payload: MarcaFormValue): Observable<Marca> {
    return this.httpClient
      .post<MarcaResponse>(this.api, payload)
      .pipe(map((response) => this.normalizar(response)));
  }

  update(id: number, payload: MarcaFormValue): Observable<Marca> {
    return this.httpClient
      .put<MarcaResponse>(`${this.api}/${id}`, payload)
      .pipe(map((response) => this.normalizar(response)));
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  private normalizar(response: MarcaResponse): Marca {
    return {
      id: response.id,
      nome: response.nome,
      paisDeOrigem: response.paisDeOrigem,
      anoFundacao: response.anofundacao,
      classificacao: response.classificacao,
    };
  }
}
