document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'constancia_trabajo.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de constancia de trabajo cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

// Versión mejorada de constancia_trabajo.js

// Primero verificamos si el evento templateLoaded está definido (para compatibilidad)
function initConstanciaTrabajo() {
    console.log("Inicializando constancia de trabajo...");
    
    // 2. Selección de elementos con delegación de eventos
    document.body.addEventListener('click', function(e) {
        // 3. Delegación de eventos para el botón generar
        if (e.target && e.target.id === 'generarConstancia') {
            e.preventDefault();
            generarConstancia();
        }
        
        // 4. Delegación para el botón imprimir (si existe)
        if (e.target && e.target.id === 'imprimirConstancia') {
            e.preventDefault();
            imprimirConstancia();
        }
        
        // 5. Delegación para el botón cerrar
        if (e.target && e.target.onclick && e.target.onclick.name === 'constanciaModal__cerrar') {
            e.preventDefault();
            constanciaModal__cerrar();
        }
    });
    
    // 6. Inicialización directa por si el contenido ya está disponible
    setupButtons();
}

// 7. Función para configurar botones directamente
function setupButtons() {
    const btnGenerar = document.getElementById('generarConstancia');
    const btnImprimir = document.getElementById('imprimirConstancia');
    
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarConstancia);
    }
    
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirConstancia);
    }
}

// 8. Función para generar la constancia
function generarConstancia() {
    console.log("Generando constancia...");
    
    const modal = document.getElementById('constanciaModal');
    const contenido = document.getElementById('contenidoConstancia');
    
    if (!modal || !contenido) {
        console.error("Elementos del modal no encontrados");
        return;
    }
    
    // 9. Datos dinámicos (deberías obtenerlos de tu backend o formularios)
    const datos = {
        nombre: "DIANA ESTEFANÍA GARCÍA SIRAN",
        cedula: "V-30.534.904",
        cargo: "ASISTENTE ADMINISTRATIVO I",
        fechaIngreso: "15 de marzo de 2021",
        fechaActual: new Date()
    };
    
    // 10. Plantilla con datos dinámicos
    contenido.innerHTML = `
        <div class="encabezado-constancia">
            <div class="logo-izquierdo">
                <img src="/static/image/MinRIntPaz.png" alt="Logo izquierdo">
            </div>
            <div class="textos-centro">
                <h2>POLICIA BOLIVARIANA DEL ESTADO ANZOATEGUI</h2>
                <h3>Centro de Coordinación Policial G/D José Antonio Anzoátegui</h3>
                <h3>DESPACHO DE DIRECCIÓN GENERAL</h3>
                <h3>DIRECCIÓN DE TALENTO HUMANO</h3>
            </div>
            <div class="logo-derecho">
            <img src="/static/image/logo_polibanz.png" alt="Logo izquierdo">
            </div>
        </div>
        <h3 class="sub_titulo">Constancia de Trabajo</h3>
        <div class="cuerpo-constancia">
            <div class="primer_texto">
                <p>Quien suscribre, Director(a) de Recursos Humanos de la Policía Estadal Bolivariana de Anzoátegui, hace constar que los datos que se suministran a continuación, corresponden a un funcionario que labora en esta Institución:</p>
            </div>

            <p>La presente constancia se expide a solicitud del interesado(a) en Lechería, 
            a los <strong>${datos.fechaActual.getDate()}</strong> días del mes de 
            <strong>${datos.fechaActual.toLocaleString('es-ES', { month: 'long' })}</strong> de 
            <strong>${datos.fechaActual.getFullYear()}</strong>.</p>
            
            <div class="firma">
                <p>Atentamente,</p>
                <p>Dirección de Recursos Humanos</p>
            </div>
        </div>
    `;
    
    modal.style.display = "flex";
    
    // 11. Mostrar botones de acción si existen
    const botonesAcciones = document.querySelector('.botones-acciones');
    if (botonesAcciones) {
        botonesAcciones.style.display = "block";
    }
}

// 12. Función para imprimir
function imprimirConstancia() {
    const contenido = document.getElementById('contenidoConstancia')?.innerHTML;
    if (!contenido) {
        console.error("No hay contenido para imprimir");
        return;
    }
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Constancia de Trabajo</title>
                <link rel="stylesheet" href="{% static 'css/constancia_trabajo.css' %}">
                <style>
                    @media print {
                        body { padding: 20px; }
                        .encabezado-constancia h3 { margin: 5px 0; text-align: center; }
                        .firma { margin-top: 100px; text-align: right; }
                    }
                </style>
            </head>
            <body onload="window.print(); setTimeout(() => window.close(), 500);">
                ${contenido}
            </body>
        </html>
    `);
    ventana.document.close();
}

// 13. Función para cerrar el modal
function constanciaModal__cerrar() {
    const modal = document.getElementById('constanciaModal');
    if (modal) modal.style.display = "none";
}

// 14. Inicialización para diferentes escenarios
if (typeof templateLoaded !== 'undefined') {
    document.addEventListener('templateLoaded', initConstanciaTrabajo);
}

// 15. Inicialización estándar
document.addEventListener('DOMContentLoaded', initConstanciaTrabajo);

// 16. Para contenido cargado después (SPA)
if (typeof Turbolinks !== 'undefined') {
    document.addEventListener('turbolinks:load', initConstanciaTrabajo);
} else if (typeof jQuery !== 'undefined') {
    $(document).on('ready ajaxComplete', initConstanciaTrabajo);
}

// 17. Hacer funciones disponibles globalmente
window.constanciaModal__cerrar = constanciaModal__cerrar;
window.generarConstancia = generarConstancia;


/*<strong>${datos.nombre}</strong>, 
            titular de la cédula de identidad N° <strong>${datos.cedula}</strong>, labora en esta institución como 
            <strong>${datos.cargo}</strong>, desde el <strong>${datos.fechaIngreso}</strong>.*/