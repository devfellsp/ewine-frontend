import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CidadeCliente, Cliente, NovoEnderecoCliente } from '../models/cliente.model';
import { ClienteCadastro } from '../models/cliente-cadastro.model';
import { Pedido } from '../models/pedido.model';
import { PaginaResponse, normalizarLista } from '../models/paginacao.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly httpClient = inject(HttpClient);
  private readonly api = 'http://localhost:8080/clientes';

  cadastrar(dados: ClienteCadastro): Observable<Cliente> {
    return this.httpClient.post<Cliente>(this.api, dados);
  }

  meusDados(): Observable<Cliente> {
    return this.httpClient.get<Cliente>(`${this.api}/me`);
  }

  meusPedidos(): Observable<Pedido[]> {
    return this.httpClient
      .get<Pedido[] | PaginaResponse<Pedido> | null>('http://localhost:8080/pedidos/meus-pedidos')
      .pipe(map((response) => normalizarLista(response)));
  }

  atualizarNome(payload: { senhaAtual: string; nome: string }): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${this.api}/me/nome`, payload);
  }

  atualizarEmail(payload: { senhaAtual: string; email: string }): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${this.api}/me/email`, payload);
  }

  atualizarSenha(payload: { senhaAtual: string; senha: string }): Observable<void> {
    return this.httpClient.patch<void>('http://localhost:8080/usuarios/senha', payload);
  }

  listarCidades(): Observable<CidadeCliente[]> {
    return this.httpClient.get<CidadeCliente[]>('http://localhost:8080/cidades');
  }

  adicionarEndereco(payload: NovoEnderecoCliente): Observable<Cliente> {
    return this.httpClient.patch<Cliente>(`${this.api}/enderecos`, payload);
  }
}
