import { loadPedidos, savePedidos } from '../api/storage.js';
import { renderPedidos } from '../ui/ordersView.js';
import { showSuccess, showConfirm, showInput } from '../utils/alerts.js';

let paginaActual = 1;
const pedidosPorPagina = 6;

// Función para actualizar el total del día
function actualizarTotalDia() {
  const pedidos = loadPedidos();
  const total = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
  const totalDiaElement = document.getElementById('totalDia');
  if (totalDiaElement) {
    totalDiaElement.textContent = `$${total.toFixed(2)}`;
  }
}


// Función para manejar las acciones de los pedidos
function handleOrderAction(event) {
  const { index, action, status } = event.detail;
  const pedidos = loadPedidos();
  
  if (index < 0 || index >= pedidos.length) return;
  
  switch (action) {
    case 'estatus':
      pedidos[index].estatus = status;
      savePedidos(pedidos);
      renderOrders();
      showSuccess('Estatus actualizado.');
      break;
      
    case 'capture-name':
      showInput({
        title: 'Nombre del cliente',
        inputPlaceholder: 'Ingresa el nombre del cliente',
        confirmButtonText: 'Guardar',
        inputValidator: (value) => !value && 'Por favor ingresa un nombre'
      }).then((result) => {
        if (result.isConfirmed) {
          pedidos[index].nombreCliente = result.value;
          savePedidos(pedidos);
          renderOrders();
          showSuccess('Nombre guardado.');
        }
      });
      break;
      
    case 'handle-change':
      pedidos[index].conCambio = !pedidos[index].conCambio;
      if (pedidos[index].conCambio) {
        pedidos[index].cambio = 0;
      } else {
        delete pedidos[index].cambio;
      }
      savePedidos(pedidos);
      renderOrders();
      break;
      
    case 'delete':
      showConfirm({
        title: '¿Eliminar pedido?',
        text: 'Esta acción no se puede deshacer',
        confirmButtonText: 'Sí, eliminar',
        icon: 'warning'
      }).then((result) => {
        if (result.isConfirmed) {
          pedidos.splice(index, 1);
          savePedidos(pedidos);
          renderOrders();
          showSuccess('Pedido eliminado.');
        }
      });
      break;
  }
}

export function renderOrders() {
  const pedidos = loadPedidos();
  renderPedidos(pedidos, paginaActual, pedidosPorPagina, onPage);
  actualizarTotalDia();
}

export function initOrders() {
  // Configurar el manejador de eventos para las acciones de pedidos
  document.addEventListener('orderAction', handleOrderAction);
  
  // Configurar el listener para los cambios de estado
  document.addEventListener('pedidosActualizados', () => {
    paginaActual = 1;
    renderOrders();
  });
  
  // Actualizar total al cargar la página
  actualizarTotalDia();
  
  // Configurar el paginador
  document.getElementById('paginador')?.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const num = parseInt(btn.textContent, 10);
    if (!isNaN(num)) {
      paginaActual = num;
      renderOrders();
    }
  });
  
  // Configurar el botón de limpiar pedidos
  document.getElementById('limpiarPedidosBtn')?.addEventListener('click', () => {
    showConfirm({
      title: '¿Seguro que quieres eliminar todos los pedidos?',
      text: 'Esta acción es irreversible.',
      confirmButtonText: 'Sí, limpiar'
    }).then(result => {
      if (result.isConfirmed) {
        savePedidos([]);
        paginaActual = 1;
        renderOrders();
        showSuccess('Todos los pedidos han sido eliminados.');
      }
    });
  });
  
  // Renderizar los pedidos iniciales
  renderOrders();
}

// Función para manejar el cambio de página
export function onPage(num) {
  paginaActual = num;
  renderOrders();
}

