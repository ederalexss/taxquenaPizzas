// Modelo Pedido: encapsula folio, lista de productos y total
export class Pedido {
    constructor({ folio, pizzas, comentario = '', estatus = 'Preparando', conCambio = false, cambio }) {
      this.folio = folio;
      this.pizzas = pizzas;
      this.total = pizzas.reduce((sum, p) => sum + p.total, 0);
      this.comentario = comentario;
      this.estatus = estatus;
      this.conCambio = conCambio;
      if (cambio !== undefined) this.cambio = cambio;
    }
  }
  