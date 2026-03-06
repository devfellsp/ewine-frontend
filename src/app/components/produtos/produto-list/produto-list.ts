import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { Produto } from '../../../models/produto.model';
import { ProdutoService } from '../../../services/produto.service';

@Component({
  selector: 'app-produto-list',
  imports: [
    CurrencyPipe,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatTableModule, MatInputModule, MatFormFieldModule, RouterLink
  ],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css'
})
export class ProdutoList implements OnInit {

  displayedColumns: string[] = ['id', 'nome', 'preco', 'estoque'];

  dataSource = new MatTableDataSource<Produto>([]);

  constructor(private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.produtoService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
