// Alertas básicas
export const showAlert = (options) => {
    return Swal.fire({
        position: 'center',
        showConfirmButton: true,
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: true,
        ...options
    });
};

// Alertas de éxito
export const showSuccess = (message, title = '¡Éxito!') => {
    return showAlert({
        icon: 'success',
        title,
        text: message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6', // Cambia este color por el que prefieras
        timer: 3000
    });
};

// Alertas de error
export const showError = (message, title = 'Error') => {
    return showAlert({
        icon: 'error',
        title,
        text: message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6', // Cambia este color por el que prefieras
        timer: 3000
    });
};

// Alertas de advertencia
export const showWarning = (message, title = 'Advertencia') => {
    return showAlert({
        icon: 'warning',
        title,
        text: message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6', // Cambia este color por el que prefieras
        timer: 3000
    });
};

// Alertas de información
export const showInfo = (message, title = 'Información') => {
    return showAlert({
        icon: 'info',
        title,
        text: message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6', // Cambia este color por el que prefieras
        timer: 3000
    });
};

// Confirmación
export const showConfirm = (options) => {
    return Swal.fire({
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        ...options
    });
};

// Input de texto
export const showInput = (options) => {
    return Swal.fire({
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6', // Cambia este color por el que prefieras
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => !value && 'Este campo es requerido',
        ...options
    });
};
