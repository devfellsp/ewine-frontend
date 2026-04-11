import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { ClienteCadastro } from '../models/cliente-cadastro.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly api = 'http://localhost:8080/clientes';

  constructor(private httpClient: HttpClient) { }

  cadastrar(dados: ClienteCadastro): Observable<any> {
    return this.httpClient.post(this.api, dados);
  }

  meusDados(): Observable<Cliente> {
    return this.httpClient.get<Cliente>(`${this.api}/me`);
  }
}
