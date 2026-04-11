import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MarcaService } from '../../../services/marca.service';

type MarcaFormGroup = FormGroup<{
  nome: FormControl<string>;
  paisDeOrigem: FormControl<string>;
  anoFundacao: FormControl<Date | null>;
  classificacao: FormControl<string>;
}>;

@Component({
  selector: 'app-marca-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './marca-form.html',
  styleUrl: './marca-form.css',
})
export class MarcaForm {
  private readonly marcaService = inject(MarcaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly marcaId = signal<number | null>(null);
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly form: MarcaFormGroup = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    paisDeOrigem: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    anoFundacao: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    classificacao: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando.set(true);
      this.marcaId.set(Number(id));
      this.carregarMarca(Number(id));
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
    const id = this.marcaId();
    const anoFundacao = payload.anoFundacao ? this.formatarData(payload.anoFundacao) : '';

    const requisicao = this.editando() && id !== null
      ? this.marcaService.update(id, { ...payload, anoFundacao })
      : this.marcaService.create({ ...payload, anoFundacao });

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/admin/marcas']);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(err);
      },
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/admin/marcas']);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected campoInvalido(nome: keyof MarcaFormGroup['controls']): boolean {
    const controle = this.form.controls[nome];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  private carregarMarca(id: number): void {
    this.marcaService.findById(id).subscribe({
      next: (marca) => {
        this.form.setValue({
          nome: marca.nome,
          paisDeOrigem: marca.paisDeOrigem,
          anoFundacao: this.parseData(marca.anoFundacao),
          classificacao: marca.classificacao,
        });
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err),
    });
  }

  private parseData(valor: string): Date | null {
    const valorNormalizado = valor.trim();

    if (!valorNormalizado) {
      return null;
    }

    if (/^\d{4}$/.test(valorNormalizado)) {
      return new Date(Number(valorNormalizado), 0, 1);
    }

    const data = new Date(valorNormalizado);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private tratarErro(err: HttpErrorResponse): void {
    console.error('Erro no formulario de marca:', {
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

    this.mensagemErro.set(typeof err.error?.message === 'string' ? err.error.message : 'Nao foi possivel salvar a marca.');
  }
}
