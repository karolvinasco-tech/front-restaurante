import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../service/pedido.service';

export interface Comida {
  id: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  imagen: string;
  categoria: string;
}

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comidas.component.html',
  styleUrl: './comidas.component.css'
})
export class ComidasComponent implements OnInit {
  private http = inject(HttpClient);
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef); // Inyección para forzar la actualización de la UI

  listaComidas: Comida[] = [];
  comidasFiltradas: Comida[] = [];

  busquedaNombre: string = '';
  busquedaIngrediente: string = '';
  categoriaSeleccionada: string = 'todas';
  categoriasDisponibles: string[] = [];

  cargando: boolean = true;
  mensajeAgregado: string | null = null;

  ngOnInit(): void {
    this.cargarComidasIniciales();
  }

  generarPrecio(): number {
    return Math.floor(Math.random() * (45000 - 15000 + 1) / 1000) * 1000 + 15000;
  }

  cargarComidasIniciales(): void {
    this.cargando = true;
    this.http.get<any>('https://www.themealdb.com/api/json/v1/1/search.php?s=c').subscribe({
      next: (res) => {
        if (res && res.meals) {
          this.listaComidas = res.meals.map((meal: any) => ({
            id: meal.idMeal,
            nombre: meal.strMeal,
            ingredientes: [
              meal.strIngredient1, meal.strIngredient2, 
              meal.strIngredient3, meal.strIngredient4
            ].filter((ing: string) => ing && ing.trim() !== '').join(', ') || 'Variados',
            precio: this.generarPrecio(),
            imagen: meal.strMealThumb,
            categoria: meal.strCategory || 'Variados'
          }));
          this.comidasFiltradas = [...this.listaComidas];
          this.extraerCategorias();
        } else {
          this.listaComidas = [];
          this.comidasFiltradas = [];
        }
        this.cargando = false;
        
        // Forzamos la actualización inmediata en el ciclo de Angular
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  extraerCategorias(): void {
    const cats = this.listaComidas.map(c => c.categoria);
    this.categoriasDisponibles = Array.from(new Set(cats));
  }

  buscarPorNombre(): void {
    if (!this.busquedaNombre.trim()) {
      this.cargarComidasIniciales();
      return;
    }
    this.cargando = true;
    this.busquedaIngrediente = '';

    this.http.get<any>(`https://www.themealdb.com/api/json/v1/1/search.php?s=${this.busquedaNombre.trim()}`).subscribe({
      next: (res) => {
        if (res && res.meals) {
          this.listaComidas = res.meals.map((meal: any) => ({
            id: meal.idMeal,
            nombre: meal.strMeal,
            ingredientes: [meal.strIngredient1, meal.strIngredient2, meal.strIngredient3, meal.strIngredient4].filter(Boolean).join(', ') || 'Variados',
            precio: this.generarPrecio(),
            imagen: meal.strMealThumb,
            categoria: meal.strCategory || 'Variados'
          }));
          this.aplicarFiltroCategoria();
        } else {
          this.listaComidas = [];
          this.comidasFiltradas = [];
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

  buscarPorIngrediente(): void {
    if (!this.busquedaIngrediente.trim()) {
      this.cargarComidasIniciales();
      return;
    }
    this.cargando = true;
    this.busquedaNombre = '';
    const ing = this.busquedaIngrediente.trim().toLowerCase().replace(/\s+/g, '_');

    this.http.get<any>(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ing}`).subscribe({
      next: (res) => {
        if (res && res.meals) {
          const peticiones = res.meals.slice(0, 8).map((m: any) =>
            this.http.get<any>(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`).toPromise()
          );
          Promise.all(peticiones).then(respuestas => {
            const mealsCompletos = respuestas.filter(r => r && r.meals && r.meals[0]).map(r => r.meals[0]);
            this.listaComidas = mealsCompletos.map((meal: any) => ({
              id: meal.idMeal,
              nombre: meal.strMeal,
              ingredientes: [meal.strIngredient1, meal.strIngredient2, meal.strIngredient3].filter(Boolean).join(', ') || 'Variados',
              precio: this.generarPrecio(),
              imagen: meal.strMealThumb,
              categoria: meal.strCategory || 'Variados'
            }));
            this.aplicarFiltroCategoria();
            this.cargando = false;
            this.cdr.detectChanges();
          }).catch(() => {
            this.cargando = false;
            this.cdr.detectChanges();
          });
        } else {
          this.listaComidas = [];
          this.comidasFiltradas = [];
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

  aplicarFiltroCategoria(): void {
    if (this.categoriaSeleccionada === 'todas') {
      this.comidasFiltradas = [...this.listaComidas];
    } else {
      this.comidasFiltradas = this.listaComidas.filter(c => c.categoria === this.categoriaSeleccionada);
    }
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.busquedaNombre = '';
    this.busquedaIngrediente = '';
    this.categoriaSeleccionada = 'todas';
    this.cargarComidasIniciales();
  }

  agregarAlPedido(comida: Comida): void {
    this.pedidoService.agregarProducto({
      id: comida.id,
      nombre: comida.nombre,
      precio: comida.precio,
      imagen: comida.imagen,
      tipo: 'comida'
    });
    this.mensajeAgregado = `¡${comida.nombre} agregado al pedido!`;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeAgregado = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}