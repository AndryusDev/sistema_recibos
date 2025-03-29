const formulario__boton__autenticacion = document.getElementById("formulario__boton__autenticacion");
const formulario__boton__crearcuenta = document.getElementById("formulario__boton__crearcuenta");
const boton__anterior = document.getElementById("boton__anterior");
const boton__confirmar = document.getElementById("boton__confirmar");
const formulario__contenedor = document.querySelector(".formulario__contenedor");


/* Funcionalidad de los botones*/
function resetClases() {
    formulario__contenedor.classList.remove("toggle", "toggle-2", "toggle-3", "toggle-4");
}

// Mueve el formulario a la izquierda cuando presionas "Siguiente"
formulario__boton__autenticacion.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle");
});

// Mueve el formulario aún más a la izquierda cuando presionas "Crear Cuenta"
formulario__boton__crearcuenta.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-2");
});

// Regresa al paso anterior
boton__anterior.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-3");
});

// Confirma el registro
boton__confirmar.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-4");
});

/* Funcionalidad de la barra de progresos */
// Variables de botones
const formularioBotonAutenticacion = document.getElementById("formulario__boton__autenticacion");
const formularioBotonCrearCuenta = document.getElementById("formulario__boton__crearcuenta");
const botonAnterior = document.getElementById("boton__anterior");
const botonConfirmar = document.getElementById("boton__confirmar");
const formularioContenedor = document.querySelector(".formulario__contenedor");

// Variables de la barra de progreso
const steps = document.querySelectorAll(".step");

// Variable para rastrear el paso actual
let currentStep = 1;

// Función para actualizar la barra de progreso
function updateProgressBar() {
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add("active"); // Activa los pasos completados
        } else {
            step.classList.remove("active"); // Desactiva los pasos siguientes
        }
    });
}

// Función para cambiar de paso
function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 4) return; // Ajustado para que el paso 4 también esté permitido

    currentStep = stepNumber; // Actualiza el paso actual

    // Resetea todas las clases del formulario
    formularioContenedor.classList.remove("toggle", "toggle-2", "toggle-3", "toggle-4");

    // Agrega la clase según el paso actual
    if (currentStep === 1) {
        formularioContenedor.classList.add("toggle-4"); // Muestra "Verificación de Usuario"
    } else if (currentStep === 2) {
        formularioContenedor.classList.add("toggle-3"); // Muestra "Crear Cuenta"
    } else if (currentStep === 3) {
        formularioContenedor.classList.add("toggle-2"); // Muestra "Preguntas de Seguridad"
    } else if (currentStep === 4) {
        formularioContenedor.classList.add("toggle-4"); // Muestra "Confirmación"
    }

    // Actualiza la barra de progreso
    updateProgressBar();
}

// Eventos de botones para avanzar y retroceder
formularioBotonAutenticacion.addEventListener("click", () => {
    if (currentStep === 1) {
        currentStep = 2; // Se mueve al paso 2
        goToStep(currentStep);
    }
});

formularioBotonCrearCuenta.addEventListener("click", () => {
    if (currentStep === 2) {
        currentStep = 3; // Se mueve al paso 3
        goToStep(currentStep);
    }
});

botonAnterior.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--; // Retrocede un paso
        goToStep(currentStep);
    }
});

botonConfirmar.addEventListener("click", () => {
    if (currentStep < 4) {
        currentStep++; // Avanza al siguiente paso solo si no es el paso 4
        goToStep(currentStep);
    }
});

// Eventos de la barra de progreso para cambiar de paso
steps.forEach((step, index) => {
    step.addEventListener("click", () => {
        // Solo cambia de paso si el paso seleccionado es diferente al actual
        if (index + 1 !== currentStep) {
            currentStep = index + 1; // Actualiza la variable currentStep
            goToStep(currentStep); // Llama a goToStep con el nuevo paso
        }
    });
});

// Inicializa la barra de progreso correctamente
updateProgressBar();