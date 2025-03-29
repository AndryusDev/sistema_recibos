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
const formularioContenedor = document.querySelector(".formulario__contenedor");
const steps = document.querySelectorAll(".step");

// Variable para controlar el paso actual
let currentStep = 1;

// Función para cambiar de paso
function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Remueve todas las clases activas de los pasos
    steps.forEach(step => step.classList.remove("active"));

    // Activa solo el paso seleccionado
    document.getElementById(`step${stepNumber}`).classList.add("active");

    // Resetea las clases de animación del formulario
    formularioContenedor.classList.remove("toggle", "toggle-2", "toggle-3", "toggle-4");

    // Agrega la clase correspondiente al paso seleccionado
    if (stepNumber === 1) {
        formularioContenedor.classList.add("toggle"); // Verificación de Usuario
    } else if (stepNumber === 2) {
        formularioContenedor.classList.add("toggle-2"); // Crear Cuenta
    } else if (stepNumber === 3) {
        formularioContenedor.classList.add("toggle-3"); // Preguntas de Seguridad
    }
}

// Eventos en la barra de progreso
steps.forEach((step, index) => {
    step.addEventListener("click", () => goToStep(index + 1));
});

// Eventos en los botones inferiores
formularioBotonAutenticacion.addEventListener("click", () => goToStep(1));
formularioBotonCrearCuenta.addEventListener("click", () => goToStep(2));
formularioBotonPreguntasSeguridad.addEventListener("click", () => goToStep(3));

// Control de botón "Anterior"
botonAnterior.addEventListener("click", () => {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
});

// Control de botón "Confirmar" (Va al último paso)
botonConfirmar.addEventListener("click", () => {
    goToStep(3);
});