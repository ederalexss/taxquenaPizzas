const form = document.getElementById('formulario');
const tabla = document.querySelector('#tabla tbody');
let indexPedidoEditando = null;
let paginaActual = 1;
const pedidosPorPagina = 3;

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
    const pedido = { cliente: folio, pizzas: pizzasActuales, total, estatus: 'Preparando' };
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

    if (tamano === "individual") return 40;
    if (tamano === "mediana") return orilla ? 160 : promo === "promo_medianas" ? 110 : 125;
    if (tamano === "cuadripizza") return orilla ? 400 : 330;

    if (tamano === "grande") {
        const contieneSoloA = saborArray.every(s => tipoA.includes(s.toLowerCase()));
        const contieneSoloB = saborArray.every(s => tipoB.includes(s.toLowerCase()));

        if (contieneSoloA) return orilla ? 185 : 150;
        if (contieneSoloB) return orilla ? 195 : 160;

        // Combinación entre A y B => usamos la opción más cara (tipo B)
        return orilla ? 195 : 160;
    }

    return 0;
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

    pedidosPagina.forEach((pedido, index) => {
        agregarFila(pedido, pedidos.length - 1 - (inicio + index));
    });

    renderizarPaginador(totalPaginas);
}

function agregarFila(pedido, index) {
    const tabla = document.querySelector("#tabla tbody");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;

    // Construir detalles del pedido
    const detalle = pedido.pizzas.map(p => {
        const orilla = p.orilla ? " (orilla)" : "";
        return `${p.sabores}${orilla} - $${p.total}`;
    }).join("<br>");

    const filaHTML = `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">
          <div class="mb-1"><strong>Folio:</strong> ${pedido.cliente}</div>
          <div class="mb-1"><strong>Sabores:</strong><br> ${detalle}</div>
          <div class="mb-2"><strong>Total:</strong> $${pedido.total}</div>
          <div class="mb-2">
            <span class="badge bg-${pedido.estatus === 'Entregado' ? 'success' : pedido.estatus === 'Cancelado' ? 'danger' : 'warning'} text-dark">
              ${pedido.estatus}
            </span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-success btn-estatus" onclick="cambiarEstatus(${index}, 'Entregado')" title="Entregado">✅</button>
            <button class="btn btn-danger btn-estatus" onclick="cambiarEstatus(${index}, 'Cancelado')" title="Cancelado">❌</button>
            <button class="btn btn-primary btn-estatus" onclick="cambiarEstatus(${index}, 'Preparando')" title="Preparando">🕓</button>
            <button class="btn btn-secondary btn-estatus" onclick="eliminarPedido(${index})" title="Eliminar">🗑</button>
          </div>
        </div>
      </div>
    `;

    td.innerHTML = filaHTML;
    tr.appendChild(td);
    tabla.appendChild(tr);
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
        pizzasActuales.push({ tamano, sabores, orilla, total, descripcion, estatus: 'Preparando' });
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
    const maxVisibles = 5;
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








