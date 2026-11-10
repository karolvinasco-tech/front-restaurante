import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, ItemPedido } from '../service/pedido.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);

  cliente = { nombre: '', direccion: '', telefono: '' };
  itemsPedido: ItemPedido[] = [];
  mensajeExito: string | null = null;

  ngOnInit(): void {
    this.cargarPedido();
  }

  cargarPedido(): void {
    // Intentamos obtener la lista del servicio según el método que tengas implementado
    if (typeof (this.pedidoService as any).obtenerPedido === 'function') {
      this.itemsPedido = (this.pedidoService as any).obtenerPedido();
    } else if (typeof (this.pedidoService as any).obtenerProductos === 'function') {
      this.itemsPedido = (this.pedidoService as any).obtenerProductos();
    } else if ((this.pedidoService as any).pedido) {
      this.itemsPedido = (this.pedidoService as any).pedido;
    }
    this.cdr.detectChanges();
  }

  get subtotal(): number {
    return this.itemsPedido.reduce((acc, i) => acc + (i.precio * (i.cantidad || 1)), 0);
  }

  get propina(): number {
    return this.subtotal * 0.10;
  }

  get total(): number {
    return this.subtotal + this.propina;
  }

  cambiarCantidad(item: ItemPedido, delta: number): void {
    item.cantidad = (item.cantidad || 1) + delta;
    if (item.cantidad <= 0) {
      this.eliminarItem(item);
    }
    this.cdr.detectChanges();
  }

  eliminarItem(item: ItemPedido): void {
    this.itemsPedido = this.itemsPedido.filter(p => p.id !== item.id);
    if (typeof (this.pedidoService as any).eliminarProducto === 'function') {
      (this.pedidoService as any).eliminarProducto(item.id);
    }
    this.cdr.detectChanges();
  }

  formularioValido(): boolean {
    return !!(
      this.cliente.nombre.trim() &&
      this.cliente.direccion.trim() &&
      this.cliente.telefono.trim() &&
      this.itemsPedido.length > 0
    );
  }

  confirmarYDescargarPDF(): void {
    if (!this.formularioValido()) return;

    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-CO');

    // Encabezado Factura
    doc.setFontSize(16).setFont('helvetica', 'bold');
    doc.text('TODO PAISA - RESTAURANTE & BAR', 14, 15);
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}  |  Cliente: ${this.cliente.nombre}  |  Tel: ${this.cliente.telefono}`, 14, 23);
    doc.text(`Dirección de entrega: ${this.cliente.direccion}`, 14, 29);

    // Generar Tabla
    autoTable(doc, {
      startY: 35,
      head: [['Producto / Bebida', 'Precio Unit.', 'Cant.', 'Subtotal']],
      body: this.itemsPedido.map(i => [
        i.nombre,
        `$${i.precio.toLocaleString('es-CO')}`,
        i.cantidad || 1,
        `$${(i.precio * (i.cantidad || 1)).toLocaleString('es-CO')}`
      ]),
      headStyles: { fillColor: [139, 0, 0] }
    });

    // Totales
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 100;
    doc.text(`Subtotal: $${this.subtotal.toLocaleString('es-CO')}`, 14, finalY);
    doc.text(`Propina (10%): $${this.propina.toLocaleString('es-CO')}`, 14, finalY + 6);
    doc.setFont('helvetica', 'bold').text(`TOTAL A PAGAR: $${this.total.toLocaleString('es-CO')}`, 14, finalY + 14);

    // Descargar PDF y limpiar
    doc.save(`Recibo_TodoPaisa_${this.cliente.nombre.trim()}.pdf`);
    this.mensajeExito = '¡Pedido realizado con éxito! Recibo PDF descargado.';

    if (typeof (this.pedidoService as any).limpiarPedido === 'function') {
      (this.pedidoService as any).limpiarPedido();
    }
    this.itemsPedido = [];
    this.cdr.detectChanges();
  }
}