import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

export interface BebidaEstrella {
  id: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  imagen: string;
  tipo?: string;
  instrucciones?: string;
  categoria?: string;
}

export interface Slide {
  titulo: string;
  subtitulo: string;
  imagen: string;
  link: string;
  textoBoton: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef); // Inyección para actualizar la vista de inmediato

  slides: Slide[] = [
    {
      titulo: 'Sabor Auténtico Colombiano',
      subtitulo: 'Disfruta de la mejor gastronomía paisa preparada con ingredientes frescos.',
      imagen: 'assets/Images/arepas.jpg',
      link: '/comidas',
      textoBoton: 'Ver Menú de Comidas'
    },
    {
      titulo: 'Bebidas & Coctelería Especial',
      subtitulo: 'Acompaña tus platos con nuestra refrescante selección de bebidas.',
      imagen: 'https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg',
      link: '/bebidas',
      textoBoton: 'Explorar Bebidas'
    }
  ];

  slideActual: number = 0;
  private timerCarrusel: any;

  platoEstrella: Comida | null = null;
  bebidaEstrella: BebidaEstrella | null = null;
  cargandoPlato: boolean = true;
  cargandoBebida: boolean = true;
  mensajeAgregado: string | null = null;

  ngOnInit(): void {
    this.iniciarAutoplay();
    this.cargarPlatoEstrella();
    this.cargarBebidaEstrella();
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
  }

  iniciarAutoplay(): void {
    this.timerCarrusel = setInterval(() => {
      this.siguienteSlide();
    }, 5000);
  }

  detenerAutoplay(): void {
    if (this.timerCarrusel) {
      clearInterval(this.timerCarrusel);
    }
  }

  siguienteSlide(): void {
    this.slideActual = (this.slideActual + 1) % this.slides.length;
    this.cdr.detectChanges();
  }

  anteriorSlide(): void {
    this.slideActual = (this.slideActual - 1 + this.slides.length) % this.slides.length;
    this.cdr.detectChanges();
  }

  irASlide(index: number): void {
    this.slideActual = index;
    this.cdr.detectChanges();
  }

  cargarPlatoEstrella(): void {
    this.cargandoPlato = true;
    this.http.get<any>('https://www.themealdb.com/api/json/v1/1/random.php').subscribe({
      next: (res) => {
        if (res && res.meals && res.meals[0]) {
          const meal = res.meals[0];
          this.platoEstrella = {
            id: meal.idMeal,
            nombre: meal.strMeal,
            ingredientes: [meal.strIngredient1, meal.strIngredient2, meal.strIngredient3].filter(Boolean).join(', '),
            precio: 32000,
            imagen: meal.strMealThumb,
            categoria: meal.strCategory || 'Plato Especial'
          };
        }
        this.cargandoPlato = false;
        this.cdr.detectChanges(); // Forzamos a renderizar la foto del plato al instante
      },
      error: () => {
        this.cargandoPlato = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarBebidaEstrella(): void {
    this.cargandoBebida = true;
    this.http.get<any>('https://www.thecocktaildb.com/api/json/v1/1/random.php').subscribe({
      next: (res) => {
        if (res && res.drinks && res.drinks[0]) {
          const drink = res.drinks[0];
          this.bebidaEstrella = {
            id: drink.idDrink,
            nombre: drink.strDrink,
            ingredientes: [drink.strIngredient1, drink.strIngredient2, drink.strIngredient3].filter(Boolean).join(', ') || 'Variados',
            precio: 18000,
            imagen: drink.strDrinkThumb,
            tipo: drink.strAlcoholic === 'Alcoholic' ? 'con-alcohol' : 'sin-alcohol',
            instrucciones: drink.strInstructionsES || drink.strInstructions || 'Refrescante bebida.',
            categoria: drink.strCategory || 'Bebidas'
          };
        }
        this.cargandoBebida = false;
        this.cdr.detectChanges(); // Forzamos a renderizar la foto de la bebida al instante
      },
      error: () => {
        this.cargandoBebida = false;
        this.cdr.detectChanges();
      }
    });
  }

  agregarComida(comida: Comida): void {
    this.pedidoService.agregarProducto({
      id: comida.id,
      nombre: comida.nombre,
      precio: comida.precio,
      imagen: comida.imagen,
      tipo: 'comida'
    });
    this.mostrarMensaje(`¡${comida.nombre} agregado al pedido!`);
  }

  agregarBebida(bebida: BebidaEstrella): void {
    this.pedidoService.agregarProducto({
      id: bebida.id,
      nombre: bebida.nombre,
      precio: bebida.precio,
      imagen: bebida.imagen,
      tipo: 'bebida'
    });
    this.mostrarMensaje(`¡${bebida.nombre} agregada al pedido!`);
  }

  private mostrarMensaje(msg: string): void {
    this.mensajeAgregado = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeAgregado = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}