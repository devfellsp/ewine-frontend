import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-loja',
  imports: [
    CurrencyPipe,
    MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatCardModule, MatTooltipModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './loja.html',
  styleUrl: './loja.css'
})
export class LojaComponent implements OnInit {

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  loading = true;
  skeletons = Array(8).fill(0);

  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loading = true;
    this.produtoService.findAll().subscribe({
      next: (data) => {
        this.produtos = data;
        this.produtosFiltrados = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();
    this.produtosFiltrados = this.produtos.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }

  verDetalhe(id: number): void {
    this.router.navigate(['/loja/produto', id]);
  }

  adicionarCarrinho(produto: Produto): void {
    this.snackBar.open(`🍷 "${produto.nome}" adicionado ao carrinho!`, 'Fechar', {
      duration: 3000
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
