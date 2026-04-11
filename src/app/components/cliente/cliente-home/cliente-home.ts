import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Cliente } from '../../../models/cliente.model';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './cliente-home.html',
  styleUrl: './cliente-home.css',
})
export class ClienteHomeComponent {
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly perfil = computed(() => this.authService.getPerfil() ?? 'CLIENTE');
  protected cliente: Cliente | null = null;
  protected carregando = true;
  protected mensagemErro = '';

  constructor() {
    this.carregarCliente();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarCliente(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.clienteService.meusDados().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.carregando = false;

        console.error('Erro ao carregar dados do cliente:', {
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

        this.mensagemErro =
          err.status === 404
            ? 'Endpoint /clientes/me ainda nao existe no backend.'
            : typeof err.error?.message === 'string'
              ? err.error.message
            : 'Nao foi possivel carregar seus dados.';
        this.cdr.markForCheck();
      },
    });
  }
}
