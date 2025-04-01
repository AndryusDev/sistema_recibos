const formulario__boton__autenticacion = document.getElementById("formulario__boton__autenticacion");
const formulario__boton__crearcuenta = document.getElementById("formulario__boton__crearcuenta");
const boton__anterior = document.getElementById("boton__anterior");
const boton__confirmar = document.getElementById("boton__confirmar");
const formulario__boton__crearcuenta__anterior = document.getElementById("formulario__boton__crearcuenta__anterior");
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

// Conjunto de pasos completados
let steps_completados = new Set([1]);
// steps_completados.has(stepNumber
// Función para actualizar la barra de progreso
function updateProgressBar() {
    steps.forEach((step, index) => {
        let stepNumber = index + 1;

        if (stepNumber === currentStep) {
            // Paso actual en rojo
            step.classList.add("active");
            step.classList.remove("disabled", "completed");
        } else if (stepNumber < currentStep) {
            // Pasos anteriores desbloqueados y en azul
            step.classList.add("completed");
            step.classList.remove("active", "disabled");
        } else {
            // Pasos futuros siguen bloqueados
            step.classList.add("disabled");
            step.classList.remove("active", "completed");
        }
        if (steps_completados.has(stepNumber)) {
            step.classList.remove("disabled");
        }
    });
}

// Función para cambiar de paso
function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 4) return;

    currentStep = stepNumber;
    steps_completados.add(stepNumber); // Se marca el paso como completado

    formulario__contenedor.classList.remove("toggle", "toggle-2", "toggle-3", "toggle-4");

    if (currentStep === 1) {
        formulario__contenedor.classList.add("toggle");
    } else if (currentStep === 2) {
        formulario__contenedor.classList.add("toggle-2");
    } else if (currentStep === 3) {
        formulario__contenedor.classList.add("toggle-3");
    } else if (currentStep === 4) {
        formulario__contenedor.classList.add("toggle-4");
    }

    updateProgressBar();
}

// Eventos de botones para avanzar y retroceder
formulario__boton__autenticacion.addEventListener("click", () => {
    if (currentStep === 1) {
        goToStep(2);
    }
});

formulario__boton__crearcuenta.addEventListener("click", () => {
    if (currentStep === 2) {
        goToStep(3);
    }
});

boton__anterior.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--; // Retrocede un paso sin eliminarlo de steps_completados
        goToStep(currentStep);
    }
});

boton__confirmar.addEventListener("click", () => {
    if (currentStep < 4) {
        goToStep(currentStep + 1);
    }
});
formulario__boton__crearcuenta__anterior.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--; // Retrocede un paso
        goToStep(currentStep);
    }
});

// Eventos de la barra de progreso para cambiar de paso
steps.forEach((step, index) => {
    step.addEventListener("click", () => {
        let clickedStep = index + 1;
        if (steps_completados.has(clickedStep)) {
            goToStep(clickedStep);
        }
    });
});

// Inicializa la barra de progreso correctamente
updateProgressBar();