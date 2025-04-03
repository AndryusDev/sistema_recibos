// Variables de botones - Adaptadas a tu formulario
const contenedor__boton__verificacion = document.getElementById("contenedor__boton__verificacion");
const formulario__boton__preguntas = document.getElementById("formulario__boton__preguntas");
const boton__anterior__cambiarcontraseña = document.getElementById("boton__anterior__cambiarcontraseña");
const boton__cambiarcontraseña = document.getElementById("boton__cambiarcontraseña");
const formulario__boton__preguntas__anterior = document.getElementById("formulario__boton__preguntas__anterior");
const contenedor__recuperarcontraseña__contenido = document.querySelector(".contenedor__recuperarcontraseña__contenido");

/* Funcionalidad de los botones - Misma estructura */
function resetClases() {
    contenedor__recuperarcontraseña__contenido.classList.remove("toggle", "toggle-2", "toggle-3","toggle-4");
}

// Confirma el cambio de contraseña
boton__cambiarcontraseña.addEventListener("click", () => {
    // Aquí iría la lógica para confirmar el cambio
    alert("Contraseña cambiada exitosamente");
});




/* Funcionalidad de la barra de progresos - Adaptada */
// Variables de la barra de progreso
const stepsCambiar = document.querySelectorAll(".cambiarcontraseña_step");

// Variable para rastrear el paso actual
let currentStepCambiar = 1;

// Conjunto de pasos completados
let steps_completados_cambiar = new Set([1]);

// Función para actualizar la barra de progreso
function updateProgressBarCambiar() {
    stepsCambiar.forEach((step, index) => {
        let stepNumber = index + 1;

        if (stepNumber === currentStepCambiar) {
            // Paso actual en rojo
            step.classList.add("active");
            step.classList.remove("disabled", "completed");
        } else if (stepNumber < currentStepCambiar) {
            // Pasos anteriores desbloqueados y en azul
            step.classList.add("completed");
            step.classList.remove("active", "disabled");
        } else {
            // Pasos futuros siguen bloqueados
            step.classList.add("disabled");
            step.classList.remove("active", "completed");
        }
        if (steps_completados_cambiar.has(stepNumber)) {
            step.classList.remove("disabled");
        }
    });
}

// Función para cambiar de paso
function goToStep__camb(stepNumber) {
    if (stepNumber < 1 || stepNumber > 3) return; // Solo 3 pasos

    currentStepCambiar = stepNumber;
    steps_completados_cambiar.add(stepNumber);
    resetClases();

    // Asigna la clase correcta según el paso
    if (stepNumber === 1) {
        contenedor__recuperarcontraseña__contenido.classList.add("toggle");
    } else if (stepNumber === 2) {
        contenedor__recuperarcontraseña__contenido.classList.add("toggle-2");
    } else if (stepNumber === 3) {
        contenedor__recuperarcontraseña__contenido.classList.add("toggle-3");
    }

    updateProgressBarCambiar();
}

// Eventos de botones para avanzar y retroceder - Adaptados
contenedor__boton__verificacion.addEventListener("click", () => {
    goToStep__camb(2); // Usa la función unificada
});

// Botón "Aceptar" (Paso 2 → Paso 3)
formulario__boton__preguntas.addEventListener("click", () => {
    goToStep__camb(3);
});

// Botones "Anterior" (Retroceder)
boton__anterior__cambiarcontraseña.addEventListener("click", () => {
    if (currentStepCambiar > 1) goToStep__camb(currentStepCambiar - 1);
});

formulario__boton__preguntas__anterior.addEventListener("click", () => {
    if (currentStepCambiar > 1) goToStep__camb(currentStepCambiar - 1);
});

// Eventos de la barra de progreso para cambiar de paso
stepsCambiar.forEach((step, index) => {
    step.addEventListener("click", () => {
        let clickedStep = index + 1;
        if (steps_completados_cambiar.has(clickedStep)) {
            goToStep__camb(clickedStep);
        }
    });
});

// Inicializa la barra de progreso correctamente
updateProgressBarCambiar();