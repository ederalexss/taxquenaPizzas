import { calcularPrecio } from '../services/calculos.js';

// Producto genérico
export class Producto {
  constructor({ tamano, sabores = '', orilla = false, total, descripcion = '', comentario = '' }) {
    this.tamano = tamano;
    this.sabores = sabores;
    this.orilla = orilla;
    this.total = total;
    this.descripcion = descripcion;
    this.comentario = comentario;
  }
}

// Fábrica de pizzas
export function crearPizza({ tamano, saborArray, orilla, promo, comentario }) {
  const total = calcularPrecio(tamano, orilla, saborArray, promo);
  let descripcion = '';
  if (promo === 'promo_medianas') descripcion = 'Promo: 2 medianas + refresco';
  else if (promo === 'promo_grande' && tamano === 'grande') descripcion = 'Incluye refresco 2L (Promo grande)';
  return new Producto({
    tamano,
    sabores: saborArray.join(', '),
    orilla,
    total,
    descripcion,
    comentario
  });
}

// Fábrica de hamburguesas
export function crearHamburguesa({ nombre, precio, cantidad }) {
  const list = [];
  for (let i = 0; i < cantidad; i++) {
    list.push(new Producto({
      tamano: 'Hamburguesa',
      sabores: nombre,
      orilla: false,
      total: precio,
      descripcion: nombre
    }));
  }
  return list;
}

// Fábrica de papas (extras)
export function crearPapas({ precio, cantidad }) {
  const list = [];
  for (let i = 0; i < cantidad; i++) {
    list.push(new Producto({
      tamano: 'Extra',
      sabores: 'Papas',
      orilla: false,
      total: precio,
      descripcion: 'Papas'
    }));
  }
  return list;
}

// Fábrica de Alitas
export function crearAlitas({ precio, cantidad, saboresSeleccionados, comentario }) {
  const list = [];
    list.push(new Producto({
      tamano: 'Alitas',
      sabores: `${cantidad} piezas - Sabores: ${saboresSeleccionados.join(", ")}`,
      orilla: false,
      total: precio,
      descripcion: 'Alitas',
      comentario
    }));
  return list;
}

// Fábrica de Boneless
export function crearBoneless({ precio, descripcion, comentario }) {
  const list = [];
    list.push(new Producto({
      tamano: 'Boneless',
      sabores: descripcion,
      orilla: false,
      total: precio,
      descripcion: comentario
    }));
  return list;
}

