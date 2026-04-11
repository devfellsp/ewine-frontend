import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TipoVinhoService } from '../../../services/tipo-vinho.service';

type TipoVinhoFormGroup = FormGroup<{
  nome: FormControl<string>;
}>;

@Component({
  selector: 'app-tipo-vinho-form',
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
  templateUrl: './tipo-vinho-form.html',
  styleUrl: './tipo-vinho-form.css',
})
export class TipoVinhoForm {
  private readonly tipoVinhoService = inject(TipoVinhoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly tipoId = signal<number | null>(null);
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly form: TipoVinhoFormGroup = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando.set(true);
      this.tipoId.set(Number(id));
      this.carregarTipo(Number(id));
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
    const id = this.tipoId();

    const requisicao = this.editando() && id !== null
      ? this.tipoVinhoService.update(id, payload)
      : this.tipoVinhoService.create(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/admin/tipos-vinho']);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(err);
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/admin/tipos-vinho']);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected campoInvalido(): boolean {
    const controle = this.form.controls.nome;
    return controle.invalid && (controle.touched || controle.dirty);
  }

  private carregarTipo(id: number): void {
    this.tipoVinhoService.findById(id).subscribe({
      next: (tipo) => {
        this.form.setValue({
          nome: tipo.nome,
        });
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err),
    });
  }

  private tratarErro(err: HttpErrorResponse): void {
    console.error('Erro no formulario de tipo de vinho:', {
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

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : 'Nao foi possivel salvar o tipo.');
  }
}
