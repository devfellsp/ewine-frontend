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
import { Safra } from '../../../models/safra.model';
import { SafraService } from '../../../services/safra.service';

@Component({
  selector: 'app-safra-list',
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
  templateUrl: './safra-list.html',
  styleUrl: './safra-list.css',
})
export class SafraList {
  private readonly safraService = inject(SafraService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly anoBusca = signal('');
  protected readonly descricaoBusca = signal('');
  protected readonly safras = signal<Safra[]>([]);
  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  protected readonly totalRegistros = signal(0);

  protected readonly totalSafras = computed(() => this.totalRegistros());
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanhoPagina())));
  protected readonly podeVoltar = computed(() => this.paginaAtual() > 0);
  protected readonly podeAvancar = computed(() => this.paginaAtual() + 1 < this.totalPaginas());
  protected readonly anoMaisRecente = computed(() => {
    const anos = this.safras().map((safra) => safra.ano);
    return anos.length > 0 ? Math.max(...anos) : 0;
  });

  constructor() {
    this.carregarSafras();
  }

  protected pesquisar(): void {
    this.paginaAtual.set(0);
    this.carregarSafras();
  }

  protected limparBusca(): void {
    this.anoBusca.set('');
    this.descricaoBusca.set('');
    this.paginaAtual.set(0);
    this.carregarSafras();
  }

  protected paginaAnterior(): void {
    if (!this.podeVoltar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina - 1);
    this.carregarSafras();
  }

  protected proximaPagina(): void {
    if (!this.podeAvancar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina + 1);
    this.carregarSafras();
  }

  protected editar(id: number): void {
    this.router.navigate(['/admin/safras/edit', id]);
  }

  protected excluir(safra: Safra): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusao',
        mensagem: `Deseja realmente excluir a safra "${safra.ano}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      this.safraService.delete(safra.id).subscribe({
        next: () => this.carregarSafras(),
        error: (err: HttpErrorResponse) => this.tratarErro(err, 'Erro ao excluir safra.'),
      });
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarSafras(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.safraService
      .findPage(
        {
          ano: this.anoBusca(),
          descricao: this.descricaoBusca(),
        },
        { page: this.paginaAtual(), size: this.tamanhoPagina() },
      )
      .subscribe({
        next: (pagina) => {
          this.safras.set(pagina.itens);
          this.totalRegistros.set(pagina.total);
          this.carregando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.carregando.set(false);
          this.tratarErro(err, 'Erro ao carregar safras.');
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
