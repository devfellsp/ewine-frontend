import { Routes } from '@angular/router';
import { ProdutoList } from './components/produtos/produto-list/produto-list';
import { ProdutoForm } from './components/produtos/produto-form/produto-form';
import { LoginComponent } from './components/auth/login/login';
import { LojaComponent } from './components/loja/loja';
import { ProdutoDetalheComponent } from './components/loja/produto-detalhe/produto-detalhe';
import { adminGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/cliente.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login' },

  // ÁREA ADMIN
  { path: 'admin/produtos', component: ProdutoList, title: 'Produtos', canActivate: [adminGuard] },
  { path: 'admin/produtos/new', component: ProdutoForm, title: 'Novo Produto', canActivate: [adminGuard] },
  { path: 'admin/produtos/edit/:id', component: ProdutoForm, title: 'Editar Produto', canActivate: [adminGuard] },

  // ÁREA CLIENTE
  { path: 'loja', component: LojaComponent, title: 'Loja', canActivate: [clienteGuard] },
  { path: 'loja/produto/:id', component: ProdutoDetalheComponent, title: 'Produto', canActivate: [clienteGuard] },
];
