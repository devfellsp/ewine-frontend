import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CidadeCliente, Cliente } from '../../../models/cliente.model';
import { Pedido } from '../../../models/pedido.model';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './cliente-home.html',
  styleUrl: './cliente-home.css',
})
export class ClienteHomeComponent {
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  protected readonly perfil = computed(() => this.authService.getPerfil() ?? 'CLIENTE');
  protected readonly menuAberto = signal(false);
  protected readonly secaoAtual = signal<SecaoCliente>('dados');
  protected readonly tituloPagina = computed(() => {
    const titulos: Record<SecaoCliente, string> = {
      dados: 'Resumo da conta',
      perfil: 'Dados do cliente',
      enderecos: 'Enderecos cadastrados',
      seguranca: 'Seguranca da conta',
      pedidos: 'Meus pedidos',
    };

    return titulos[this.secaoAtual()];
  });
  protected readonly descricaoPagina = computed(() => {
    const descricoes: Record<SecaoCliente, string> = {
      dados: 'Acompanhe seus dados principais, entregas, pedidos e acessos rapidos.',
      perfil: 'Confira suas informacoes pessoais e dados de contato cadastrados.',
      enderecos: 'Gerencie os enderecos usados para entrega dos seus vinhos.',
      seguranca: 'Gerencie seus dados de acesso e mantenha sua conta protegida.',
      pedidos: 'Consulte o historico das suas compras realizadas na E-Wine.',
    };

    return descricoes[this.secaoAtual()];
  });
  protected cliente: Cliente | null = null;
  protected pedidos: Pedido[] = [];
  protected carregando = true;
  protected mensagemErro = '';
  protected mensagemPerfil = '';
  protected readonly salvandoSenha = signal(false);
  protected readonly formularioEnderecoAberto = signal(false);
  protected readonly salvandoEndereco = signal(false);
  protected readonly cidades = signal<CidadeCliente[]>([]);
  protected readonly mensagemEndereco = signal('');
  protected readonly tipoMensagemEndereco = signal<'sucesso' | 'erro'>('sucesso');
  protected readonly pedidoExpandidoId = signal<number | null>(null);
  protected readonly nomeForm = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    nome: ['', [Validators.required, Validators.minLength(2)]],
  });
  protected readonly emailForm = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly senhaForm = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmacaoSenha: ['', Validators.required],
  }, { validators: [this.validarConfirmacaoSenha, this.validarSenhaDiferente] });
  protected readonly enderecoForm = this.fb.nonNullable.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    logradouro: ['', [Validators.required, Validators.minLength(3)]],
    numero: [1, [Validators.required, Validators.min(1)]],
    complemento: [''],
    cidadeId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.route.data.subscribe((data) => {
      const secao = data['secao'];
      this.secaoAtual.set(this.ehSecaoCliente(secao) ? secao : 'dados');
      this.menuAberto.set(false);
      this.cdr.markForCheck();
    });
    this.carregarCliente();
    this.carregarCidades();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }

  protected atualizarNome(): void {
    if (this.nomeForm.invalid) {
      this.nomeForm.markAllAsTouched();
      return;
    }

    this.clienteService.atualizarNome(this.nomeForm.getRawValue()).subscribe({
      next: (cliente) => this.atualizarPerfilLocal(cliente, 'Nome atualizado.'),
      error: () => this.definirMensagemPerfil('Nao foi possivel atualizar o nome.', 'erro'),
    });
  }

  protected atualizarEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.clienteService.atualizarEmail(this.emailForm.getRawValue()).subscribe({
      next: (cliente) => this.atualizarPerfilLocal(cliente, 'Email atualizado.'),
      error: () => this.definirMensagemPerfil('Nao foi possivel atualizar o email.', 'erro'),
    });
  }

  protected atualizarSenha(): void {
    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const { senhaAtual, senha } = this.senhaForm.getRawValue();
    this.salvandoSenha.set(true);
    this.clienteService.atualizarSenha({ senhaAtual, senha }).subscribe({
      next: () => {
        this.senhaForm.reset();
        this.salvandoSenha.set(false);
        this.definirMensagemPerfil('Senha atualizada.');
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoSenha.set(false);
        this.definirMensagemPerfil(this.extrairMensagemErro(err, 'Nao foi possivel atualizar a senha.'), 'erro');
      },
    });
  }

  protected alternarFormularioEndereco(): void {
    this.formularioEnderecoAberto.update((aberto) => !aberto);
    this.mensagemEndereco.set('');
  }

  protected adicionarEndereco(): void {
    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      return;
    }

    const dados = this.enderecoForm.getRawValue();
    this.salvandoEndereco.set(true);
    this.mensagemEndereco.set('');
    this.clienteService.adicionarEndereco({
      cep: dados.cep.replace(/\D/g, ''),
      numero: dados.numero,
      complemento: dados.complemento.trim(),
      logradouro: dados.logradouro.trim(),
      cidade: { id: dados.cidadeId },
    }).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.enderecoForm.reset({ cep: '', logradouro: '', numero: 1, complemento: '', cidadeId: 0 });
        this.salvandoEndereco.set(false);
        this.formularioEnderecoAberto.set(false);
        this.tipoMensagemEndereco.set('sucesso');
        this.mensagemEndereco.set('Endereco adicionado com sucesso.');
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoEndereco.set(false);
        this.tipoMensagemEndereco.set('erro');
        this.mensagemEndereco.set(this.extrairMensagemErro(err, 'Nao foi possivel adicionar o endereco.'));
        this.cdr.markForCheck();
      },
    });
  }

  protected alternarDetalhesPedido(id: number): void {
    this.pedidoExpandidoId.update((atual) => atual === id ? null : id);
  }

  protected subtotalItem(precoUnitario: number, quantidade: number): number {
    return precoUnitario * quantidade;
  }

  private carregarCliente(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.clienteService.meusDados().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.nomeForm.controls.nome.setValue(cliente.usuario.nome);
        this.emailForm.controls.email.setValue(cliente.email);
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

    this.clienteService.meusPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.cdr.markForCheck();
      },
      error: () => {
        this.pedidos = [];
      },
    });
  }

  private atualizarPerfilLocal(cliente: Cliente, mensagem: string): void {
    this.cliente = cliente;
    this.nomeForm.patchValue({ senhaAtual: '', nome: cliente.usuario.nome });
    this.emailForm.patchValue({ senhaAtual: '', email: cliente.email });
    this.definirMensagemPerfil(mensagem);
  }

  protected valorOuNaoInformado(valor: string | number | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'Nao informado';
    }

    return String(valor);
  }

  protected contadorEnderecos(): string {
    const total = this.cliente?.endereco.length ?? 0;
    return total === 1 ? '1 endereco cadastrado' : `${total} enderecos cadastrados`;
  }

  protected contadorPedidos(): string {
    const total = this.pedidos.length;
    return total === 1 ? '1 pedido registrado' : `${total} pedidos registrados`;
  }

  protected quantidadeItensPedido(pedido: Pedido): number {
    return pedido.itens?.reduce((total, item) => total + item.quantidade, 0) ?? 0;
  }

  protected readonly tipoMensagemPerfil = signal<'sucesso' | 'erro'>('sucesso');

  private definirMensagemPerfil(mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso'): void {
    this.mensagemPerfil = mensagem;
    this.tipoMensagemPerfil.set(tipo);
    this.cdr.markForCheck();
  }

  private carregarCidades(): void {
    this.clienteService.listarCidades().subscribe({
      next: (cidades) => {
        this.cidades.set(cidades);
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.tipoMensagemEndereco.set('erro');
        this.mensagemEndereco.set(
          err.status === 403
            ? 'O backend ainda nao permite que clientes consultem as cidades.'
            : 'Nao foi possivel carregar as cidades.',
        );
        this.cdr.markForCheck();
      },
    });
  }

  private validarConfirmacaoSenha(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha')?.value;
    const confirmacao = control.get('confirmacaoSenha')?.value;
    return senha && confirmacao && senha !== confirmacao ? { senhasDiferentes: true } : null;
  }

  private validarSenhaDiferente(control: AbstractControl): ValidationErrors | null {
    const senhaAtual = control.get('senhaAtual')?.value;
    const novaSenha = control.get('senha')?.value;
    return senhaAtual && novaSenha && senhaAtual === novaSenha ? { senhaNaoAlterada: true } : null;
  }

  private extrairMensagemErro(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 403) {
      return 'A senha atual esta incorreta ou voce nao tem permissao para esta operacao.';
    }

    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (typeof err.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }

    return fallback;
  }

  private ehSecaoCliente(secao: unknown): secao is SecaoCliente {
    return secao === 'dados' || secao === 'perfil' || secao === 'enderecos' || secao === 'seguranca' || secao === 'pedidos';
  }
}

type SecaoCliente = 'dados' | 'perfil' | 'enderecos' | 'seguranca' | 'pedidos';

