import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../service/pedido.service';

export interface Bebida {
  id: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  imagen: string;
  tipo: string;
  categoria: string;
  instrucciones?: string;
}

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bebidas.component.html',
  styleUrl: './bebidas.component.css'
})
export class BebidasComponent implements OnInit {
  private http = inject(HttpClient);
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);

  listaBebidas: Bebida[] = [];
  bebidasFiltradas: Bebida[] = [];

  busquedaNombre: string = '';
  busquedaIngrediente: string = '';
  tipoSeleccionado: string = 'todos';
  categoriaSeleccionada: string = 'todas';

  categoriasDisponibles: string[] = ['Cocktail', 'Ordinary Drink', 'Shot', 'Coffee / Tea', 'Other / Unknown'];

  cargando: boolean = true;
  mensajeAgregado: string | null = null;

  ngOnInit(): void {
    this.cargarBebidasIniciales();
  }

  generarPrecio(): number {
    return Math.floor(Math.random() * (35000 - 12000 + 1) / 1000) * 1000 + 12000;
  }

  cargarBebidasIniciales(): void {
    this.cargando = true;
    this.http.get<any>('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=a').subscribe({
      next: (res) => {
        if (res && res.drinks) {
          this.listaBebidas = this.mapearBebidasCompletas(res.drinks);
          this.bebidasFiltradas = [...this.listaBebidas];
        } else {
          this.listaBebidas = [];
          this.bebidasFiltradas = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 1. Buscar Coctel por Nombre
  buscarPorNombre(): void {
    if (!this.busquedaNombre.trim()) {
      this.cargarBebidasIniciales();
      return;
    }
    this.cargando = true;
    this.busquedaIngrediente = '';
    const termino = this.busquedaNombre.trim();

    this.http.get<any>(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${termino}`).subscribe({
      next: (res) => {
        if (res && res.drinks) {
          this.listaBebidas = this.mapearBebidasCompletas(res.drinks);
          this.bebidasFiltradas = [...this.listaBebidas];
        } else {
          this.listaBebidas = [];
          this.bebidasFiltradas = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 2. Buscar Ingrediente por Nombre
  buscarPorIngrediente(): void {
    if (!this.busquedaIngrediente.trim()) {
      this.cargarBebidasIniciales();
      return;
    }
    this.cargando = true;
    this.busquedaNombre = '';
    const ing = this.busquedaIngrediente.trim().toLowerCase().replace(/\s+/g, '_');

    this.http.get<any>(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ing}`).subscribe({
      next: (res) => {
        if (res && res.drinks) {
          const peticiones = res.drinks.slice(0, 8).map((d: any) =>
            this.http.get<any>(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${d.idDrink}`).toPromise()
          );
          Promise.all(peticiones).then(respuestas => {
            const drinksCompletos = respuestas.filter(r => r && r.drinks && r.drinks[0]).map(r => r.drinks[0]);
            this.listaBebidas = this.mapearBebidasCompletas(drinksCompletos);
            this.bebidasFiltradas = [...this.listaBebidas];
            this.cargando = false;
            this.cdr.detectChanges();
          }).catch(() => {
            this.cargando = false;
            this.cdr.detectChanges();
          });
        } else {
          this.listaBebidas = [];
          this.bebidasFiltradas = [];
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 3. Filtrar por Tipo (Alcoholic / Non_Alcoholic)
  filtrarPorTipo(): void {
    if (this.tipoSeleccionado === 'todos') {
      this.cargarBebidasIniciales();
      return;
    }
    this.cargando = true;
    this.http.get<any>(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${this.tipoSeleccionado}`).subscribe({
      next: (res) => {
        if (res && res.drinks) {
          this.listaBebidas = res.drinks.slice(0, 12).map((drink: any) => ({
            id: drink.idDrink,
            nombre: drink.strDrink,
            ingredientes: 'Receta de la casa',
            precio: this.generarPrecio(),
            imagen: drink.strDrinkThumb,
            tipo: this.tipoSeleccionado === 'Alcoholic' ? 'Con Alcohol' : 'Sin Alcohol',
            categoria: 'Coctelería'
          }));
          this.bebidasFiltradas = [...this.listaBebidas];
        } else {
          this.listaBebidas = [];
          this.bebidasFiltradas = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 4. Filtrar por Categoría
  filtrarPorCategoria(): void {
    if (this.categoriaSeleccionada === 'todas') {
      this.cargarBebidasIniciales();
      return;
    }
    this.cargando = true;
    const catFormateada = encodeURIComponent(this.categoriaSeleccionada);
    this.http.get<any>(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${catFormateada}`).subscribe({
      next: (res) => {
        if (res && res.drinks) {
          this.listaBebidas = res.drinks.slice(0, 12).map((drink: any) => ({
            id: drink.idDrink,
            nombre: drink.strDrink,
            ingredientes: 'Selección especial',
            precio: this.generarPrecio(),
            imagen: drink.strDrinkThumb,
            tipo: 'Especial',
            categoria: this.categoriaSeleccionada
          }));
          this.bebidasFiltradas = [...this.listaBebidas];
        } else {
          this.listaBebidas = [];
          this.bebidasFiltradas = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltros(): void {
    this.busquedaNombre = '';
    this.busquedaIngrediente = '';
    this.tipoSeleccionado = 'todos';
    this.categoriaSeleccionada = 'todas';
    this.cargarBebidasIniciales();
  }

  agregarAlPedido(bebida: Bebida): void {
    this.pedidoService.agregarProducto({
      id: bebida.id,
      nombre: bebida.nombre,
      precio: bebida.precio,
      imagen: bebida.imagen,
      tipo: 'bebida'
    });
    this.mensajeAgregado = `¡${bebida.nombre} agregada al pedido!`;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeAgregado = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  private mapearBebidasCompletas(drinks: any[]): Bebida[] {
    return drinks.map((drink: any) => ({
      id: drink.idDrink,
      nombre: drink.strDrink,
      ingredientes: [
        drink.strIngredient1, drink.strIngredient2,
        drink.strIngredient3, drink.strIngredient4
      ].filter((ing: string) => ing && ing.trim() !== '').join(', ') || 'Variados',
      precio: this.generarPrecio(),
      imagen: drink.strDrinkThumb,
      tipo: drink.strAlcoholic === 'Alcoholic' ? 'Con Alcohol' : 'Sin Alcohol',
      categoria: drink.strCategory || 'Bebidas',
      instrucciones: drink.strInstructionsES || drink.strInstructions || ''
    }));
  }
}