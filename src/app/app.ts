import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProdutoService } from './services/produto.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    // Acorda o Quarkus assim que o app abre
    this.produtoService.findAll().subscribe();
  }
}
