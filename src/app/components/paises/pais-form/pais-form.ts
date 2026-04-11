import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PaisService } from '../../../services/pais.service';

type PaisFormGroup = FormGroup<{
  nome: FormControl<string>;
  sigla: FormControl<string>;
}>;

@Component({
  selector: 'app-pais-form',
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
  templateUrl: './pais-form.html',
  styleUrl: './pais-form.css',
})
export class PaisForm {
  private readonly paisService = inject(PaisService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly paisId = signal<number | null>(null);
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly form: PaisFormGroup = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    sigla: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(3)],
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando.set(true);
      this.paisId.set(Number(id));
      this.carregarPais(Number(id));
    }
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set('');

    const payload = {
      ...this.form.getRawValue(),
      sigla: this.form.controls.sigla.value.toUpperCase(),
    };

    const id = this.paisId();

    const requisicao = this.editando() && id !== null
      ? this.paisService.update(id, payload)
      : this.paisService.create(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/admin/paises']);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(err);
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/admin/paises']);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected campoInvalido(nome: keyof PaisFormGroup['controls']): boolean {
    const controle = this.form.controls[nome];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  private carregarPais(id: number): void {
    this.paisService.findById(id).subscribe({
      next: (pais) => {
        this.form.setValue({
          nome: pais.nome,
          sigla: pais.sigla,
        });
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err),
    });
  }

  private tratarErro(err: HttpErrorResponse): void {
    console.error('Erro no formulario de pais:', {
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

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : 'Nao foi possivel salvar o pais.');
  }
}
