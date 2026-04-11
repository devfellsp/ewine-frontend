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
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { TipoVinho } from '../../../models/tipo-vinho.model';
import { TipoVinhoService } from '../../../services/tipo-vinho.service';

@Component({
  selector: 'app-tipo-vinho-list',
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
  templateUrl: './tipo-vinho-list.html',
  styleUrl: './tipo-vinho-list.css',
})
export class TipoVinhoList {
  private readonly tipoVinhoService = inject(TipoVinhoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly termoBusca = signal('');
  protected readonly tipos = signal<TipoVinho[]>([]);
  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  protected readonly totalRegistros = signal(0);

  protected readonly totalTipos = computed(() => this.totalRegistros());
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanhoPagina())));
  protected readonly podeVoltar = computed(() => this.paginaAtual() > 0);
  protected readonly podeAvancar = computed(() => this.paginaAtual() + 1 < this.totalPaginas());
  protected readonly maiorNome = computed(() => {
    const tamanhos = this.tipos().map((tipo) => tipo.nome.length);
    return tamanhos.length > 0 ? Math.max(...tamanhos) : 0;
  });

  constructor() {
    this.carregarTipos();
  }

  protected pesquisar(): void {
    this.paginaAtual.set(0);
    this.carregarTipos(this.termoBusca());
  }

  protected limparBusca(): void {
    this.termoBusca.set('');
    this.paginaAtual.set(0);
    this.carregarTipos();
  }

  protected paginaAnterior(): void {
    if (!this.podeVoltar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina - 1);
    this.carregarTipos(this.termoBusca());
  }

  protected proximaPagina(): void {
    if (!this.podeAvancar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina + 1);
    this.carregarTipos(this.termoBusca());
  }

  protected editar(id: number): void {
    this.router.navigate(['/admin/tipos-vinho/edit', id]);
  }

  protected excluir(tipo: TipoVinho): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusao',
        mensagem: `Deseja realmente excluir o tipo "${tipo.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      this.tipoVinhoService.delete(tipo.id).subscribe({
        next: () => this.carregarTipos(this.termoBusca()),
        error: (err: HttpErrorResponse) => this.tratarErro(err, 'Erro ao excluir tipo de vinho.'),
      });
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarTipos(nome?: string): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.tipoVinhoService.findPage(nome, { page: this.paginaAtual(), size: this.tamanhoPagina() }).subscribe({
      next: (pagina) => {
        this.tipos.set(pagina.itens);
        this.totalRegistros.set(pagina.total);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.tratarErro(err, 'Erro ao carregar tipos de vinho.');
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
