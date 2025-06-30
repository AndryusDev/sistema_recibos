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
contenedor__boton__verificacion.addEventListener("click", async (e) => {
    e.preventDefault();

    const cedulaInput = document.getElementById('contenedor_cedula');
    const mensajeDiv = document.getElementById('mensajeValidacion');
    const preguntasContainer = document.getElementById('preguntasContainer');

    if (!mensajeDiv) {
        console.warn("Elemento con id 'mensajeValidacion' no encontrado. Se omitirá mostrar mensajes.");
    }

    if (!preguntasContainer) {
        console.warn("Elemento con id 'preguntasContainer' no encontrado. Se omitirá mostrar preguntas.");
    }

    if (!cedulaInput) {
        console.error("Elemento con id 'contenedor_cedula' no encontrado.");
        return;
    }

    const cedula = cedulaInput.value.trim();

    if (!cedula) {
        if (mensajeDiv) mensajeDiv.textContent = 'Por favor ingrese la cédula.';
        if (preguntasContainer) preguntasContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch('/api/validar_cedula/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ cedula: cedula })
        });

        const data = await response.json();

        if (data.success) {
            if (mensajeDiv) mensajeDiv.textContent = 'Cédula validada correctamente.';
            if (preguntasContainer) mostrarPreguntas(data.preguntas);
            goToStep__camb(2); // Avanza al siguiente panel solo si la cédula es válida
        } else {
            if (mensajeDiv) mensajeDiv.textContent = data.message || 'Cédula no válida.';
            if (preguntasContainer) preguntasContainer.innerHTML = '';
        }
    } catch (error) {
        if (mensajeDiv) mensajeDiv.textContent = 'Error al validar la cédula.';
        if (preguntasContainer) preguntasContainer.innerHTML = '';
        console.error('Error:', error);
    }
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

function mostrarPreguntas(preguntas) {
    preguntasContainer.innerHTML = '';
    // Only show two random questions from the list
    const shuffled = preguntas.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    selected.forEach((pregunta, index) => {
        const label = document.getElementById('pregunta' + (index + 1));
        const input = document.getElementById('respuesta' + (index + 1));

        if (label && input) {
            label.textContent = pregunta.pregunta;
            input.value = ''; // Clear previous answer
            input.required = true;
        }
    });
}

// Helper function to get CSRF token cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Inicializa la barra de progreso correctamente
updateProgressBarCambiar();
