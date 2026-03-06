import { Routes } from '@angular/router';
import { ProdutoList } from './components/produtos/produto-list/produto-list';
import { ProdutoForm } from './components/produtos/produto-form/produto-form';

export const routes: Routes = [
    {path: '', redirectTo: 'produtos', pathMatch: 'full'},
    {path: 'produtos', component: ProdutoList, title: 'Listagem de Produtos'},
    {path: 'produtos/new', component: ProdutoForm, title: 'Cadastro de Produto'},
];
