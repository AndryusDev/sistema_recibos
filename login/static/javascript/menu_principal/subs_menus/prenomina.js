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
function mostrarRecibo(button) {
    const prenominaId = button.getAttribute('data-prenomina-id');
    console.log('Mostrar detalles para prenomina ID:', prenominaId);
    preNominaModal__abrir();
    // Asegurar que el modal se muestre correctamente
    const modal = document.getElementById('preNominaModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('Modal no encontrado al intentar mostrar');
    }
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