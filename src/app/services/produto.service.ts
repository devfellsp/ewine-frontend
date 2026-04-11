import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Produto } from '../models/produto.model';
import { ConsultaPaginada, normalizarPagina, Pagina, PaginaResponse } from '../models/paginacao.model';

type ProdutoRequest = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {

  private readonly api = 'http://localhost:8080/produtos';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Produto[]> {
    return this.findPage(undefined, { page: 0, size: 1000 }).pipe(map((pagina) => pagina.itens));
  }

  findPage(nome: string | undefined, paginacao: ConsultaPaginada): Observable<Pagina<Produto>> {
    let params = new HttpParams().set('page', paginacao.page).set('size', paginacao.size);
    let url = this.api;

    if (nome?.trim()) {
      params = params.set('nome', nome.trim());
      url = `${this.api}/search`;
    }

    return this.httpClient
      .get<Produto[] | PaginaResponse<Produto> | null>(url, { params })
      .pipe(map((response) => normalizarPagina(response, paginacao.page, paginacao.size)));
  }

  findById(id: number): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.api}/${id}`);
  }

  create(produto: ProdutoRequest): Observable<Produto> {
    return this.httpClient.post<Produto>(`${this.api}/vinhos`, produto);
  }

  update(id: number, produto: ProdutoRequest): Observable<Produto> {
    return this.httpClient.put<Produto>(`${this.api}/${id}/vinhos`, produto);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
