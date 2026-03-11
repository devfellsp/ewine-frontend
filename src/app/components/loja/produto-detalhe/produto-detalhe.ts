import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProdutoService } from '../../../services/produto.service';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-produto-detalhe',
  imports: [
    CurrencyPipe,
    MatIconModule, MatButtonModule,
    MatSnackBarModule, MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css'
})
export class ProdutoDetalheComponent implements OnInit {

  produto: Produto | null = null;
  loading = true;
  quantidade = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID capturado:', id);

    this.produtoService.findById(id).subscribe({
      next: (data) => {
        console.log('Produto recebido:', data);
        this.produto = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/loja']);
      }
    });
  }

  aumentar(): void {
    if (this.produto && this.quantidade < this.produto.quantEstoque) {
      this.quantidade++;
    }
  }

  diminuir(): void {
    if (this.quantidade > 1) this.quantidade--;
  }

  adicionarCarrinho(): void {
    this.snackBar.open(`🍷 "${this.produto?.nome}" adicionado ao carrinho!`, 'Fechar', {
      duration: 3000
    });
  }

  voltar(): void {
    this.router.navigate(['/loja']);
  }
}
