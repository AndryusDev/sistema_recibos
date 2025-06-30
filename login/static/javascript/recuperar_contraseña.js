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
boton__cambiarcontraseña.addEventListener("click", async () => {
    const usuarioIdElement = document.getElementById("usuario_id");
    if (!usuarioIdElement) {
        alert("Error: usuario_id no encontrado en la página.");
        return;
    }
    let usuario_id = usuarioIdElement.value;
    if (!usuario_id) {
        // Try to get usuario_id from the cedula input if hidden input is empty
        const cedulaInput = document.getElementById('contenedor_cedula');
        if (cedulaInput) {
            usuario_id = cedulaInput.value.trim();
        }
    }
    // Remove contrasena_actual input since it's no longer required
    const nueva_contrasena_input = document.getElementById("nueva_contraseña");
    const confirmar_contrasena_input = document.getElementById("confirmar_contrasena");

    if (!nueva_contrasena_input || !confirmar_contrasena_input) {
        alert("Error: campos de contraseña no encontrados en la página.");
        return;
    }

    const nueva_contrasena = nueva_contrasena_input.value.trim();
    const confirmar_contrasena = confirmar_contrasena_input.value.trim();

    if (!nueva_contrasena) {
        alert("Por favor ingrese la nueva contraseña.");
        return;
    }
    if (!confirmar_contrasena) {
        alert("Por favor confirme la nueva contraseña.");
        return;
    }
    if (nueva_contrasena !== confirmar_contrasena) {
        alert("La nueva contraseña y la confirmación no coinciden.");
        return;
    }

    console.log("Payload to send:", {
        cedula: usuario_id,
        nueva_contrasena: nueva_contrasena,
        confirmar_contrasena: confirmar_contrasena
    });

    try {
        const response = await fetch('/api/cambiar_contrasena_por_cedula/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                cedula: usuario_id,
                nueva_contrasena: nueva_contrasena,
                confirmar_contrasena: confirmar_contrasena
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Contraseña cambiada exitosamente.");
            window.location.href = '/login/'; // Redirect to login page after password change
        } else {
            alert(data.message || "Error al cambiar la contraseña.");
        }
    } catch (error) {
        alert("Error al cambiar la contraseña.");
        console.error("Error:", error);
    }
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
    // Fix: preguntasContainer element does not exist in HTML, so create it dynamically or use existing container
    let preguntasContainer = document.getElementById('preguntasContainer');
    if (!preguntasContainer) {
        // Create preguntasContainer div inside the form for questions dynamically
        const preguntasForm = document.querySelector('.contenedor__recuperarcontraseña__contenido__panel__respuestapreguntas');
        if (preguntasForm) {
            preguntasContainer = document.createElement('div');
            preguntasContainer.id = 'preguntasContainer';
            preguntasForm.insertBefore(preguntasContainer, preguntasForm.firstChild);
        } else {
            console.warn("No se encontró el contenedor para preguntas y no se pudo crear.");
        }
    }

    if (!mensajeDiv) {
        console.warn("Elemento con id 'mensajeValidacion' no encontrado. Se omitirá mostrar mensajes.");
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
formulario__boton__preguntas.addEventListener("click", async (e) => {
    e.preventDefault();

    const cedulaInput = document.getElementById('contenedor_cedula');
    const mensajeDiv = document.getElementById('mensajeValidacion');
    const preguntasContainer = document.getElementById('preguntasContainer');

    if (!cedulaInput) {
        console.error("Elemento con id 'contenedor_cedula' no encontrado.");
        return;
    }

    const cedula = cedulaInput.value.trim();

    if (!cedula) {
        if (mensajeDiv) mensajeDiv.textContent = 'Por favor ingrese la cédula.';
        return;
    }

    // Collect answers from inputs
    const respuestas = [];
    for (let i = 1; i <= 2; i++) {
        const preguntaLabel = document.getElementById('pregunta' + i);
        const respuestaInput = document.getElementById('respuesta' + i);
        if (preguntaLabel && respuestaInput) {
            // Find pregunta id by matching label text with preguntas list is not possible here,
            // so we will store pregunta ids in data attributes when showing questions.
            const preguntaId = respuestaInput.getAttribute('data-pregunta-id');
            const respuesta = respuestaInput.value.trim();
            if (!respuesta) {
                if (mensajeDiv) mensajeDiv.textContent = 'Por favor responda todas las preguntas.';
                return;
            }
            respuestas.push({ pregunta_id: preguntaId, respuesta: respuesta });
        }
    }

    console.log("Payload to send:", { cedula: cedula, respuestas: respuestas });

    try {
        const response = await fetch('/api/validar_respuestas_preguntas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ cedula: cedula, respuestas: respuestas })
        });

        const data = await response.json();

        if (data.success) {
            if (mensajeDiv) mensajeDiv.textContent = 'Respuestas correctas. Puede continuar.';
            goToStep__camb(3);
        } else {
            if (mensajeDiv) mensajeDiv.textContent = data.message || 'Respuestas incorrectas. Intente de nuevo.';
        }
    } catch (error) {
        if (mensajeDiv) mensajeDiv.textContent = 'Error al validar las respuestas.';
        console.error('Error:', error);
    }
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
            input.setAttribute('data-pregunta-id', pregunta.id); // Store pregunta id for validation
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
