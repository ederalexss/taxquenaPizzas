import { primeraLetraMayuscula } from '../utils/utlis.js';
// Render de pedidos y paginador
export function renderPedidos(pedidos, paginaActual, porPagina, onPage) {
  const inv = pedidos.slice().reverse();
  const totalPags = Math.ceil(inv.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const page = inv.slice(inicio, fin);

  // Verificar si ya existe el contenedor
  let contenedor = document.querySelector("#pedidosContainer");
  
  // Si no existe, crearlo
  if (!contenedor) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.innerHTML = '<div class="container"><div class="row" id="pedidosContainer"></div></div>';
    tr.appendChild(td);
    tabla.appendChild(tr);
    contenedor = document.querySelector("#pedidosContainer");
  }
  
  // Limpiar el contenido existente
  contenedor.innerHTML = '';

  page.forEach((pedido, i) => {
    const idxReal = pedidos.length - 1 - (inicio + i);

    // Agrupar productos iguales
    const agrupados = {};
    pedido.pizzas.forEach(p => {
      const clave = `${p.tamano}|${p.sabores}|${p.orilla}|${p.total}`;
      if (!agrupados[clave]) {
        agrupados[clave] = { ...p, cantidad: 1 };
      } else {
        agrupados[clave].cantidad++;
      }
    });

    // Construir detalles del pedido agrupado
    const detalle = Object.values(agrupados).map(p => {
      const orilla = p.orilla ? " (orilla)" : "";
      const size = primeraLetraMayuscula(p.tamano);
      const comentario = p.comentario ? `<br><small class="text-muted"><i>Nota: ${p.comentario}</i></small>` : '';
      return `<li class="fs-6">${p.cantidad > 1 ? `${p.cantidad}x ` : ''}${size} - ${p.sabores}${orilla} - <strong>$${p.total}</strong>${comentario}</li>`;
    }).join("");

    const card = document.createElement('div');
    card.className = "col-12 col-md-6 col-lg-4";
    card.setAttribute('data-order-index', idxReal);
    
    // Construir el HTML de la tarjeta
    card.innerHTML = `
        <div class="card mb-3 shadow-sm">
            <div class="card-body position-relative">
                <!-- Menú desplegable en la esquina superior derecha -->
                <div class="position-absolute top-0 end-0 mt-2 me-2">
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ⋮
                        </button>
                        <ul class="dropdown-menu">
                            <li><button class="dropdown-item" data-action="estatus" data-status="Entregado">✅ Entregado</button></li>
                            <li><button class="dropdown-item" data-action="estatus" data-status="Preparando">🕓 Preparando</button></li>
                            <li><button class="dropdown-item" data-action="capture-name">✏️ Capturar nombre</button></li>
                            <li><button class="dropdown-item" data-action="handle-change">💵 Manejar cambio</button></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><button class="dropdown-item text-danger" data-action="delete">🗑 Eliminar</button></li>
                        </ul>
                    </div>
                </div>
                
                <!-- Información del pedido -->
                <div class="mb-2">
                    <strong class="fs-5 fw-bold">Folio:</strong> <span class="fs-6">${pedido.folio}</span>
                </div>
                ${pedido.nombreCliente ? `
                    <div class="mb-2">
                        <strong class="fs-5 fw-bold">Cliente:</strong> 
                        <span id="nombreCliente-${idxReal}" class="fs-6">${pedido.nombreCliente}</span>
                    </div>` : ''}
                <div class="mb-2">
                    <strong class="fs-5 fw-bold">Sabores:</strong>
                    <ul class="list-unstyled ps-3">${detalle}</ul>
                </div>
                <div class="mb-2">
                        <strong class="fs-5 fw-bold">Total:</strong> <span class="text-success fs-6">$${pedido.total}</span>
                    </div>
                    ${pedido.conCambio
        ? `
                        <div class="mb-2 text-warning">
                            <strong class="fs-5 fw-bold">Nota:</strong>
                            <span class="fs-6">El cliente pagará con cambio.</span>
                        </div>`
                        : pedido.cambio !== undefined
                            ? `
                            <div class="mb-2">
                                <strong class="fs-5 fw-bold">Cambio:</strong>
                                <span class="text-primary fs-6">$${pedido.cambio}</span>
                            </div>`
                            : ''
                    }
                    <div class="mt-3">
                        <span class="badge bg-${pedido.estatus === 'Entregado' ? 'success' : pedido.estatus === 'Cancelado' ? 'danger' : 'warning'} text-dark fs-6">
                            ${pedido.estatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    contenedor.appendChild(card);
  });
  
  // Agregar event listeners a los botones de acción
  document.querySelectorAll('.dropdown-item[data-action]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.col-12');
      const index = parseInt(card.getAttribute('data-order-index'), 10);
      const action = button.getAttribute('data-action');
      const status = button.getAttribute('data-status');
      
      // Disparar un evento personalizado para manejar la acción
      const event = new CustomEvent('orderAction', {
        detail: { index, action, status }
      });
      document.dispatchEvent(event);
    });
  });
  
  renderPaginator(totalPags, paginaActual, onPage);
}

export function renderPaginator(totalPags, paginaActual, onPage) {
  const cont = document.getElementById('paginador');
  cont.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'pagination';


  const mkLi = (text, disabled, cb) => {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}`;
    const btn = document.createElement('button');
    btn.className = 'page-link';
    btn.textContent = text;
    btn.onclick = cb;
    li.appendChild(btn);
    return li;
  };

  ul.appendChild(mkLi('«', paginaActual === 1, () => onPage(1)));
  for (let i = 1; i <= totalPags; i++) {
    ul.appendChild(mkLi(i, i === paginaActual, () => onPage(i)));
  }
  ul.appendChild(mkLi('»', paginaActual === totalPags, () => onPage(totalPags)));
  cont.appendChild(ul);
}

// Nota: "onPage" se define en ordersController.js para manejar el cambio de página.
