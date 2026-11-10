import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PedidoService } from './service/pedido.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public pedidoService = inject(PedidoService);

  get total(): number {
    return this.pedidoService.obtenerTotal();
  }

  get cantidadTotal(): number {
    return this.pedidoService.obtenerCantidadTotal();
  }
}