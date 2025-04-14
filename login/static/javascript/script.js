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
formulario__boton__autenticacion.addEventListener("click", async (e) => {
    e.preventDefault();

    const cedula = document.getElementById("formulario_cedula").value;
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

    try {
        const response = await fetch("/verificar_empleado/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `formulario_cedula=${encodeURIComponent(cedula)}`,
        });

        if (!response.ok) throw new Error("Error en la petición: " + response.status);

        const data = await response.json();

        if (data.status === "success") {

            sessionStorage.setItem('cedula_empleado', data.empleado.cedula);

            // Mensaje personalizado según si tiene usuario o no
            const mensaje = data.tiene_usuario 
                ? "✅ Empleado verificado (ya tiene cuenta)"
                : "✅ Empleado verificado (no tiene cuenta)";
            
            alert(mensaje);
            
            // Solo avanzar si NO tiene usuario
            if (!data.tiene_usuario) {
                // Llenar los campos de nombres y apellidos
                const nombres = `${data.empleado.primer_nombre} ${data.empleado.segundo_nombre}`.trim();
                const apellidos = `${data.empleado.primer_apellido} ${data.empleado.segundo_apellido}`.trim();

                // Asignar los nombres y apellidos a los campos correspondientes
                document.getElementById("input_nombres").value = data.empleado.primer_nombre;
                document.getElementById("input_apellidos").value = data.empleado.primer_apellido;
                document.getElementById('segundo_nombre').value = data.empleado.segundo_nombre;
                document.getElementById('segundo_apellido').value = data.empleado.segundo_apellido;

                // Deshabilitar los campos
                document.getElementById("input_nombres").disabled = true;
                document.getElementById("input_apellidos").disabled = true;
                document.getElementById("segundo_nombre").disabled = true;
                document.getElementById("segundo_apellido").disabled = true;

                // Avanzar al segundo panel, No sume a la barra de proceso
                goToStep(2);
            }
            
            // Opcional: puedes guardar esta info para usarla después
            sessionStorage.setItem('tiene_usuario', data.tiene_usuario);
            
        } else {
            // Manejo de errores
            alert("❌ " + (data.message || "Error en la verificación"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("⚠ Error al conectar con el servidor");
    }
});

//Funcionalidad de boton para crear cuenta
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("form-crear-cuenta").addEventListener('submit', async function(e) {
        e.preventDefault();

        const cedula = sessionStorage.getItem('cedula_empleado');
        console.log(cedula)

        const email = document.getElementById("email").value;
        const contraseña = document.getElementById("contraseña").value;
        const confirmar_contraseña = document.getElementById("confirmar_contraseña").value
        const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
        const datos = `email=${encodeURIComponent(email)}&contraseña=${encodeURIComponent(contraseña)}&confirmar_contraseña=${encodeURIComponent(confirmar_contraseña)}&cedula=${encodeURIComponent(cedula)}`;
        try{
            const response = await fetch("/crear_cuenta_empleado/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,  // Token de seguridad
                "Content-Type": "application/x-www-form-urlencoded",
                },
                body: datos
            });
            const data = await response.json();  // Convertir la respuesta a JSON

            if (data.status === "success") {
                alert("✅ Información verificada exitosamente!");
                goToStep(3); /*No sume al contador para la barra de proceso*/
            } else {
                alert(`❌ ${data.error}`);
            }
        } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("⚠ Error al conectar con el servidor");
    }
});

});


boton__anterior.addEventListener("click", () => {
    if (currentStep > 1) {
        currentStep--; // Retrocede un paso sin eliminarlo de steps_completados
        goToStep(currentStep);
    }
});

document.getElementById('boton__confirmar').addEventListener('click', async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token_registro') || document.cookie.split('; ').find(row => row.startsWith('token_registro='))?.split('=')[1];
    
    if (!token) {
        alert("❌ Sesión expirada. Por favor, comienza el registro nuevamente.");
        window.location.reload();
        return;
    }

    
    // 1. Obtener datos del formulario (ahora con 3 preguntas)
    const pregunta1 = document.getElementById("pregunta1").value;
    const respuesta1 = document.getElementById("respuesta1").value;
    const pregunta2 = document.getElementById("pregunta2").value;
    const respuesta2 = document.getElementById("respuesta2").value;
    const pregunta3 = document.getElementById("pregunta3").value;
    const respuesta3 = document.getElementById("respuesta3").value;
    
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

    // 2. Validar campos obligatorios (3 preguntas ahora)
    if (!pregunta1 || !respuesta1 || !pregunta2 || !respuesta2 || !pregunta3 || !respuesta3) {
        alert("❌ Todas las preguntas de seguridad son obligatorias");
        return;
    }

    try {
        // 3. Preparar datos para enviar (incluyendo la 3ra pregunta)
        const formData = new URLSearchParams();
        formData.append('pregunta1', pregunta1);
        formData.append('respuesta1', respuesta1);
        formData.append('pregunta2', pregunta2);
        formData.append('respuesta2', respuesta2);
        formData.append('pregunta3', pregunta3);
        formData.append('respuesta3', respuesta3);
        formData.append('token', token);
        formData.append('csrfmiddlewaretoken', csrfToken);

        // 4. Enviar datos al servidor
        const response = await fetch("/completar_registro/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            body: formData
        });

        const data = await response.json();

        if (data.status === "success") {
            alert("✅ Registro completado exitosamente!");
            window.location.href = "/login"; // Redirigir al dashboard
        } else {
            alert(`❌ Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("⚠ Error al conectar con el servidor");
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



