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
import { PaisService } from '../../../services/pais.service';
import { Pais } from '../../../models/pais.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pais-list',
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
  templateUrl: './pais-list.html',
  styleUrl: './pais-list.css',
})
export class PaisList {
  private readonly paisService = inject(PaisService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly nomeBusca = signal('');
  protected readonly siglaBusca = signal('');
  protected readonly paises = signal<Pais[]>([]);
  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  protected readonly totalRegistros = signal(0);

  protected readonly totalPaises = computed(() => this.totalRegistros());
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanhoPagina())));
  protected readonly podeVoltar = computed(() => this.paginaAtual() > 0);
  protected readonly podeAvancar = computed(() => this.paginaAtual() + 1 < this.totalPaginas());
  protected readonly totalSiglasUnicas = computed(() => new Set(this.paises().map((pais) => pais.sigla)).size);

  constructor() {
    this.carregarPaises();
  }

  protected pesquisar(): void {
    this.paginaAtual.set(0);
    this.carregarPaises();
  }

  protected limparBusca(): void {
    this.nomeBusca.set('');
    this.siglaBusca.set('');
    this.paginaAtual.set(0);
    this.carregarPaises();
  }

  protected paginaAnterior(): void {
    if (!this.podeVoltar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina - 1);
    this.carregarPaises();
  }

  protected proximaPagina(): void {
    if (!this.podeAvancar()) {
      return;
    }

    this.paginaAtual.update((pagina) => pagina + 1);
    this.carregarPaises();
  }

  protected editar(id: number): void {
    this.router.navigate(['/admin/paises/edit', id]);
  }

  protected excluir(pais: Pais): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusao',
        mensagem: `Deseja realmente excluir o pais "${pais.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      this.paisService.delete(pais.id).subscribe({
        next: () => this.carregarPaises(),
        error: (err: HttpErrorResponse) => this.tratarErro(err, 'Erro ao excluir pais.'),
      });
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarPaises(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.paisService
      .findPage(
        {
          nome: this.nomeBusca(),
          sigla: this.siglaBusca(),
        },
        { page: this.paginaAtual(), size: this.tamanhoPagina() },
      )
      .subscribe({
        next: (pagina) => {
          this.paises.set(pagina.itens);
          this.totalRegistros.set(pagina.total);
          this.carregando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.carregando.set(false);
          this.tratarErro(err, 'Erro ao carregar paises.');
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
