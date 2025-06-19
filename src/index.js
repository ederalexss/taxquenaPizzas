import { renderCart, initCart } from './controllers/cartController.js';
import { renderOrders, initOrders } from './controllers/ordersController.js';
import { renderFinances, initFinances } from './controllers/financeController.js';
import { incrementar, decrementar } from './utils/quantity.js';

window.incrementar = incrementar;
window.decrementar = decrementar;


document.addEventListener('DOMContentLoaded', () => {
  // primeras vistas
  renderCart();
  renderOrders();
  renderFinances();
  // enlazar listeners
  initCart();
  initOrders();
  initFinances();
});
