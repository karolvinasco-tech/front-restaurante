import { Injectable } from '@angular/core';

export interface ItemPedido {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  tipo: 'comida' | 'bebida';
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private pedido: ItemPedido[] = [];

  agregarProducto(producto: Omit<ItemPedido, 'cantidad'>): void {
    const itemExistente = this.pedido.find(p => p.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.pedido.push({ ...producto, cantidad: 1 });
    }
  }

  agregarAlPedido(producto: Omit<ItemPedido, 'cantidad'>): void {
    this.agregarProducto(producto);
  }

  obtenerPedido(): ItemPedido[] {
    return this.pedido;
  }

  obtenerTotal(): number {
    return this.pedido.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  obtenerCantidadTotal(): number {
    return this.pedido.reduce((total, item) => total + item.cantidad, 0);
  }

  cambiarCantidad(id: string, cambio: number): void {
    const item = this.pedido.find(i => i.id === id);
    if (item) {
      item.cantidad += cambio;
      if (item.cantidad <= 0) {
        this.eliminarItem(id);
      }
    }
  }

  eliminarItem(id: string): void {
    const index = this.pedido.findIndex(i => i.id === id);
    if (index !== -1) {
      this.pedido.splice(index, 1);
    }
  }

  limpiarPedido(): void {
    this.pedido = [];
  }
}