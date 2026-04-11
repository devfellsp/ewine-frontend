import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UvaService } from '../../../services/uva.service';

type UvaFormGroup = FormGroup<{
  nome: FormControl<string>;
}>;

@Component({
  selector: 'app-uva-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './uva-form.html',
  styleUrl: './uva-form.css',
})
export class UvaForm {
  private readonly uvaService = inject(UvaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly uvaId = signal<number | null>(null);
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly form: UvaFormGroup = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando.set(true);
      this.uvaId.set(Number(id));
      this.carregarUva(Number(id));
    }
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set('');

    const payload = this.form.getRawValue();
    const id = this.uvaId();

    const requisicao = this.editando() && id !== null
      ? this.uvaService.update(id, payload)
      : this.uvaService.create(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/admin/uvas']);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(err);
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/admin/uvas']);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected campoInvalido(): boolean {
    const controle = this.form.controls.nome;
    return controle.invalid && (controle.touched || controle.dirty);
  }

  private carregarUva(id: number): void {
    this.uvaService.findById(id).subscribe({
      next: (uva) => {
        this.form.setValue({
          nome: uva.nome,
        });
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err),
    });
  }

  private tratarErro(err: HttpErrorResponse): void {
    console.error('Erro no formulario de uva:', {
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

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : 'Nao foi possivel salvar a uva.');
  }
}
