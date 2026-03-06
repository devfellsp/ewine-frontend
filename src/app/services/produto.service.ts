import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {

  private readonly api = 'http://localhost:8080/produtos';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(this.api);
  }

  findById(id: number): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.api}/${id}`);
  }
}
