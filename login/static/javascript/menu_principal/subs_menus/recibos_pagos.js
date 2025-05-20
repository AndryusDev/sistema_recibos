document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'recibos_pagos.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de recibo_pago cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'recibos_pagos.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de recibo_pago descargado');
    }
});

// Función para cargar el recibo via AJAX
async function cargarRecibo(reciboId) {
    try {
        const response = await fetch(`/recibos/${reciboId}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 403) {
            throw new Error('No tienes permiso para ver este recibo');
        }
        
        const data = await response.json();
        mostrarReciboEnModal(data);
    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}
// Función para mostrar los datos en el modal
function mostrarReciboEnModal(data) {
    const modal = document.getElementById('reciboModal');
    const contenido = document.getElementById('contenidoRecibo');
    
    // Calcular totales
    const totalAsignaciones = data.conceptos
        .filter(c => c.tipo === 'ASIGNACION')
        .reduce((sum, c) => sum + c.monto, 0);
    
    const totalDeducciones = data.conceptos
        .filter(c => c.tipo === 'DEDUCCION')
        .reduce((sum, c) => sum + c.monto, 0);
    
    const totalNomina = totalAsignaciones - totalDeducciones;
    
    // Generar filas de conceptos
    const filasConceptos = data.conceptos.map(concepto => `
        <tr>
            <td>${concepto.codigo}</td>
            <td>${concepto.descripcion}</td>
            <td>${concepto.tipo === 'ASIGNACION' ? concepto.monto.toFixed(2) : '-'}</td>
            <td>${concepto.tipo === 'DEDUCCION' ? concepto.monto.toFixed(2) : '-'}</td>
        </tr>
    `).join('');
    
    contenido.innerHTML = `
    <div class="contenedor-encabezados">
        <!-- Tus logos y encabezados aquí -->
    </div>
    <table class="recibo-modal__tablaencabezado">
        <tr>
            <th class="titulo" colspan="2">RECIBO DE PAGO</td>
            <th>SUELDO BASE:</th>
            <td>${data.empleado.sueldo_base || 'N/A'}</td>
        </tr>
        <tr>
            <th>FECHA DE INGRESO</th>
            <th>APELLIDOS Y NOMBRES:</th>
            <th>CEDULA:</th>
            <th>NRO DE CUENTA</th>
        </tr>
        <tr>
            <td>${data.empleado.fecha_ingreso}</td>
            <td>${data.empleado.nombre_completo}</td>
            <td>${data.empleado.cedula}</td>
            <td>${data.empleado.cuenta_bancaria}</td>
        </tr>
        <tr>
            <th>CARGO</th>
            <td>${data.empleado.cargo}</td>
            <td colspan="2" class="centrado">PERIODO ${data.nomina.periodo}</td>
        </tr>
    </table>
    <table class="recibo-modal__tabla">
        <thead>
            <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Asignación</th>
                <th>Deducción</th>
            </tr>
        </thead>
        <tbody>
            ${filasConceptos}
        </tbody>
    </table>
    <table class="recibo-modal__tablatotales">
        <tr>
            <td></td>
            <th>TOTALES</th>
            <td>${totalAsignaciones.toFixed(2)}</td>
            <td>${totalDeducciones.toFixed(2)}</td>
        </tr>
        <tr>
            <td></td>
            <th>TOTAL NÓMINA:</th>
            <td>${totalNomina.toFixed(2)}</td>
            <td></td>
        </tr>
    </table>
    <!-- Pie de página aquí -->
    `;
    
    modal.style.display = 'flex';
}

// Modifica la función reciboModal__cerrar para limpiar el contenido
function reciboModal__cerrar() {
    document.getElementById('reciboModal').style.display = 'none';
    document.getElementById('contenidoRecibo').innerHTML = '';
}

function buscarPorFecha() {
    var input = document.getElementById('buscarFecha');
    var filtro = input.value.toLowerCase();
    var filas = document.querySelectorAll('.tabla-recibos__tbody .tabla-recibos__fila');

    filas.forEach(function(fila) {
        var fecha = fila.cells[0].textContent.toLowerCase();
        if (fecha.includes(filtro)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

function ImprimirRecibo() {
    const contenido = document.getElementById('contenidoRecibo').innerHTML;

    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
            <head>
                <title>Imprimir Recibo</title>
                <link rel="stylesheet" href="/static/css/recibo_pago.css"> <!-- Asegúrate de que este archivo tenga @media print -->
                <style>
                    /* Puedes agregar aquí reglas específicas para la impresión si es necesario */
                    @media print {
                        /* Ejemplo adicional si deseas ajustes en la impresión dentro del bloque */
                        body {
                            font-size: 0.7rem; /* Reducir tamaño de fuente al imprimir */
                        }
                    }
                </style>
            </head>
            <body>
                ${contenido}
            </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
}