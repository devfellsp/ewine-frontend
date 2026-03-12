import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { ProdutoService } from '../../../services/produto.service';

@Component({
  selector: 'app-produto-form',
  imports: [
    FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatCardModule, MatSelectModule
  ],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css'
})
export class ProdutoForm implements OnInit {

  editando = false;
  uvaId: number = 1;
  produtoId: number = 0;

  dto: any = {
    sku: '',
    nome: '',
    descricao: '',
    preco: 0,
    quantEstoque: 0,
    teorAlcoolico: null,
    volume: null,
    tipoVinho: { id: 1 },
    pais: { id: 1 },
    safra: { id: 1 },
    marca: { id: 1 },
    estilo: { id: 1 },
    ocasiao: { id: 1 },
    uvas: []
  };

  constructor(
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.produtoId = Number(id);
      this.produtoService.findById(this.produtoId).subscribe((data: any) => {
        this.dto.sku = data.sku;
        this.dto.nome = data.nome;
        this.dto.descricao = data.descricao;
        this.dto.preco = data.preco;
        this.dto.quantEstoque = data.estoque ?? data.quantEstoque;
        this.dto.teorAlcoolico = data.teorAlcoolico;
        this.dto.volume = data.volume;
        this.dto.tipoVinho = { id: data.tipoVinho?.id ?? 1 };
        this.dto.pais = { id: data.pais?.id ?? 1 };
        this.dto.safra = { id: data.safra?.id ?? 1 };
        this.dto.marca = { id: data.marca?.id ?? 1 };
        this.dto.estilo = { id: data.estilo?.id ?? 1 };
        this.dto.ocasiao = { id: data.ocasiao?.id ?? 1 };
        this.uvaId = data.uvas?.[0]?.id ?? 1;
      });
    }
  }

  salvar(): void {
    this.dto.uvas = [{ id: this.uvaId }];

    console.log('DTO enviado:', JSON.stringify(this.dto, null, 2));
    console.log('ID do produto:', this.produtoId);
    console.log('Editando:', this.editando);

    if (this.editando) {
      this.produtoService.update(this.produtoId, this.dto).subscribe({
        next: (res) => {
          console.log('Resposta do servidor:', res);
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          console.error('Erro ao atualizar:', err);
          console.error('Status:', err.status);
          console.error('Body:', err.error);
        }
      });
    } else {
      this.produtoService.create(this.dto).subscribe({
        next: (res) => {
          console.log('Produto criado:', res);
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          console.error('Erro ao criar:', err);
          console.error('Status:', err.status);
          console.error('Body:', err.error);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/produtos']);
  }
}
