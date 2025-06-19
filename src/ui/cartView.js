// Importar la variable pizzasActuales del controlador
import { pizzasActuales } from '../controllers/cartController.js';
import { showSuccess } from '../utils/alerts.js';
import { formatearPrecio } from '../utils/utlis.js';
// Render del carrito y restricciones de promo
export function renderizarCarrito(pizzasActuales) {
    const cont = document.getElementById('carritoActual');
    cont.innerHTML = '';
    
    // Estado vacío
    if (pizzasActuales.length === 0) {
      cont.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-3">
            <i class="bi bi-cart-x" style="font-size: 3rem; color: #dee2e6;"></i>
          </div>
          <h5 class="text-muted mb-2">El carrito está vacío</h5>
          <p class="text-muted small">Agrega productos para continuar</p>
        </div>`;
      return;
    }
    
    // Calcular total
    const total = pizzasActuales.reduce((sum, item) => sum + item.total, 0);
  
    // Actualizar el total en la interfaz
    const totalElement = document.getElementById('totalCarrito');
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    const montarSeccion = (titulo, items, indices) => {
      if (!items.length) return;
      
      const sec = document.createElement('div');
      sec.className = 'card mb-4 border-0 shadow-sm';
      
      const header = document.createElement('div');
      header.className = 'card-header bg-white border-bottom-0';
      header.innerHTML = `<h5 class="mb-0 fw-bold">${titulo}</h5>`;
      
      const body = document.createElement('div');
      body.className = 'card-body p-0';
      
      const listGroup = document.createElement('div');
      listGroup.className = 'list-group list-group-flush';
      
      items.forEach((it, idx) => {
        const item = document.createElement('div');
        item.className = 'list-group-item border-0 px-4 py-3';
        
        const row = document.createElement('div');
        row.className = 'row g-2 align-items-center';
        
        // Contenido del ítem
        const contentCol = document.createElement('div');
        contentCol.className = 'col';
        
        const title = document.createElement('div');
        title.className = 'fw-medium';
        title.textContent = it.descripcion || it.sabores || it.tamano;
        
        // Si hay comentario, mostrarlo
        if (it.comentario) {
          const comment = document.createElement('div');
          comment.className = 'text-muted small mt-1';
          comment.innerHTML = `<i class="bi bi-chat-left-text me-1"></i> ${it.comentario}`;
          contentCol.appendChild(comment);
        }
        
        contentCol.prepend(title);
        
        // Precio
        const priceCol = document.createElement('div');
        priceCol.className = 'col-auto';
        
        const price = document.createElement('div');
        price.className = 'fw-bold text-end';
        price.textContent = formatearPrecio(it.total);
        priceCol.appendChild(price);
        
        // Botón de eliminar
        const deleteCol = document.createElement('div');
        deleteCol.className = 'col-auto';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center';
        deleteBtn.style.width = '32px';
        deleteBtn.style.height = '32px';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Eliminar del carrito';
        deleteBtn.onclick = () => eliminarDelCarrito(indices[idx]);
        
        deleteCol.appendChild(deleteBtn);
        
        // Construir la estructura
        row.appendChild(contentCol);
        row.appendChild(priceCol);
        row.appendChild(deleteCol);
        item.appendChild(row);
        listGroup.appendChild(item);
      });
      
      body.appendChild(listGroup);
      sec.appendChild(header);
      sec.appendChild(body);
      cont.appendChild(sec);
    };
    
    // Crear arrays de índices para mantener el seguimiento de la posición original
    const alitas = [];
    const alitasIndices = [];
    const boneless = [];
    const bonelessIndices = [];
    const pizzas = [];
    const pizzasIndices = [];
    const otros = [];
    const otrosIndices = [];
    
    // Clasificar los ítems y guardar sus índices originales
    pizzasActuales.forEach((item, index) => {
      if (item.tamano === 'Alitas') {
        alitas.push(item);
        alitasIndices.push(index);
      } else if (item.tamano === 'Boneless') {
        boneless.push(item);
        bonelessIndices.push(index);
      } else if (['individual', 'mediana', 'grande', 'cuadripizza'].includes(item.tamano)) {
        pizzas.push(item);
        pizzasIndices.push(index);
      } else {
        otros.push(item);
        otrosIndices.push(index);
      }
    });
    
    // Renderizar cada sección con sus respectivos índices
    if (alitas.length > 0) montarSeccion('🍗 ALITAS', alitas, alitasIndices);
    if (boneless.length > 0) montarSeccion('🍖 BONELESS', boneless, bonelessIndices);
    if (pizzas.length > 0) montarSeccion('🍕 PIZZAS', pizzas, pizzasIndices);
    if (otros.length > 0) montarSeccion('🍔 HAMBURGUESAS Y EXTRAS', otros, otrosIndices);
    
    // Sección de total
    const totalSection = document.createElement('div');
    totalSection.className = 'card border-0 bg-light mt-3';
    totalSection.innerHTML = `
      <div class="card-body py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Total</h5>
          <div class="d-flex align-items-center">
            <span class="h4 mb-0 fw-bold text-primary">${formatearPrecio(total)}</span>
          </div>
        </div>
      </div>`;
    cont.appendChild(totalSection);
  }

// Función para eliminar un ítem del carrito
export function eliminarDelCarrito(index) {
  if (index >= 0 && index < pizzasActuales.length) {
    // Eliminar el ítem del array
    pizzasActuales.splice(index, 1);
    
    // Volver a renderizar el carrito
    renderizarCarrito(pizzasActuales);
    
    // Actualizar restricciones de promoción si es necesario
    actualizarRestriccionesPromo(pizzasActuales);
    
    // Mostrar notificación de éxito
    if (typeof showSuccess === 'function') {
      showSuccess('Producto eliminado del carrito');
    } else if (typeof mostrarAlerta === 'function') {
      mostrarAlerta('Producto eliminado del carrito', 'success');
    }
  }
}
  
// Función para actualizar restricciones de promoción
export function actualizarRestriccionesPromo(pizzasActuales) {
    const promo = document.getElementById('refresco').value;
    const med = pizzasActuales.filter(p => p.tamano.toLowerCase() === 'mediana').length;
    const sel = document.getElementById('tamano');
    if (promo === 'promo_medianas' && med % 2 === 1) {
      [...sel.options].forEach(o => { if (o.value === 'mediana') o.disabled = true; });
    } else {
      [...sel.options].forEach(o => { if (o.value === 'mediana') o.disabled = false; });
    }
}
  