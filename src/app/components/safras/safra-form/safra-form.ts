import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SafraService } from '../../../services/safra.service';

type SafraFormGroup = FormGroup<{
  ano: FormControl<number | null>;
  descricao: FormControl<string>;
}>;

@Component({
  selector: 'app-safra-form',
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
  templateUrl: './safra-form.html',
  styleUrl: './safra-form.css',
})
export class SafraForm {
  private readonly safraService = inject(SafraService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly safraId = signal<number | null>(null);
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly form: SafraFormGroup = new FormGroup({
    ano: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1900), Validators.max(2100)],
    }),
    descricao: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando.set(true);
      this.safraId.set(Number(id));
      this.carregarSafra(Number(id));
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
    const id = this.safraId();

    const requisicao = this.editando() && id !== null
      ? this.safraService.update(id, payload as { ano: number; descricao: string })
      : this.safraService.create(payload as { ano: number; descricao: string });

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/admin/safras']);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(err);
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/admin/safras']);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected campoInvalido(nome: keyof SafraFormGroup['controls']): boolean {
    const controle = this.form.controls[nome];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  private carregarSafra(id: number): void {
    this.safraService.findById(id).subscribe({
      next: (safra) => {
        this.form.setValue({
          ano: safra.ano,
          descricao: safra.descricao,
        });
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err),
    });
  }

  private tratarErro(err: HttpErrorResponse): void {
    console.error('Erro no formulario de safra:', {
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

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : 'Nao foi possivel salvar a safra.');
  }
}
