import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Login } from '../../../models/login.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  credenciais = new Login();
  erro = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar(): void {
    this.authService.login(this.credenciais).subscribe({
      next: () => {
        this.router.navigate(['/produtos']);
      },
      error: () => {
        this.erro = true;
      }
    });
  }
}
