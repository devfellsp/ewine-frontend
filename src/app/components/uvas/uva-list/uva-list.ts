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
import { Uva } from '../../../models/uva.model';
import { UvaService } from '../../../services/uva.service';

@Component({
  selector: 'app-uva-list',
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
  templateUrl: './uva-list.html',
  styleUrl: './uva-list.css',
})
export class UvaList {
  private readonly uvaService = inject(UvaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly termoBusca = signal('');
  protected readonly uvas = signal<Uva[]>([]);
  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  protected readonly totalRegistros = signal(0);

  protected readonly totalUvas = computed(() => this.totalRegistros());
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanhoPagina())));
  protected readonly podeVoltar = computed(() => this.paginaAtual() > 0);
  protected readonly podeAvancar = computed(() => this.paginaAtual() + 1 < this.totalPaginas());

  constructor() {
    this.carregarUvas();
  }

  protected pesquisar(): void {
    this.paginaAtual.set(0);
    this.carregarUvas();
  }

  protected limparBusca(): void {
    this.termoBusca.set('');
    this.paginaAtual.set(0);
    this.carregarUvas();
  }

  protected paginaAnterior(): void {
    if (!this.podeVoltar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina - 1);
    this.carregarUvas();
  }

  protected proximaPagina(): void {
    if (!this.podeAvancar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina + 1);
    this.carregarUvas();
  }

  protected editar(id: number): void {
    this.router.navigate(['/admin/uvas/edit', id]);
  }

  protected excluir(uva: Uva): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusao',
        mensagem: `Deseja realmente excluir a uva "${uva.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      this.uvaService.delete(uva.id).subscribe({
        next: () => this.carregarUvas(),
        error: (err: HttpErrorResponse) => this.tratarErro(err, 'Erro ao excluir uva.'),
      });
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarUvas(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.uvaService.findPage(this.termoBusca(), { page: this.paginaAtual(), size: this.tamanhoPagina() }).subscribe({
      next: (pagina) => {
        this.uvas.set(pagina.itens);
        this.totalRegistros.set(pagina.total);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.tratarErro(err, 'Erro ao carregar uvas.');
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
