// src/utils/quantity.js
export function incrementar(id) {
    const element = document.getElementById(id);
    let value = parseInt(element.value) || 0;
    element.value = value + 1;
  }
  
  export function decrementar(id) {
    const element = document.getElementById(id);
    let value = parseInt(element.value) || 0;
    if (value > 0) {
      element.value = value - 1;
    }
  }
  