const form = document.getElementById('formulario');
const tabla = document.querySelector('#tabla tbody');
let indexPedidoEditando = null;
let paginaActual = 1;
const pedidosPorPagina = 6;

let pizzasActuales = [];

document.addEventListener('DOMContentLoaded', mostrarPedidos);
document.addEventListener('DOMContentLoaded', actualizarTotal);
document.addEventListener('DOMContentLoaded', renderizarCarrito);
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refresco").addEventListener("change", actualizarRestriccionesPromo);
});


finalizarPedido = () => {

    if (pizzasActuales.length === 0) {
        alert("Debes agregar al menos un producto (pizza, hamburguesa o papas).");
        return;
    }

    // Aplicar promoción si corresponde
    let total = pizzasActuales.reduce((sum, p) => sum + p.total, 0);
    let folio = folioPedido();
    const fechaHora = new Date().toLocaleString();
    const pedido = { cliente: folio, pizzas: pizzasActuales, total, estatus: 'Preparando',fechaHora};
    guardarPedido(pedido);
    pizzasActuales = [];
    actualizarTabla();
    renderizarCarrito();
    actualizarRestriccionesPromo();
    actualizarTotal(); // no olvides esto si tienes total del día
}

folioPedido = () => {
    let ultimoFolio = parseInt(localStorage.getItem('folioPedido') || '0');
    ultimoFolio++;
    const folio = `PED-${ultimoFolio.toString().padStart(4, '0')}`;
    localStorage.setItem('folioPedido', ultimoFolio);
    return folio;
}

function calcularPrecio(tamano, orilla, saborArray, promo) {
    const tipoA = ["hawaiana", "peperoni", "quesos"];
    const tipoB = ["pastor", "vegetariana", "taxqueña", "carnes frías"];
    const tipoPremium = ["cochinita"];
    const extraQueso = "extra queso";

    if (tamano === "individual") return 40;

    // Verificar si contiene extra queso
    const tieneExtraQueso = saborArray.some(s => s.toLowerCase() === extraQueso);
    let precioBase = 0;

    // Verificar si contiene cochinita
    const contieneCochinita = saborArray.some(s => tipoPremium.includes(s.toLowerCase()));
    
    if (tamano === "mediana") {
        if (contieneCochinita) {
            precioBase = saborArray.length === 1 ? 145 : 125; // completa o mitad
        } else {
            precioBase = promo === "promo_medianas" ? 110 : 125;
        }
    } else if (tamano === "cuadripizza") {
        precioBase = 330;
    } else if (tamano === "grande") {
        if (contieneCochinita) {
            precioBase = saborArray.length === 1 ? 180 : 160; // completa o mitad
        } else {
            const contieneSoloA = saborArray.every(s => tipoA.includes(s.toLowerCase()));
            const contieneSoloB = saborArray.every(s => tipoB.includes(s.toLowerCase()));
            
            if (contieneSoloA) precioBase = 150;
            else if (contieneSoloB) precioBase = 160;
            else precioBase = 160; // Combinación A y B
        }
    }

    // Agregar cargo por orilla y/o extra queso
    let precioFinal = precioBase;
    if (orilla) precioFinal += 35;
    if (tieneExtraQueso) precioFinal += 40;

    return precioFinal;
}

function guardarPedido(pedido) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    actualizarTotal();
}

function mostrarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidosInvertidos = pedidos.slice().reverse();

    const totalPaginas = Math.ceil(pedidosInvertidos.length / pedidosPorPagina);
    const inicio = (paginaActual - 1) * pedidosPorPagina;
    const fin = inicio + pedidosPorPagina;

    const pedidosPagina = pedidosInvertidos.slice(inicio, fin);

    const tabla = document.querySelector("#tabla tbody");
    tabla.innerHTML = "";
    
    // Crear una única fila y contenedor para todas las cards
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.innerHTML = '<div class="container"><div class="row" id="pedidosContainer"></div></div>';
    tr.appendChild(td);
    tabla.appendChild(tr);

    pedidosPagina.forEach((pedido, index) => {
        agregarFila(pedido, pedidos.length - 1 - (inicio + index));
    });

    renderizarPaginador(totalPaginas);
}

function agregarFila(pedido, index) {
    const contenedor = document.querySelector("#pedidosContainer");

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
    card.innerHTML = `
        <div class="card mb-3 shadow-sm">
            <div class="card-body position-relative">
                <!-- Menú desplegable en la esquina superior derecha -->
                <div class="position-absolute top-0 end-0 mt-2 me-2">
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ⋮
                        </button>
                        <ul class="dropdown-menu">
                            <li><button class="dropdown-item" onclick="cambiarEstatus(${index}, 'Entregado')">✅ Entregado</button></li>
                            <li><button class="dropdown-item" onclick="cambiarEstatus(${index}, 'Preparando')">🕓 Preparando</button></li>
                            <li><button class="dropdown-item" onclick="capturarNombreCliente(${index})">✏️ Capturar nombre</button></li>
                            <li><button class="dropdown-item" onclick="manejarCambio(${index})">💵 Manejar cambio</button></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><button class="dropdown-item text-danger" onclick="eliminarPedido(${index})">🗑 Eliminar</button></li>
                        </ul>
                    </div>
                </div>
                
                <!-- Información del pedido -->
                <div class="mb-2">
                    <strong class="fs-5 fw-bold">Folio:</strong> <span class="fs-6">${pedido.cliente}</span>
                </div>
                ${
                    pedido.nombreCliente 
                        ? `<div class="mb-2"><strong class="fs-5 fw-bold">Cliente:</strong> <span id="nombreCliente-${index}" class="fs-6">${pedido.nombreCliente}</span></div>`
                        : ''
                }
                <div class="mb-2">
                    <strong class="fs-5 fw-bold">Sabores:</strong>
                    <ul class="list-unstyled ps-3">${detalle}</ul>
                </div>
                <div class="mb-2">
                    <strong class="fs-5 fw-bold">Total:</strong> <span class="text-success fs-6">$${pedido.total}</span>
                </div>
                ${
                    pedido.conCambio
                        ? `<div class="mb-2 text-warning"><strong class="fs-5 fw-bold">Nota:</strong> <span class="fs-6">El cliente pagará con cambio.</span></div>`
                        : pedido.cambio !== undefined
                            ? `<div class="mb-2"><strong class="fs-5 fw-bold">Cambio:</strong> <span class="text-primary fs-6">$${pedido.cambio}</span></div>`
                            : ''
                }
                <div class="mt-3">
                    <span class="badge bg-${pedido.estatus === 'Entregado' ? 'success' : pedido.estatus === 'Cancelado' ? 'danger' : 'warning'} text-dark fs-6">
                        ${pedido.estatus}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    contenedor.appendChild(card);
}

// Nueva función para manejar el flujo de cambio
function manejarCambio(index) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedido = pedidos[index];

    // Mostrar opciones al usuario
    const opcion = prompt("Seleccione una opción:\n1. Con cambio\n2. Ingresar monto", "1");

    if (opcion === "1") {
        // Opción "Con cambio"
        pedido.conCambio = true; // Marcar que el cliente pagará con cambio
        delete pedido.cambio; // Eliminar cualquier monto de cambio previo
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        actualizarTabla(); // Redibujar la tabla para reflejar los cambios
    } else if (opcion === "2") {
        // Opción "Ingresar monto"
        const montoCliente = prompt("Ingrese el monto con el que pagará el cliente:", "");

        if (montoCliente !== null && !isNaN(montoCliente) && parseFloat(montoCliente) >= pedido.total) {
            const cambio = parseFloat(montoCliente) - pedido.total;
            pedido.cambio = cambio.toFixed(2); // Guardar el cambio con 2 decimales
            delete pedido.conCambio; // Eliminar la indicación de "con cambio" si se ingresa un monto
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            actualizarTabla(); // Redibujar la tabla para reflejar el cambio
        } else if (montoCliente !== null) {
            alert("El monto ingresado no es válido o es menor al total.");
        }
    } else {
        alert("Opción no válida. Intente nuevamente.");
    }
}

function primeraLetraMayuscula(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto.charAt(0).toUpperCase();
}


function limpiarPedidos() {
    localStorage.removeItem('pedidos');
    tabla.innerHTML = '';
    actualizarTotal();
    renderizarPaginador(0); // Reiniciar paginador
}

function actualizarTotal() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const total = pedidos.reduce((sum, p) => sum + p.total, 0);
    document.getElementById('totalDia').textContent = `$${total}`;
}

function agregarPizza() {
    const tamano = document.getElementById('tamano').value;
    const orilla = document.getElementById('orilla').checked;
    const seleccionados = Array.from(document.querySelectorAll('input[name="sabor"]:checked'));
    const saborArray = seleccionados.map(cb => cb.value);
    const sabores = saborArray.join(', ');
    const promo = document.getElementById('refresco').value;
    const comentario = document.getElementById('comentarioPizza').value.trim();

    let descripcion = "";
    if (promo === "promo_medianas") {
        descripcion = "Promo: 2 medianas + refresco";
    }

    if (promo === "promo_grande" && tamano === "grande") {
        descripcion = 'Incluye refresco 2L (Promo grande)';
    }

    if (tamano !== "") {
        if (saborArray.length < 1 || saborArray.length > 4) {
            alert("Selecciona entre 1 y 4 sabores.");
            return;
        }
        const total = calcularPrecio(tamano, orilla, saborArray, promo);
        pizzasActuales.push({ tamano, sabores, orilla, total, descripcion, comentario, estatus: 'Preparando' });
    }

    actualizarRestriccionesPromo();
    limpiarFormulario();
    renderizarCarrito();
    alert("Pizza agregada al pedido.");
}

limpiarFormulario = () => {
    // Guardar valor de la promoción seleccionada
    const promoSeleccionada = document.getElementById("refresco").value;

    // Limpiar solo los campos de pizza
    document.getElementById('tamano').value = "";
    document.querySelectorAll('input[name="sabor"]').forEach(cb => cb.checked = false);
    document.getElementById('orilla').checked = false;
    document.getElementById('comentarioPizza').value = "";

    // Hamburguesas y papas (si usas inputs numéricos)
    ['burgerSencilla', 'burgerHawaiana', 'burgerArrachera', 'papas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "0";
    });

    // Restaurar la promoción **solo si no es promo de medianas**
    if (promoSeleccionada === "promo_medianas") {
        document.getElementById("refresco").value = promoSeleccionada;
    }

    const medianas = pizzasActuales.filter(p => p.tamano === "mediana").length;

    if (promoSeleccionada === "promo_medianas" && medianas % 2 === 0) {
        // Promo completada
        alert("✅ Se aplicará la promoción de 2 medianas + 1 refresco por $220.");

        // Reiniciar la selección de la promoción para permitir más combos
        document.getElementById("refresco").value = "ninguno";
        actualizarRestriccionesPromo(); // limpia restricciones visuales
    }

}

function cambiarEstatus(index, nuevoEstado) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos[index].estatus = nuevoEstado;
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    actualizarTabla(); // Redibuja la tabla
}

function actualizarTabla() {
    tabla.innerHTML = "";
    mostrarPedidos();
    actualizarTotal();
}

function obtenerClaseEstatus(estatus) {
    switch (estatus.toLowerCase()) {
        case 'preparando': return 'bg-warning text-dark'; // Amarillo
        case 'entregado': return 'bg-success';            // Verde
        case 'cancelado': return 'bg-danger';             // Rojo
        default: return 'bg-secondary';                   // Gris por defecto
    }
}

function eliminarPedido(index) {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) return;

    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.splice(index, 1); // Elimina el pedido del arreglo
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    actualizarTabla(); // Redibuja tabla y actualiza total
}

function ordenarHamburguesas() {

    //validar si hay hamburguesas
    const burgerSencilla = document.getElementById('burgerSencilla').value;
    const burgerHawaiana = document.getElementById('burgerHawaiana').value;
    const burgerArrachera = document.getElementById('burgerArrachera').value;
    const papas = document.getElementById('papas').value;

    if (burgerSencilla === "0" && burgerHawaiana === "0" && burgerArrachera === "0" && papas === "0") {
        alert("No hay hamburguesas ni papas seleccionadas.");
        return; // No hay hamburguesas ni papas seleccionadas
    }

    // Hamburguesas
    const hamburguesas = [
        { id: 'burgerSencilla', nombre: 'Hamburguesa Sencilla', precio: 85 },
        { id: 'burgerHawaiana', nombre: 'Hamburguesa Hawaiana', precio: 100 },
        { id: 'burgerArrachera', nombre: 'Hamburguesa Arrachera', precio: 100 }
    ];

    hamburguesas.forEach(b => {
        const cantidad = parseInt(document.getElementById(b.id).value) || 0;
        for (let i = 0; i < cantidad; i++) {
            pizzasActuales.push({
                tamano: 'Hamburguesa',
                sabores: b.nombre,
                orilla: false,
                total: b.precio,
                descripcion: ''
            });
        }
    });

    // Papas
    const papasInput = document.getElementById("papas");
    const papasCantidad = parseInt(papasInput.value) || 0;
    for (let i = 0; i < papasCantidad; i++) {
        pizzasActuales.push({
            tamano: 'Extra',
            sabores: 'Orden de papas',
            orilla: false,
            total: parseInt(papasInput.dataset.precio),
            descripcion: ''
        });
    }

    renderizarCarrito();
    //lipiar inputs de hamburguesas y papas
    document.getElementById('burgerSencilla').value = "0";
    document.getElementById('burgerHawaiana').value = "0";
    document.getElementById('burgerArrachera').value = "0";
    document.getElementById('papas').value = "0";
}

function editarPedido(index) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedido = pedidos[index];
    indexPedidoEditando = index;

    const agrupados = {};

    // Agrupar productos por clave única
    pedido.pizzas.forEach((p, i) => {
        const clave = `${p.tamano}|${p.sabores}|${p.orilla}|${p.total}`;
        if (!agrupados[clave]) {
            agrupados[clave] = { ...p, cantidad: 1 };
        } else {
            agrupados[clave].cantidad++;
        }
    });

    let html = '';
    let i = 0;
    for (const clave in agrupados) {
        const p = agrupados[clave];
        const orillaTexto = p.orilla ? ' (orilla)' : '';
        html += `
        <div class="row align-items-center mb-2">
          <div class="col-6">${p.sabores}${orillaTexto}</div>
          <div class="col-3">
            <input type="number" class="form-control form-control-sm cantidad-editada" data-clave="${clave}" min="0" value="${p.cantidad}">
          </div>
          <div class="col-3 text-end">$${p.total}</div>
        </div>
      `;
        i++;
    }

    document.getElementById('contenidoEditarPedido').innerHTML = html;

    const modal = new bootstrap.Modal(document.getElementById('modalEditarPedido'));
    modal.show();
}

function guardarCambiosPedido() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const original = pedidos[indexPedidoEditando];

    const nuevasPizzas = [];

    const inputs = document.querySelectorAll('.cantidad-editada');
    const agrupados = {};

    // Reconstruir los productos agrupados
    original.pizzas.forEach(p => {
        const clave = `${p.tamano}|${p.sabores}|${p.orilla}|${p.total}`;
        if (!agrupados[clave]) agrupados[clave] = [];
        agrupados[clave].push(p);
    });

    // Usar la cantidad de inputs para regenerar el array
    inputs.forEach(input => {
        const clave = input.dataset.clave;
        const cantidad = parseInt(input.value);
        if (cantidad > 0 && agrupados[clave]) {
            for (let i = 0; i < cantidad; i++) {
                nuevasPizzas.push(agrupados[clave][0]); // copia base del producto
            }
        }
    });

    // Actualizar el pedido
    pedidos[indexPedidoEditando].pizzas = nuevasPizzas;
    pedidos[indexPedidoEditando].total = nuevasPizzas.reduce((sum, p) => sum + p.total, 0);

    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    actualizarTabla();

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarPedido'));
    modal.hide();
}

function actualizarRestriccionesPromo() {
    const promo = document.getElementById("refresco").value;
    const tamanoSelect = document.getElementById("tamano");
    const feedback = document.getElementById("promoFeedback");

    feedback.innerHTML = ""; // Limpiar mensaje anterior

    if (promo === "promo_medianas") {
        // Deshabilitar todo excepto mediana
        for (let opt of tamanoSelect.options) {
            opt.disabled = opt.value !== "mediana" && opt.value !== "";
        }

        // Contador de medianas
        const medianas = pizzasActuales.filter(p => p.tamano === "mediana").length;
        const promosCompletas = Math.floor(medianas / 2);
        const medianasRestantes = medianas % 2;

        if (promosCompletas === 0) {
            feedback.innerHTML = `<span class="text-muted">🍕 Llevas ${medianas}/2 medianas para activar la promoción.</span>`;
        } else {
            let mensaje = `✅ ${promosCompletas} promoción${promosCompletas > 1 ? 'es' : ''} activa${promosCompletas > 1 ? 's' : ''}`;
            if (medianasRestantes > 0) {
                mensaje += ` — te falta ${2 - medianasRestantes} para la siguiente.`;
            }
            feedback.innerHTML = `<span class="text-success fw-bold">${mensaje}</span>`;
        }

    } else {
        // Si no es promo de medianas, habilitar todas las opciones
        for (let opt of tamanoSelect.options) {
            opt.disabled = false;
        }
        feedback.innerHTML = "";
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById("carritoActual");
    contenedor.innerHTML = "";

    if (pizzasActuales.length === 0) {
        contenedor.innerHTML = "<p class='text-muted'>No hay productos en el carrito.</p>";
        return;
    }

    // Agrupar productos
    const alitas = pizzasActuales.filter(p => p.tamano === "Alitas");
    const boneless = pizzasActuales.filter(p => p.tamano === "Boneless");
    const pizzas = pizzasActuales.filter(p => p.tamano === "individual" || p.tamano === "mediana" || p.tamano === "grande" || p.tamano === "cuadripizza");
    const hamburguesasExtras = pizzasActuales.filter(p => p.tamano === "Hamburguesa" || p.tamano === "Extra");

    // Función auxiliar para crear una sección
    const crearSeccion = (titulo, productos) => {
        if (productos.length === 0) return;

        const seccion = document.createElement("div");
        seccion.className = "mb-3";

        seccion.innerHTML = `<h6 class="text-primary fw-bold">${titulo}</h6>`;

        productos.forEach((p, i) => {
            const orillaTexto = p.orilla ? " (orilla)" : "";
            const fila = document.createElement("div");
            fila.className = "d-flex justify-content-between align-items-center border p-2 mb-1 rounded";
            fila.innerHTML = `
          <div>
          ${p.tamano}-${p.sabores}${orillaTexto} ${p.descripcion ? `<br><small class="text-muted">${p.descripcion}</small>` : ''}
          </div>
          <div>
            <strong>$${p.total}</strong>
            <button class="btn btn-danger btn-sm ms-2" onclick="eliminarDelCarrito(${pizzasActuales.indexOf(p)})">🗑</button>
          </div>
        `;
            seccion.appendChild(fila);
        });

        contenedor.appendChild(seccion);
    };

    // Crear secciones visibles
    crearSeccion("🍗 ALITAS", alitas);
    crearSeccion("🍖 BONELESS", boneless);
    crearSeccion("🍕 PIZZAS", pizzas);
    crearSeccion("🍔 HAMBURGUESAS Y EXTRAS", hamburguesasExtras);
}

function eliminarDelCarrito(index) {
    pizzasActuales.splice(index, 1);
    renderizarCarrito();
    actualizarRestriccionesPromo(); // actualizar feedback promo si aplica
}

function agregarAlitas() {
    const tamano = document.getElementById('tamanoAlitas').value;
    const saboresSeleccionados = Array.from(document.querySelectorAll('input[name="saborAlita"]:checked')).map(cb => cb.value);
    const comentario = document.getElementById('comentarioAlitas').value.trim();

    if (!tamano) {
        alert("Selecciona el tamaño de la orden.");
        return;
    }
    if (saboresSeleccionados.length === 0) {
        alert("Selecciona al menos un sabor para las alitas.");
        return;
    }

    let precio = 0;
    if (tamano === "6") precio = 85;
    else if (tamano === "10") precio = 130;

    pizzasActuales.push({
        tamano: "Alitas",
        sabores: `${tamano} piezas - Sabores: ${saboresSeleccionados.join(", ")}`,
        orilla: false,
        total: precio,
        descripcion: comentario
    });

    renderizarCarrito();
    document.getElementById('tamanoAlitas').value = ""; // Limpiar el tamaño
    document.querySelectorAll('input[name="saborAlita"]').forEach(cb => cb.checked = false); // Limpiar sabores
    document.getElementById('comentarioAlitas').value = ""; // Limpiar comentario
}

function agregarBoneless() {
    const tipo = document.getElementById('tipoBoneless').value;
    const comentario = document.getElementById('comentarioBoneless').value.trim();

    if (!tipo) {
        alert("Selecciona el tipo de orden de boneless.");
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

    pizzasActuales.push({
        tamano: "Boneless",
        sabores: descripcion,
        orilla: false,
        total: precio,
        descripcion: comentario
    });

    renderizarCarrito();
    document.getElementById('tipoBoneless').value = "";
    document.getElementById('comentarioBoneless').value = "";
}

function renderizarPaginador(totalPaginas) {
    const contenedor = document.getElementById("paginador");
    contenedor.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "pagination justify-content-center";

    // Botón anterior
    const liPrev = document.createElement("li");
    liPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `<button class="page-link">«</button>`;
    liPrev.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarPedidos();
        }
    };
    ul.appendChild(liPrev);

    // Botones por página (máx 5 visibles)
    const maxVisibles = 10;
    const startPage = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    const endPage = Math.min(totalPaginas, startPage + maxVisibles - 1);

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link">${i}</button>`;
        li.onclick = () => {
            paginaActual = i;
            mostrarPedidos();
        };
        ul.appendChild(li);
    }

    // Botón siguiente
    const liNext = document.createElement("li");
    liNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    liNext.innerHTML = `<button class="page-link">»</button>`;
    liNext.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarPedidos();
        }
    };
    ul.appendChild(liNext);

    contenedor.appendChild(ul);
}

function registrarFinanza() {
    const tipo = document.getElementById('tipoRegistro').value;
    const monto = parseFloat(document.getElementById('montoRegistro').value);
    const descripcion = document.getElementById('descripcionRegistro').value.trim();
    const fechaHora = new Date().toLocaleString();

    if (!monto || monto <= 0) {
        alert("Ingrese un monto válido.");
        return;
    }

    const registro = { tipo, monto, descripcion, fechaHora };
    const finanzas = JSON.parse(localStorage.getItem('finanzas')) || [];
    finanzas.push(registro);
    localStorage.setItem('finanzas', JSON.stringify(finanzas));

    actualizarTablaFinanzas();
    document.getElementById('formFinanzas').reset();
}

function actualizarTablaFinanzas() {
    const finanzas = JSON.parse(localStorage.getItem('finanzas')) || [];
    const tabla = document.getElementById('tablaFinanzas');
    tabla.innerHTML = "";

    let totalIngresos = 0;
    let totalGastos = 0;

    finanzas.forEach(registro => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.fechaHora}</td>
            <td>${registro.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</td>
            <td>$${registro.monto.toFixed(2)}</td>
            <td>${registro.descripcion || 'Sin descripción'}</td>
        `;
        tabla.appendChild(fila);

        // Calcular totales
        if (registro.tipo === 'ingreso') {
            totalIngresos += registro.monto;
        } else if (registro.tipo === 'gasto') {
            totalGastos += registro.monto;
        }
    });

    // Mostrar totales
    const totalesDiv = document.getElementById('totalesFinanzas');
    totalesDiv.innerHTML = `
        <p><strong>Total Ingresos:</strong> $${totalIngresos.toFixed(2)}</p>
        <p><strong>Total Gastos:</strong> $${totalGastos.toFixed(2)}</p>
        <p><strong>Balance:</strong> $${(totalIngresos - totalGastos).toFixed(2)}</p>
    `;
}

// Inicializar tabla de finanzas al cargar la página
document.addEventListener('DOMContentLoaded', actualizarTablaFinanzas);

function incrementar(id) {
    const element = document.getElementById(id);
    let value = parseInt(element.value);
    element.value = value + 1;
}

function decrementar(id) {
    const element = document.getElementById(id);
    let value = parseInt(element.value);
    if (value > 0) {
        element.value = value - 1;
    }
}










