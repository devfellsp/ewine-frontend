import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Marca } from '../../../models/marca.model';
import { AuthService } from '../../../services/auth.service';
import { MarcaService } from '../../../services/marca.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-marca-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './marca-list.html',
  styleUrl: './marca-list.css',
})
export class MarcaList {
  private readonly marcaService = inject(MarcaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly termoBusca = signal('');
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  protected readonly totalRegistros = signal(0);

  protected readonly totalMarcas = computed(() => this.totalRegistros());
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanhoPagina())));
  protected readonly podeVoltar = computed(() => this.paginaAtual() > 0);
  protected readonly podeAvancar = computed(() => this.paginaAtual() + 1 < this.totalPaginas());
  protected readonly marcasInternacionais = computed(
    () => this.marcas().filter((marca) => marca.paisDeOrigem.trim().toLowerCase() !== 'brasil').length,
  );

  constructor() {
    this.carregarMarcas();
  }

  protected pesquisar(): void {
    this.paginaAtual.set(0);
    this.carregarMarcas(this.termoBusca());
  }

  protected limparBusca(): void {
    this.termoBusca.set('');
    this.paginaAtual.set(0);
    this.carregarMarcas();
  }

  protected paginaAnterior(): void {
    if (!this.podeVoltar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina - 1);
    this.carregarMarcas(this.termoBusca());
  }

  protected proximaPagina(): void {
    if (!this.podeAvancar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina + 1);
    this.carregarMarcas(this.termoBusca());
  }

  protected editar(id: number): void {
    this.router.navigate(['/admin/marcas/edit', id]);
  }

  protected excluir(marca: Marca): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusao',
        mensagem: `Deseja realmente excluir a marca "${marca.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      this.marcaService.delete(marca.id).subscribe({
        next: () => this.carregarMarcas(this.termoBusca()),
        error: (err: HttpErrorResponse) => this.tratarErro(err, 'Erro ao excluir marca.'),
      });
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarMarcas(nome?: string): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.marcaService.findPage(nome, { page: this.paginaAtual(), size: this.tamanhoPagina() }).subscribe({
      next: (pagina) => {
        this.marcas.set(pagina.itens);
        this.totalRegistros.set(pagina.total);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.tratarErro(err, 'Erro ao carregar marcas.');
      },
    });
  }

  private tratarErro(err: HttpErrorResponse, fallback: string): void {
    console.error(fallback, {
      status: err.status,
      statusText: err.statusText,
      url: err.url,
      error: err.error,
    });

    if (err.status === 401 || err.status === 403) {
      this.authService.limparSessaoLocal();
      this.router.navigate(['/login']);
      return;
    }

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : fallback);
  }
}
