import { Routes } from '@angular/router';
import { ProdutoList } from './components/produtos/produto-list/produto-list';
import { ProdutoForm } from './components/produtos/produto-form/produto-form';
import { MarcaList } from './components/marcas/marca-list/marca-list';
import { MarcaForm } from './components/marcas/marca-form/marca-form';
import { PaisList } from './components/paises/pais-list/pais-list';
import { PaisForm } from './components/paises/pais-form/pais-form';
import { SafraList } from './components/safras/safra-list/safra-list';
import { SafraForm } from './components/safras/safra-form/safra-form';
import { TipoVinhoList } from './components/tipos-vinho/tipo-vinho-list/tipo-vinho-list';
import { TipoVinhoForm } from './components/tipos-vinho/tipo-vinho-form/tipo-vinho-form';
import { UvaList } from './components/uvas/uva-list/uva-list';
import { UvaForm } from './components/uvas/uva-form/uva-form';
import { LoginComponent } from './components/auth/login/login';
import { ClienteHomeComponent } from './components/cliente/cliente-home/cliente-home';
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
  { path: 'admin/marcas', component: MarcaList, title: 'Marcas', canActivate: [adminGuard] },
  { path: 'admin/marcas/new', component: MarcaForm, title: 'Nova Marca', canActivate: [adminGuard] },
  { path: 'admin/marcas/edit/:id', component: MarcaForm, title: 'Editar Marca', canActivate: [adminGuard] },
  { path: 'admin/paises', component: PaisList, title: 'Paises', canActivate: [adminGuard] },
  { path: 'admin/paises/new', component: PaisForm, title: 'Novo Pais', canActivate: [adminGuard] },
  { path: 'admin/paises/edit/:id', component: PaisForm, title: 'Editar Pais', canActivate: [adminGuard] },
  { path: 'admin/safras', component: SafraList, title: 'Safras', canActivate: [adminGuard] },
  { path: 'admin/safras/new', component: SafraForm, title: 'Nova Safra', canActivate: [adminGuard] },
  { path: 'admin/safras/edit/:id', component: SafraForm, title: 'Editar Safra', canActivate: [adminGuard] },
  { path: 'admin/tipos-vinho', component: TipoVinhoList, title: 'Tipos de Vinho', canActivate: [adminGuard] },
  { path: 'admin/tipos-vinho/new', component: TipoVinhoForm, title: 'Novo Tipo de Vinho', canActivate: [adminGuard] },
  { path: 'admin/tipos-vinho/edit/:id', component: TipoVinhoForm, title: 'Editar Tipo de Vinho', canActivate: [adminGuard] },
  { path: 'admin/uvas', component: UvaList, title: 'Uvas', canActivate: [adminGuard] },
  { path: 'admin/uvas/new', component: UvaForm, title: 'Nova Uva', canActivate: [adminGuard] },
  { path: 'admin/uvas/edit/:id', component: UvaForm, title: 'Editar Uva', canActivate: [adminGuard] },

  // ÁREA CLIENTE
  { path: 'cliente', component: ClienteHomeComponent, title: 'Minha Conta', canActivate: [clienteGuard] },
  { path: 'loja', component: LojaComponent, title: 'Loja', canActivate: [clienteGuard] },
  { path: 'loja/produto/:id', component: ProdutoDetalheComponent, title: 'Produto', canActivate: [clienteGuard] },
];
