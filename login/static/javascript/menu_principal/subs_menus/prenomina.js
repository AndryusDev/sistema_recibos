/*document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'pre_nomina_pensionados.html') {
        console.log('Panel de pre-nómina pensionados cargado');
        inicializarPreNomina();
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'pre_nomina_pensionados.html') {
        console.log('Panel de pre-nómina pensionados descargado');
        limpiarEventListeners();
    }
});

function inicializarPreNomina() {
    // Configurar fechas automáticas
    const fechaActual = new Date();
    const fechaDesde = new Date();
    fechaDesde.setDate(16); // Asumiendo que siempre es desde el día 16
    
    const fechaHasta = new Date();
    fechaHasta.setDate(30); // Asumiendo que siempre es hasta el día 30
    
    document.getElementById('fechaActual').textContent = formatearFecha(fechaActual);
    document.getElementById('fechaDesde').textContent = formatearFecha(fechaDesde);
    document.getElementById('fechaHasta').textContent = formatearFecha(fechaHasta);
    
    // Agregar event listeners a los botones de ver
    document.querySelectorAll('.tabla-recibos__boton').forEach(boton => {
        boton.addEventListener('click', function() {
            const periodo = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            preNominaModal__abrir(periodo);
        });
    });
}

function limpiarEventListeners() {
    // Limpiar event listeners si es necesario
    const botones = document.querySelectorAll('.tabla-recibos__boton');
    botones.forEach(boton => {
        boton.removeEventListener('click', preNominaModal__abrir);
    });
}

function formatearFecha(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const diaSemana = dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${diaSemana} | ${dia} ${mes} ${año}`;
}*/

function preNominaModal__abrir() {
    const modal = document.getElementById('preNominaModal');
    const contenido = document.getElementById('contenidoPreNomina');
    
    if (!modal || !contenido) {
        console.error('Modal no encontrado');
        return;
    }

    // Crear fecha actual si no existen los elementos
    const fechaActual = new Date();
    const fechaDesde = new Date();
    fechaDesde.setDate(16);
    const fechaHasta = new Date();
    fechaHasta.setDate(30);

    contenido.innerHTML = `
    <div class="prenomina-encabezado">
        <div class="prenomina-logo-izquierdo">
            <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio">
        </div>
        <div class="prenomina-texto-centro">
            <h3 class="prenomina-titulo">POLICIA ESTADAL BOLIVARIANA DE ANZOATEGUI</h3>
            <h3 class="prenomina-subtitulo">RESUMEN DE DESCUENTOS NOMINA PERSONAL PENSIONADO</h3>
        </div>
        <div class="prenomina-logo-derecho">
            <img src="/static/image/logo_polibanz.png" alt="Logo Policía">
        </div>
    </div>

    <div class="prenomina-info-periodo">
        <div class="prenomina-fila-periodo">
            <span class="prenomina-etiqueta">FECHA:</span>
            <span class="prenomina-valor">${formatearFecha(fechaActual)}</span>
        </div>
        <div class="prenomina-fila-periodo">
            <span class="prenomina-etiqueta">DESDE:</span>
            <span class="prenomina-valor">${formatearFecha(fechaDesde)}</span>
        </div>
        <div class="prenomina-fila-periodo">
            <span class="prenomina-etiqueta">HASTA:</span>
            <span class="prenomina-valor">${formatearFecha(fechaHasta)}</span>
        </div>
    </div>

    <div class="prenomina-tipo-nomina">
        <h4>PRE-NOMINA // PERSONAL PENSIONADO POR SOBREVIVENCIA (VIUDEZ Y/U ORFANDAD)</h4>
    </div>

    <table class="prenomina-tabla__modal">
        <thead>
            <tr>
                <th>CODIGO</th>
                <th>DESCRIPCION</th>
                <th>ASIGNACION</th>
                <th>DEDUCCION</th>
                <th>NRO.PERS.</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1009</td>
                <td>PENSION POR VIUDEZ U ORFANDAD</td>
                <td>2.187,19</td>
                <td>-</td>
                <td>8</td>
            </tr>
            <tr>
                <td>8002</td>
                <td>BONO DE ALIMENTACION</td>
                <td>20.632,00</td>
                <td>-</td>
                <td>8</td>
            </tr>
            <tr class="prenomina-fila-total">
                <td></td>
                <th>TOTALES</th>
                <td>22.819,19</td>
                <td>0,00</td>
                <td></td>
            </tr>
            <tr class="prenomina-fila-total">
                <td></td>
                <th>TOTALES NOMINA</th>
                <td>22.819,19</td>
                <td>0,00</td>
                <td></td>
            </tr>
        </tbody>
    </table>
    <table class="prenomina-tabla__modaltotales">
        <tbody>
            <tr class="prenomina-fila-total">
                <td></td>
                <th>TOTALES</th>
                <td>22.819,19</td>
                <td>0,00</td>
                <td></td>
            </tr>
            <tr class="prenomina-fila-total">
                <td></td>
                <th>TOTALES NOMINA</th>
                <td>22.819,19</td>
                <td>0,00</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="prenomina-total">
        <h4>TOTAL NOMINA: 22.819,19</h4>
    </div>
    `;


    modal.style.display = 'flex';
}

function formatearFecha(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dias[fecha.getDay()]} | ${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

function preNominaModal__cerrar() {
    const modal = document.getElementById('preNominaModal');
    if (modal) modal.style.display = 'none';
}

function imprimirPreNomina() {
    // Obtener el contenido del modal
    const contenidoOriginal = document.getElementById('contenidoPreNomina').innerHTML;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    // Estructura HTML para impresión
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pre-Nómina Pensionados</title>
            <style>
                /* ESTILOS BASE - COPIADOS DEL CSS ORIGINAL */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                
                .prenomina-modal__contenido {
                    background-color: white;
                    width: 90%;
                    max-width: 900px;
                    margin: 20px auto;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    padding: 25px;
                    max-height: none !important;
                    overflow: visible !important;
                }
                
                /* ENCABEZADO */
                .prenomina-encabezado {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #006666;
                    padding-bottom: 15px;
                }
                
                .prenomina-logo-izquierdo, 
                .prenomina-logo-derecho {
                    flex: 0 0 auto;
                }
                
                .prenomina-logo-izquierdo img, 
                .prenomina-logo-derecho img {
                    max-height: 80px;
                    width: auto;
                }
                
                .prenomina-texto-centro {
                    flex: 1;
                    text-align: center;
                    padding: 0 20px;
                }
                
                .prenomina-titulo {
                    margin: 5px 0;
                    font-size: 1.1rem;
                    color: #333;
                    line-height: 1.3;
                }
                
                /* PERÍODO */
                .prenomina-info-periodo {
                    display: flex;
                    justify-content: space-around;
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    font-size: 0.95rem;
                }
                
                .prenomina-fila-periodo {
                    display: flex;
                    align-items: center;
                }
                
                .prenomina-etiqueta {
                    font-weight: bold;
                    margin-right: 8px;
                    color: #006666;
                }
                
                .prenomina-valor {
                    color: #333;
                }
                
                /* TIPO DE NÓMINA */
                .prenomina-tipo-nomina {
                    text-align: center;
                    margin: 20px 0;
                    padding: 10px;
                    background-color: #006666;
                    color: white;
                    border-radius: 5px;
                }
                
                /* TABLAS */
                .prenomina-tabla, 
                .prenomina-tabla__modal, 
                .prenomina-tabla__modaltotales {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 0.9rem;
                    table-layout: fixed;
                }
                
                .prenomina-tabla th, 
                .prenomina-tabla td,
                .prenomina-tabla__modal th,
                .prenomina-tabla__modal td,
                .prenomina-tabla__modaltotales th,
                .prenomina-tabla__modaltotales td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                }
                
                .prenomina-tabla th,
                .prenomina-tabla__modal th,
                .prenomina-tabla__modaltotales th {
                    background-color: #006666;
                    color: white;
                    font-weight: normal;
                }
                
                .prenomina-tabla tr:nth-child(even),
                .prenomina-tabla__modal tr:nth-child(even),
                .prenomina-tabla__modaltotales tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                
                /* COLORES ESPECÍFICOS DE CELDAS */
                .prenomina-tabla__modal td:nth-child(3) {
                    color: #009900 !important; /* Verde para asignaciones */
                    font-weight: bold !important;
                }
                
                .prenomina-tabla__modal td:nth-child(4) {
                    color: #cc0000 !important; /* Rojo para deducciones */
                    font-weight: bold !important;
                }
                
                /* FILA TOTAL */
                .prenomina-fila-total {
                    font-weight: bold;
                    background-color: #e6f7f7 !important;
                }
                
                /* TOTAL */
                .prenomina-total {
                    text-align: right;
                    margin-top: 20px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #003366;
                    padding: 10px;
                    border-top: 2px solid #006666;
                    table-layout: fixed;
                }
                
                /* ANCHOS DE COLUMNA */
                .prenomina-tabla__modal th:nth-child(1),
                .prenomina-tabla__modaltotales td:nth-child(1) { 
                    width: 15% !important; 
                }
                
                .prenomina-tabla__modal th:nth-child(2),
                .prenomina-tabla__modaltotales td:nth-child(2),
                .prenomina-tabla__modaltotales th:nth-child(2) { 
                    width: 35% !important; 
                }
                
                .prenomina-tabla__modal th:nth-child(3),
                .prenomina-tabla__modal th:nth-child(4),
                .prenomina-tabla__modaltotales td:nth-child(3),
                .prenomina-tabla__modaltotales td:nth-child(4) { 
                    width: 15% !important; 
                }
                
                .prenomina-tabla__modal th:nth-child(5),
                .prenomina-tabla__modaltotales td:nth-child(5) { 
                    width: 20% !important; 
                }
                
                /* ESTILOS ESPECÍFICOS PARA IMPRESIÓN */
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        color: #000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-modal__contenido {
                        width: 95% !important;
                        max-width: 95% !important;
                        margin: 0 auto !important;
                        padding: 10px !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        transform: scale(0.98);
                        transform-origin: top center;
                    }
                    
                    /* FORZAR COLORES EN IMPRESIÓN */
                    .prenomina-tabla__modal th,
                    .prenomina-tabla__modaltotales th {
                        background-color: #006666 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-tipo-nomina {
                        background-color: #006666 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-tabla tr:nth-child(even),
                    .prenomina-tabla__modal tr:nth-child(even),
                    .prenomina-tabla__modaltotales tr:nth-child(even) {
                        background-color: #f9f9f9 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-fila-total {
                        background-color: #e6f7f7 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-info-periodo {
                        background-color: #f5f5f5 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .prenomina-etiqueta {
                        color: #006666 !important;
                    }
                    .prenomina-tabla__modaltotales {
                        table-layout: fixed !important;
                    }

                    .prenomina-tabla,
                    .prenomina-tabla__modal,
                    .prenomina-tabla__modaltotales {
                        font-size: 0.75rem !important; /* Tamaño más pequeño para impresión */
                    }

                    .prenomina-tabla th, 
                    .prenomina-tabla td,
                    .prenomina-tabla__modal th,
                    .prenomina-tabla__modal td,
                    .prenomina-tabla__modaltotales th,
                    .prenomina-tabla__modaltotales td {
                        padding: 6px !important; /* Menor padding para mejor ajuste */
                        font-size: 0.7rem !important; /* Aún más pequeño si es necesario */
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0.7cm;
                    }
                    
                    .no-imprimir, 
                    .prenomina-modal__boton,
                    .prenomina-modal__acciones {
                        display: none !important;
                    }
                    
                    /* Asegurar que no se dividan filas entre páginas */
                    table {
                        page-break-inside: auto !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    
                    td {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    tfoot {
                        display: table-footer-group !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="prenomina-modal__contenido">
                ${contenidoOriginal}
            </div>
            <script>
                // Esperar a que carguen los estilos antes de imprimir
                setTimeout(() => {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }, 500);
            </script>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();

}
    
/*
function buscarPorFecha() {
    const input = document.getElementById('buscarFecha');
    const filtro = input.value.toLowerCase();
    const filas = document.querySelectorAll('.tabla-recibos__tbody .tabla-recibos__fila');

    filas.forEach(function(fila) {
        const fecha = fila.querySelector('td:nth-child(2)').textContent.toLowerCase();
        fila.style.display = fecha.includes(filtro) ? "" : "none";
    });
}

function limpiarBusqueda() {
    document.getElementById('buscarFecha').value = '';
    const filas = document.querySelectorAll('.tabla-recibos__tbody .tabla-recibos__fila');
    filas.forEach(fila => fila.style.display = '');
}

function exportarPDF() {
    // Implementación básica - deberías integrar con jsPDF o similar
    console.log("Exportando a PDF...");
    alert("Funcionalidad de exportar a PDF en desarrollo");
}

function imprimirResumen() {
    const contenido = document.getElementById('contenidoPreNomina').innerHTML;
    const ventana = window.open('', '_blank');
    
    ventana.document.write(`
        <html>
            <head>
                <title>Pre-Nómina Pensionados</title>
                <link rel="stylesheet" href="/static/css/recibo_pago.css">
                <style>
                    @media print {
                        body { font-size: 0.9rem; }
                        .panel-busqueda, .botones-accion { display: none; }
                        .resumen-pre-nomina { box-shadow: none; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="resumen-pre-nomina">${contenido}</div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 300);
                    };
                </script>
            </body>
        </html>
    `);
    ventana.document.close();
}*/