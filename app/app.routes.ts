import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ComidasComponent } from './comidas/comidas.component';
import { BebidasComponent } from './bebidas/bebidas.component';
import { PedidoComponent } from './pedido/pedido.component';
import { JuegoComponent } from './juego/juego.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'comidas', component: ComidasComponent },
  { path: 'bebidas', component: BebidasComponent },
  { path: 'pedido', component: PedidoComponent },
  { path: 'juego', component: JuegoComponent },
  { path: '**', redirectTo: '' }
];