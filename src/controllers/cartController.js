import { loadPedidos, savePedidos } from '../api/storage.js';
import { generarFolio } from '../api/folio.js';
import { crearPizza, crearHamburguesa, crearPapas, crearAlitas, crearBoneless } from '../models/Producto.js';
import { renderizarCarrito, actualizarRestriccionesPromo } from '../ui/cartView.js';
import { showSuccess, showWarning } from '../utils/alerts.js';

export let pizzasActuales = [];

export function renderCart() {
  renderizarCarrito(pizzasActuales);
  //actualizarRestriccionesPromo(pizzasActuales);
}

export function initCart() {
  document.getElementById('formulario').addEventListener('submit', e => {
    e.preventDefault();
    agregarPizza();
  });
  document.getElementById('ordenarHamburguesasBtn').addEventListener('click', e => {
    e.preventDefault();
    ordenarHamburguesas();
  });
  document.getElementById('agregarPizzaBtn').addEventListener('click', e => {
    e.preventDefault();
    agregarPizza();
  });
  document.getElementById('finalizarPedidoBtn').addEventListener('click', e => {
    e.preventDefault();
    finalizarPedido();
  });
  //document.getElementById('refresco').addEventListener('change', () => {
    //actualizarRestriccionesPromo(pizzasActuales);
  //});
  document.getElementById('agregarAlitasBtn').addEventListener('click', e => {
    e.preventDefault();
    ordenarAlitas();
  });
  document.getElementById('agregarBonelessBtn').addEventListener('click', e => {
    e.preventDefault();
    ordenarBoneless();
  });
}

function agregarPizza() {
  const tamanoInput = document.querySelector('input[name="tamano"]:checked');
  if (!tamanoInput) {
    return showWarning('Por favor selecciona un tamaño de pizza.');
  }
  const tamano = tamanoInput.value;
  const orilla = document.getElementById('orilla').checked;
  const seleccionados = Array.from(document.querySelectorAll('input[name="sabor"]:checked'));
  const saborArray = seleccionados.map(cb => cb.value);
  //const promo = document.getElementById('refresco').value;
  const comentario = document.getElementById('comentarioPizza').value.trim();

  if (saborArray.length === 0) {
    return showWarning('Por favor selecciona al menos un sabor.');
  }

  pizzasActuales.push(crearPizza({ tamano, saborArray, orilla, promo:"", comentario }));
  renderizarCarrito(pizzasActuales);
  document.getElementById('orilla').checked = false;
  document.querySelectorAll('.sabor-check').forEach(cb => cb.checked = false);
  if (document.getElementById('comentarioPizza')) {
    document.getElementById('comentarioPizza').value = '';
  }

  // Actualizar contador
  const contador = document.getElementById('contadorSabores');
  if (contador) {
    contador.textContent = '0/4';
    contador.classList.add('d-none');
  }
  document.getElementById('formulario').reset();
}

function ordenarHamburguesas() {
  const bs = parseInt(document.getElementById('burgerSencilla').value, 10);
  const bh = parseInt(document.getElementById('burgerHawaiana').value, 10);
  const ba = parseInt(document.getElementById('burgerArrachera').value, 10);
  const papas = parseInt(document.getElementById('papas').value, 10);

  if (bs + bh + ba + papas === 0) {
    return Swal.fire({ icon: 'warning', title: 'No hay hamburguesas ni papas seleccionadas.' });
  }

  pizzasActuales.push(
    ...crearHamburguesa({ nombre: 'Hamburguesa Sencilla', precio: 85, cantidad: bs }),
    ...crearHamburguesa({ nombre: 'Hamburguesa Hawaiana', precio: 100, cantidad: bh }),
    ...crearHamburguesa({ nombre: 'Hamburguesa Arrachera', precio: 100, cantidad: ba }),
    ...crearPapas({ nombre: 'Orden de papas', precio: 45, cantidad: papas })
  );

  renderizarCarrito(pizzasActuales);

  document.getElementById('burgerSencilla').value = "0";
  document.getElementById('burgerHawaiana').value = "0";
  document.getElementById('burgerArrachera').value = "0";
  document.getElementById('papas').value = "0";
}

function finalizarPedido() {
  if (pizzasActuales.length === 0) {
    return showWarning('El carrito está vacío.');
  }
  const folio = generarFolio();
  const pedidos = loadPedidos();
  pedidos.push({
    folio,
    pizzas: pizzasActuales,
    total: pizzasActuales.reduce((s, p) => s + p.total, 0),
    estatus: 'Preparando'
  });
  savePedidos(pedidos);
  pizzasActuales = [];
  renderizarCarrito(pizzasActuales);
  showSuccess(`Pedido ${folio} registrado con éxito.`);
  document.dispatchEvent(new Event('pedidosActualizados'));
}

function ordenarAlitas() {
  const cantidad = document.getElementById('tamanoAlitas').value;
  const saboresSeleccionados = Array.from(document.querySelectorAll('input[name="saborAlita"]:checked')).map(cb => cb.value);
  const comentario = document.getElementById('comentarioAlitas').value.trim();

  if (!cantidad) {
    return showWarning('Selecciona el tamaño de la orden.');
  }
  if (saboresSeleccionados.length === 0) {
    return showWarning('Selecciona al menos un sabor para las alitas.');
  }

  let precio = 0;
  if (cantidad === "6") precio = 85;
  else if (cantidad === "10") precio = 130;

  pizzasActuales.push(...crearAlitas({ precio, cantidad, saboresSeleccionados, comentario }));
  renderizarCarrito(pizzasActuales);
  document.getElementById('tamanoAlitas').value = ""; // Limpiar el tamaño
  document.querySelectorAll('input[name="saborAlita"]').forEach(cb => cb.checked = false); // Limpiar sabores
  document.getElementById('comentarioAlitas').value = ""; // Limpiar comentario
}

function ordenarBoneless() {
  const tipo = document.getElementById('tipoBoneless').value;
  const comentario = document.getElementById('comentarioBoneless').value.trim();

  if (!tipo) {
    Swal.fire({ icon: 'warning', title: 'Selecciona el tipo de orden de boneless.' });
    return;
  }

  let precio = 0;
  let descripcion = "";

  if (tipo === "solo") {
    precio = 75;
    descripcion = "Orden de Boneless";
  } else if (tipo === "conPapas") {
    precio = 100;
    descripcion = "Boneless con papas";
  }

  pizzasActuales.push(...crearBoneless({ precio, descripcion, comentario }));

  renderizarCarrito(pizzasActuales);

  document.getElementById('tipoBoneless').value = "";
  document.getElementById('comentarioBoneless').value = "";
}

