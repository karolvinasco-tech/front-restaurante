import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Casilla {
  id: number;
  esGanadora: boolean;
  tipo: 'comida' | 'bebida' | 'vacia';
  nombre: string;
  imagen: string;
  revelada: boolean;
}

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  casillas: Casilla[] = [];
  intentosRestantes: number = 10;
  cargando: boolean = true;
  juegoTerminado: boolean = false;
  victoria: boolean = false;

  comidaGanadora: { nombre: string; imagen: string } | null = null;
  bebidaGanadora: { nombre: string; imagen: string } | null = null;

  comidaEncontrada: boolean = false;
  bebidaEncontrada: boolean = false;

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarJuego(): void {
    this.intentosRestantes = 10;
    this.juegoTerminado = false;
    this.victoria = false;
    this.comidaEncontrada = false;
    this.bebidaEncontrada = false;
    this.cargando = true;

    // Traemos 1 plato y 1 bebida real desde las API
    const comida$ = this.http.get<any>('https://www.themealdb.com/api/json/v1/1/random.php');
    const bebida$ = this.http.get<any>('https://www.thecocktaildb.com/api/json/v1/1/random.php');

    forkJoin([comida$, bebida$]).subscribe({
      next: ([resComida, resBebida]) => {
        const m = resComida.meals[0];
        const d = resBebida.drinks[0];

        this.comidaGanadora = { nombre: m.strMeal, imagen: m.strMealThumb };
        this.bebidaGanadora = { nombre: d.strDrink, imagen: d.strDrinkThumb };

        // Creamos la matriz 4x4 (16 casillas)
        let tablero: Casilla[] = Array.from({ length: 16 }, (_, i) => ({
          id: i + 1,
          esGanadora: false,
          tipo: 'vacia',
          nombre: 'Sin Suerte',
          imagen: '',
          revelada: false
        }));

        // Elegimos 2 posiciones aleatorias distintas entre 0 y 15
        let pos1 = Math.floor(Math.random() * 16);
        let pos2 = Math.floor(Math.random() * 16);
        while (pos1 === pos2) {
          pos2 = Math.floor(Math.random() * 16);
        }

        // Asignamos la comida y la bebida en las posiciones aleatorias
        tablero[pos1] = {
          id: pos1 + 1,
          esGanadora: true,
          tipo: 'comida',
          nombre: this.comidaGanadora.nombre,
          imagen: this.comidaGanadora.imagen,
          revelada: false
        };

        tablero[pos2] = {
          id: pos2 + 1,
          esGanadora: true,
          tipo: 'bebida',
          nombre: this.bebidaGanadora.nombre,
          imagen: this.bebidaGanadora.imagen,
          revelada: false
        };

        this.casillas = tablero;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del juego:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarCasilla(casilla: Casilla): void {
    if (casilla.revelada || this.juegoTerminado) return;

    casilla.revelada = true;

    if (casilla.tipo === 'comida') {
      this.comidaEncontrada = true;
    } else if (casilla.tipo === 'bebida') {
      this.bebidaEncontrada = true;
    } else {
      // Intento fallido si destapa una vacía
      this.intentosRestantes--;
    }

    // Verificar condición de Victoria (Encontró la comida y la bebida)
    if (this.comidaEncontrada && this.bebidaEncontrada) {
      this.victoria = true;
      this.juegoTerminado = true;
    } else if (this.intentosRestantes <= 0) {
      this.juegoTerminado = true;
      this.victoria = false;
    }

    this.cdr.detectChanges();
  }
}