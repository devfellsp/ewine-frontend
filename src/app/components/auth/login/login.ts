import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ClienteCadastro } from '../../../models/cliente-cadastro.model';
import { Login } from '../../../models/login.model';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  credenciais = new Login();
  erro = false;
  mensagemErroLogin = '';

  cadastro = new ClienteCadastro();
  erroCadastro = false;
  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  entrar(): void {
    this.erro = false;
    this.mensagemErroLogin = '';

    this.authService.login(this.credenciais).subscribe({
      next: () => {
        if (!this.authService.temPerfilReconhecido()) {
          this.erro = true;
          this.mensagemErroLogin = 'Login aceito, mas o perfil retornado pelo backend nao foi reconhecido.';
          this.snackBar.open(this.mensagemErroLogin, 'Fechar', {
            duration: 5000,
          });
          this.cdr.detectChanges();
          return;
        }

        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/produtos']);
        } else {
          this.router.navigate(['/loja']);
        }

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.erro = true;
        this.mensagemErroLogin = this.obterMensagemErroLogin(err);
        console.error('Erro no login:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          url: err.url,
        });
        this.cdr.detectChanges();
      },
    });
  }

  criarConta(): void {
    this.erroCadastro = false;

    this.clienteService.cadastrar(this.cadastro).subscribe({
      next: () => {
        this.snackBar.open('Conta criada com sucesso. Faca login.', 'Fechar', {
          duration: 4000,
        });
        this.cadastro = new ClienteCadastro();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erroCadastro = true;
        this.mensagemErro = err?.error?.message ?? 'Erro ao criar conta. Tente novamente.';
        this.cdr.detectChanges();
      },
    });
  }

  private obterMensagemErroLogin(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Falha de conexao com o backend ou bloqueio de CORS/cookies.';
    }

    if (err.status === 401 || err.status === 403) {
      return 'Backend rejeitou o login. Verifique credenciais, cookie e resposta do /auth.';
    }

    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }

    return 'Erro ao autenticar. Status HTTP: ' + err.status;
  }
}
