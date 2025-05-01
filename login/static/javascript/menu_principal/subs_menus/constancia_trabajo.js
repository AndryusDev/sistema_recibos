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

    const datos = {
        nombre: "ANDRYUS JOSÉ GUAIQUIRIMA CERMEÑO",
        cedula: "V-30.480.815",
        cargo: "ASISTENTE ADMINISTRATIVO I",
        fechaIngreso: "07/08/2023",
        salario: "142,88",
        bono: "2.120,00",
        fechaActual: new Date()
    };

    const dia = datos.fechaActual.getDate();
    const mes = datos.fechaActual.toLocaleString('es-ES', { month: 'long' });
    const año = datos.fechaActual.getFullYear();

    contenido.innerHTML = `
<div class="constancia-trabajo">
    <!-- Encabezado con logos -->
    <div class="encabezado-constancia">
        <div class="logo-izquierdo">
            <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio" width="80">
        </div>
        
        <div class="textos-centro">
            <h2><strong>POLICÍA BOLIVARIANA DEL ESTADO ANZOÁTEGUI</strong></h2>
            <h4>Centro de Coordinación Policial G/D José Antonio Anzoátegui</h4>
            <h4><strong>DESPACHO DE DIRECCIÓN GENERAL</strong></h4>
            <h4><strong>DIRECCIÓN DE TALENTO HUMANO</strong></h4>
        </div>
        
        <div class="logo-derecho">
            <img src="/static/image/logo_polibanz.png" alt="Logo Policía" width="80">
        </div>
    </div>

    <!-- Título principal -->
    <h3 class="sub_titulo">CONSTANCIA DE TRABAJO</h3>
    
    <!-- Texto introductorio -->
    <div class="primer_texto">
        <p>Quien suscribe, Director(a) de Recursos Humanos de la Policía Estadal Bolivariana de Anzoátegui, hace constar que los datos que se suministran a continuación, corresponden a un funcionario que labora en esta Institución:</p>
    </div>
    
    <!-- Tabla de datos del funcionario -->
    <table class="tabla-datos">
        <tr>
            <td><strong>APELLIDOS Y NOMBRES:</strong></td>
            <td>${datos.nombre}</td>
        </tr>
        <tr>
            <td><strong>CÉDULA DE IDENTIDAD:</strong></td>
            <td>${datos.cedula}</td>
        </tr>
        <tr>
            <td><strong>FECHA DE INGRESO:</strong></td>
            <td>${datos.fechaIngreso}</td>
        </tr>
        <tr>
            <td><strong>RANGO:</strong></td>
            <td>${datos.cargo}</td>
        </tr>
        <tr>
            <td><strong>SALARIO BASE MENSUAL:</strong></td>
            <td>${datos.salario}</td>
        </tr>
        <tr>
            <td><strong>BONO DE ALIMENTACIÓN:</strong></td>
            <td>${datos.bono}</td>
        </tr>
    </table>
    
    <!-- Texto final -->
    <p class="texto-final">Constancia que se expide a petición de la parte interesada en Lechería, el día <strong>${dia}</strong> de <strong>${mes}</strong> de <strong>${año}</strong>.</p>
    
    <!-- Zona de firma -->
    <div class="Zona_firma">
    <div class="linea-firma"></div>
    <p class="nombre_delegado"><strong>Ing. Andryus Guaiquirima</strong></p>
    <p class="cargo">DIRECTOR DE RECURSOS HUMANOS</p>
    <p class="resolucion">Según Resolución Nro. 06-016-12-2022 de Fecha: 16 de Enero del 2023</p>
</div>
    
    <!-- Datos de contacto -->
    <div class="contacto">
        <p>PC/RG/AR</p>
        <p>Dir.Pers</p>
        <p>Dirección: Av. Intercomunal Jorge Rodríguez, Sector Crucero de Lechería. RIF G-20001091-6</p>
        <p>Teléfonos: (0424) 860.72.80 - (0281) 286.35.50 – Ext.112</p>
        <p class=""><strong>NOTA: VÁLIDA POR TRES (3) MESES. REQUIERE FIRMA Y SELLO HÚMEDO</strong></p>
    </div>
    
    <!-- Logos institucionales al pie -->
    <div class="logos-footer">
        <img src="/static/image/pie_documento.png">
    </div>
</div>
    `;

    modal.style.display = "flex";

    const botonesAcciones = document.querySelector('.botones-acciones');
    if (botonesAcciones) {
        botonesAcciones.style.display = "flex";
    }
}


// 12. Función para imprimir
function imprimirConstancia() {
    const contenido = document.getElementById('contenidoConstancia')?.innerHTML;
    if (!contenido) return;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Constancia de Trabajo</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* ESTILOS PRINCIPALES */
                .constancia-trabajo {
                    font-family: Georgia, serif;
                    background-color: #fff;
                    color: #000;
                    padding: 30px;
                    border: 1px solid #000;
                    max-width: 800px;
                    margin: 30px auto;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.15);
                    line-height: 1.6;
                }

                .encabezado-constancia {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 0;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                    break-inside: avoid;

                }

                .logo-derecho img, .logo-izquierdo img {
                    max-width: 100%;
                    height: auto;
                    object-fit: contain;
                }

                .logo-izquierdo, 
                .logo-derecho {
                    width: 80px;
                }
                .textos-centro {
                    flex: 1;
                    text-align: center;
                }
                
                .textos-centro h2 {
                    font-size: 12px;
                    margin-bottom: 5px;
                    text-decoration: underline;
                }
                
                .textos-centro h4 {
                    font-size: 12px;
                    margin: 5px 0;
                }
                
                .tabla-datos {
                    width: 100%;
                    margin: 20px 0;
                    border-collapse: collapse;
                }
                
                .tabla-datos td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #ddd;
                }
                
                .Zona_firma {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 50px;
                    width: 100%;
                    line-height: 1;
                }
                
                .linea-firma {
                    border-top: 1px solid #000;
                    width: 200px;
                    margin: 0 auto 15px;
                }
                
                .contacto {
                    text-align: left;
                    font-size: 10px;
                    margin-top: 10px;
                    line-height: 1.4;
                }
                .sub_titulo {
                    text-align: center !important;
                    text-decoration: underline !important;
                    margin: 20px 0 !important;
                }
                
                /* ESTILOS DE IMPRESIÓN */
                @media print {
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .encabezado-constancia {
                        display: flex;
                        align-items: center;
                        text-align: center !important;
                        justify-content: space-between;
                        flex-wrap: nowrap;
                        max-width: 100%;
                        padding: 1rem 20px; /* <-- Este padding evita que los logos choquen con los bordes */
                    }
                    
                    .constancia-trabajo {
                        margin: 0 !important;
                        padding: 20px !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;

                    }
                    .logo-izquierdo,
                    .logo-derecho {
                        width: 100px; /* mismo cambio aquí */
                        max-width: 120px;
                    }

                    .logo-izquierdo img,
                    .logo-derecho img {
                        width: 100%;
                        height: auto;
                        object-fit: contain;
                        display: block;
                    }
                    .encabezado-constancia {
                        flex-wrap: nowrap;
                    }

                    .textos-centro {
                        padding: 0 5px;
                    }
                    
                    .logos-footer img {
                        height: auto !important;
                        max-height: 50px;
                        width: 95%;
                        margin-top: 10px !important;
                    }
                    .Zona_firma {
                        line-height: 1 !important;
                        margin: 40px auto 20px !important;
                    }
                    
                    .Zona_firma p {
                        line-height: 1.2 !important;
                        margin: 2px 0 !important;
                        padding: 0 !important;
                    }
                    
                    .linea-firma {
                        margin-bottom: 15px !important;
                    }
                    
                    .texto-final {
                        margin: 30px 0 70px !important;
                    }
                        
                    
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                }
            </style>
        </head>
        <body>
            ${contenido}
            <script>
                setTimeout(() => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }, 300);
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}


// 13. Función para cerrar el modal
function constanciaModal__cerrar() {
    const modal = document.getElementById('constanciaModal');
    const botonesAcciones = document.querySelector('.botones-acciones');
    
    if (modal) modal.style.display = "none";
    if (botonesAcciones) botonesAcciones.style.display = "none";
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