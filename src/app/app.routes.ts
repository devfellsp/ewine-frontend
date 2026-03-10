import { Routes } from '@angular/router';
import { ProdutoList } from './components/produtos/produto-list/produto-list';
import { ProdutoForm } from './components/produtos/produto-form/produto-form';
import { LoginComponent } from './components/auth/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'produtos', component: ProdutoList, title: 'Listagem de Produtos', canActivate: [authGuard] },
  { path: 'produtos/new', component: ProdutoForm, title: 'Novo Produto', canActivate: [authGuard] },
  { path: 'produtos/edit/:id', component: ProdutoForm, title: 'Editar Produto', canActivate: [authGuard] },
];
