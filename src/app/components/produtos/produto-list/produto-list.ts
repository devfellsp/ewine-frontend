import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, Router } from '@angular/router';
import { Produto } from '../../../models/produto.model';
import { ProdutoService } from '../../../services/produto.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-produto-list',
  imports: [
    CurrencyPipe,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatTableModule, MatInputModule, MatFormFieldModule,
    MatDialogModule, MatTooltipModule, RouterLink
  ],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css'
})
export class ProdutoList implements OnInit {

  displayedColumns: string[] = ['id', 'nome', 'preco', 'estoque', 'ativo', 'acoes'];
  dataSource = new MatTableDataSource<Produto>([]);

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
    this.produtoService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editar(id: number): void {
    this.router.navigate(['/produtos/edit', id]);
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
