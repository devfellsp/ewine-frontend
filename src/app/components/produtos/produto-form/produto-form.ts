import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ProdutoService } from '../../../services/produto.service';

type OpcaoCatalogo = {
  id: number;
  nome: string;
};

type OpcaoSafra = {
  id: number;
  ano: number;
};

type ProdutoFormDto = {
  id: number | null;
  sku: string;
  nome: string;
  descricao: string;
  preco: number;
  quantEstoque: number;
  teorAlcoolico: number | null;
  volume: number | null;
  tipoVinho: { id: number };
  pais: { id: number };
  safra: { id: number };
  marca: { id: number };
  estilo: { id: number };
  ocasiao: { id: number };
  uvas: { id: number }[];
};

@Component({
  selector: 'app-produto-form',
  imports: [
    FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatCardModule, MatSelectModule,
    RouterLink, RouterLinkActive
  ],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css'
})
export class ProdutoForm implements OnInit {

  editando = false;
  uvaId: number = 0;
  produtoId: number = 0;
  tiposVinho: OpcaoCatalogo[] = [];
  paises: OpcaoCatalogo[] = [];
  safras: OpcaoSafra[] = [];
  marcas: OpcaoCatalogo[] = [];
  estilos: OpcaoCatalogo[] = [];
  ocasioes: OpcaoCatalogo[] = [];
  uvas: OpcaoCatalogo[] = [];
  formSubmetido = false;
  mensagemErro = '';

  dto: ProdutoFormDto = {
    id: null,
    sku: '',
    nome: '',
    descricao: '',
    preco: 0,
    quantEstoque: 0,
    teorAlcoolico: null,
    volume: null,
    tipoVinho: { id: 0 },
    pais: { id: 0 },
    safra: { id: 0 },
    marca: { id: 0 },
    estilo: { id: 0 },
    ocasiao: { id: 0 },
    uvas: []
  };

  constructor(
    private httpClient: HttpClient,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregarOpcoes();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.produtoId = Number(id);
      this.produtoService.findById(this.produtoId).subscribe((data: any) => {
        this.dto.id = data.id ?? this.produtoId;
        this.dto.sku = data.sku;
        this.dto.nome = data.nome;
        this.dto.descricao = data.descricao;
        this.dto.preco = data.preco;
        this.dto.quantEstoque = data.estoque ?? data.quantEstoque;
        this.dto.teorAlcoolico = data.teorAlcoolico;
        this.dto.volume = data.volume;
        this.dto.tipoVinho = { id: data.tipoVinho?.id ?? 0 };
        this.dto.pais = { id: data.pais?.id ?? 0 };
        this.dto.safra = { id: data.safra?.id ?? 0 };
        this.dto.marca = { id: data.marca?.id ?? 0 };
        this.dto.estilo = { id: data.estilo?.id ?? 0 };
        this.dto.ocasiao = { id: data.ocasiao?.id ?? 0 };
        this.uvaId = data.uvas?.[0]?.id ?? 0;
      });
    }
  }

  salvar(): void {
    this.formSubmetido = true;
    this.mensagemErro = '';

    if (!this.formularioValido()) {
      this.mensagemErro = 'Preencha os campos obrigatorios antes de salvar.';
      return;
    }

    this.dto.id = this.editando ? this.produtoId : null;
    this.dto.uvas = [{ id: this.uvaId }];

    console.log('DTO enviado:', JSON.stringify(this.dto, null, 2));
    console.log('ID do produto:', this.produtoId);
    console.log('Editando:', this.editando);

    if (this.editando) {
      this.produtoService.update(this.produtoId, this.dto).subscribe({
        next: (res) => {
          console.log('Resposta do servidor:', res);
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          console.error('Erro ao atualizar:', err);
          console.error('Status:', err.status);
          console.error('Body:', err.error);
        }
      });
    } else {
      this.produtoService.create(this.dto).subscribe({
        next: (res) => {
          console.log('Produto criado:', res);
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          console.error('Erro ao criar:', err);
          console.error('Status:', err.status);
          console.error('Body:', err.error);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/produtos']);
  }

  campoTextoInvalido(valor: string): boolean {
    return this.formSubmetido && valor.trim().length === 0;
  }

  campoNumeroInvalido(valor: number | null): boolean {
    return this.formSubmetido && (valor === null || valor <= 0);
  }

  campoSelecaoInvalido(valor: number): boolean {
    return this.formSubmetido && (!valor || valor <= 0);
  }

  private formularioValido(): boolean {
    return (
      this.dto.sku.trim().length > 0 &&
      this.dto.nome.trim().length >= 2 &&
      this.dto.descricao.trim().length >= 10 &&
      this.dto.preco > 0 &&
      this.dto.quantEstoque >= 0 &&
      this.dto.teorAlcoolico !== null &&
      this.dto.teorAlcoolico > 0 &&
      this.dto.volume !== null &&
      this.dto.volume > 0 &&
      this.dto.tipoVinho.id > 0 &&
      this.dto.pais.id > 0 &&
      this.dto.safra.id > 0 &&
      this.dto.marca.id > 0 &&
      this.dto.estilo.id > 0 &&
      this.dto.ocasiao.id > 0 &&
      this.uvaId > 0
    );
  }

  private carregarOpcoes(): void {
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/tipos-vinho', (data) => {
      this.tiposVinho = data;
    });
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/paises', (data) => {
      this.paises = data;
    });
    this.carregarLista<OpcaoSafra>('http://localhost:8080/safras', (data) => {
      this.safras = data;
    });
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/marcas/filter', (data) => {
      this.marcas = data;
    });
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/estilos', (data) => {
      this.estilos = data;
    });
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/ocasioes', (data) => {
      this.ocasioes = data;
    });
    this.carregarLista<OpcaoCatalogo>('http://localhost:8080/uvas', (data) => {
      this.uvas = data;
    });
  }

  private carregarLista<T>(url: string, onSuccess: (data: T[]) => void): void {
    this.httpClient.get<T[] | null>(url).subscribe({
      next: (data) => onSuccess(data ?? []),
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar opcoes do formulario:', {
          url,
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
      }
    });
  }
}
