document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'recibo_pago.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de recibo_pago cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'recibo_pago.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de recibo_pago descargado');
    }
});

function reciboModal__abrir(nombre) {
    const modal = document.getElementById('reciboModal');
    const contenido = document.getElementById('contenidoRecibo');
    contenido.innerHTML = `
    <div class="contenedor-encabezados">
        <div class="logo-izquierdo">
            <img src="/static/image/MinRIntPaz.png" alt="Logo izquierdo">
        </div>
        <div class="textos-centro">
            <h3 class="Encabezado_recibo">República Bolicariana de Venezuela</h3>
            <h3 class="Encabezado_recibo">Ministerio del Poder Popular para la Educación</h3>
            <h3 class="Encabezado_recibo">Viceministerio del Sistema Integrado de Policía</h3>
            <h3 class="Encabezado_recibo">Policía Estadal Bolivariana de Anzoátegui</h3>
            <h3 class="Encabezado_recibo">DIRECCIÓN DE RECURSOS HUMANOS</h3>
        </div>
        <div class="logo-derecho">
            <img src="/static/image/logo_polibanz.png" alt="Logo izquierdo">
        </div>
    </div>
    <table class="recibo-modal__tablaencabezado">
        <tr>
            <th class="titulo" colspan="2">RECIBO DE PAGO</td>
            <th>SUELDO BASE:</th>
            <td></td>
        </tr>
        <tr>
            <th>FCHA DE INGRESO</th>
            <th>APELLIDOS Y NOMBRES:</th>
            <th>CEDULA:</th>
            <th>NRO DE CUENTA</th>
        </tr>
        <tr>
            <td>15-mar-21</td>
            <td>DIANA ESTEFANIA DE LOS ANGELES GARCIA SIRAN</td>
            <td>30.534.904</td>
            <td>0102-0402-0200-0044-2338</td>
        </tr>
        <tr>
            <th>CARGO</th>
            <td>ASISTENTE ADMINISTRATIVO I</td>
            <td colspan="2" class="centrado">PERIODO 16/MAR/2025 AL 30/MAR/2025</td>
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
                <tr>
                    <td>1001</td>
                    <td>Sueldo al personal empleado</td>
                    <td>67,50</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>1103</td>
                    <td>PRM por antigüedad</td>
                    <td>2,87</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>1301</td>
                    <td>Compensación por años de servicio</td>
                    <td>3,56</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>1101</td>
                    <td>PRM por hijo</td>
                    <td>6,25</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>20001</td>
                    <td>Deducción del IVSS</td>
                    <td>-</td>
                    <td>3,00</td>
                </tr>
                <tr>
                    <td>20003</td>
                    <td>Deducción del FAOV</td>
                    <td>-</td>
                    <td>0,84</td>
                </tr>
                <tr>
                    <td>20004</td>
                    <td>Deducción del FPJ</td>
                    <td>-</td>
                    <td>2,53</td>
                </tr>
                <tr>
                    <td>20002</td>
                    <td>Deducción del Fondo Contributivo RPE</td>
                    <td>-</td>
                    <td>0,38</td>
                </tr>
                <tr>
                    <td>1401</td>
                    <td>Bono Vacacional</td>
                    <td>1.325,39</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>8003</td>
                    <td>Cestaticket para alimentación</td>
                    <td>2.579,00</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>1105</td>
                    <td>PRM por mérito (evaluación)</td>
                    <td>4,22</td>
                    <td>-</td>
                </tr>
            </tbody>
    </table>
    <table class="recibo-modal__tablatotales">
        <tr>
            <td></td>
            <th>TOTALES</th>
            <td>3.988,79:</td>
            <td>6.75</td>
        </tr>
        </tr>
        <tr>
            <td></td>
            <th>TOTALES NOMINA:</th>
            <td>3982.04</td>
            <td></td>
        </tr>
    </table>
    <p>Dir. Recursos Humanos</p>
    <p>Dirección: Av. Intercomunal Jorge Rodríguez. Crucero de Lechería. RIF G-200001091-6</p>
    <p>Tlf. 0281 - 2863550 ext. 112</p>
`;
modal.style.display = 'flex';
}

function reciboModal__cerrar() {
document.getElementById('reciboModal').style.display = 'none';
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
                            font-size: 0.8rem; /* Reducir tamaño de fuente al imprimir */
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