import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Login } from '../../../models/login.model';
import { ClienteCadastro } from '../../../models/cliente-cadastro.model';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatCardModule, MatTabsModule, MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  // LOGIN
  credenciais = new Login();
  erro = false;

  // CADASTRO
  cadastro = new ClienteCadastro();
  erroCadastro = false;
  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  entrar(): void {
    this.erro = false;
    this.authService.login(this.credenciais).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/produtos']);
        } else {
          this.router.navigate(['/loja']);
        }
      },
      error: () => {
        this.erro = true;
      }
    });
  }

  criarConta(): void {
    this.erroCadastro = false;
    this.clienteService.cadastrar(this.cadastro).subscribe({
      next: () => {
        this.snackBar.open('✅ Conta criada com sucesso! Faça login.', 'Fechar', {
          duration: 4000
        });
        this.cadastro = new ClienteCadastro();
      },
      error: (err) => {
        this.erroCadastro = true;
        this.mensagemErro = err?.error?.message ?? 'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}
