import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { Produto } from '../../../models/produto.model';
import { ProdutoService } from '../../../services/produto.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-produto-list',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatTableModule, MatInputModule, MatFormFieldModule,
    MatDialogModule, MatTooltipModule, RouterLink, RouterLinkActive
  ],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css'
})
export class ProdutoList implements OnInit {

  displayedColumns: string[] = ['id', 'nome', 'preco', 'estoque', 'ativo', 'acoes'];
  dataSource = new MatTableDataSource<Produto>([]);
  termoBusca = '';
  paginaAtual = 0;
  tamanhoPagina = 10;
  totalRegistros = 0;

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.tamanhoPagina));
  }

  get podeVoltar(): boolean {
    return this.paginaAtual > 0;
  }

  get podeAvancar(): boolean {
    return this.paginaAtual + 1 < this.totalPaginas;
  }

  get produtosAtivos(): number {
    return this.dataSource.data.filter(p => p.ativo).length;
  }

  get precoMedio(): number {
    const total = this.dataSource.data.length;
    if (total === 0) return 0;
    return this.dataSource.data.reduce((sum, p) => sum + p.preco, 0) / total;
  }

  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.findPage(this.termoBusca, { page: this.paginaAtual, size: this.tamanhoPagina }).subscribe({
      next: (pagina) => {
        console.log('Produto recebido:', JSON.stringify(pagina.itens[0], null, 2));
        this.dataSource.data = pagina.itens;
        this.totalRegistros = pagina.total;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar produtos:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
        });

        if (err.status === 401 || err.status === 403) {
          this.authService.limparSessaoLocal();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  pesquisar(): void {
    this.paginaAtual = 0;
    this.carregarProdutos();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 0;
    this.carregarProdutos();
  }

  paginaAnterior(): void {
    if (!this.podeVoltar) {
      return;
    }

    this.paginaAtual -= 1;
    this.carregarProdutos();
  }

  proximaPagina(): void {
    if (!this.podeAvancar) {
      return;
    }

    this.paginaAtual += 1;
    this.carregarProdutos();
  }

  editar(id: number): void {
    this.router.navigate(['/admin/produtos/edit', id]);
  }

  excluir(produto: Produto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: `Deseja realmente excluir o produto "${produto.nome}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.produtoService.delete(produto.id).subscribe(() => {
          this.carregarProdutos();
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
