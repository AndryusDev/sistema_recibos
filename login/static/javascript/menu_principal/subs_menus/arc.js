document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'arc.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de arc cargado');
        // Aquí puedes añadir la lógica específica para el perfil

        // Debug usuarioId
        console.log('usuarioId:', window.usuarioId);

        // Añadir event listeners a botones "Ver ARC"
        const usuarioId = window.usuarioId || null;
        if (usuarioId) {
            const botonesVerArc = document.querySelectorAll('.ver-arc-btn');
            botonesVerArc.forEach(boton => {
                boton.addEventListener('click', () => {
                    const anio = boton.getAttribute('data-anio');
                    arcModal__abrir(parseInt(anio), usuarioId);
                });
            });
        } else {
            console.error('usuarioId no está definido en el contexto global.');
        }
    }
});

function initArcModule(passedUsuarioId) {
    console.log('Inicializando módulo ARC');

    if (passedUsuarioId) {
        window.usuarioId = passedUsuarioId;
    }

    // Debug usuarioId
    const usuarioId = window.usuarioId || null;
    console.log('usuarioId:', usuarioId);

    if (usuarioId) {
        // Añadir event listeners a botones "Ver ARC"
        const botonesVerArc = document.querySelectorAll('.ver-arc-btn');
        botonesVerArc.forEach(boton => {
            boton.addEventListener('click', () => {
                const anio = boton.getAttribute('data-anio');
                arcModal__abrir(parseInt(anio), usuarioId);
            });
        });
        cargarListaARC();
    } else {
        console.error('usuarioId no está definido en el contexto global.');
    }

    // Evento para generar nuevo ARC
    const generarNuevoArcBtn = document.getElementById('generarNuevoArc');
    if (generarNuevoArcBtn) {
        generarNuevoArcBtn.addEventListener('click', function() {
            const añoActual = new Date().getFullYear();
            generarNuevoARC(añoActual, usuarioId);
        });
    }
}

// Nueva función para establecer usuarioId y cargar lista ARC
function setUsuarioId(usuarioId) {
    if (usuarioId) {
        window.usuarioId = usuarioId;
        cargarListaARC();
    } else {
        console.error('setUsuarioId: usuarioId no proporcionado o inválido.');
    }
}

// Expose the init and setUsuarioId functions globally for dynamic loading
window.initArcModule = initArcModule;
window.setUsuarioId = setUsuarioId;

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'arc.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de arc descargado');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    cargarListaARC();

    // Evento para generar nuevo ARC
    const generarNuevoArcBtn = document.getElementById('generarNuevoArc');
    if (generarNuevoArcBtn) {
        generarNuevoArcBtn.addEventListener('click', function() {
            const añoActual = new Date().getFullYear();
            generarNuevoARC(añoActual);
        });
    }
});

function cargarListaARC() {
    if (!window.usuarioId || window.usuarioId.trim() === '') {
        console.error('Cedula (usuarioId) no proporcionada o vacía.');
        return;
    }
    fetch(`/api/arc/listar/?cedula=${window.usuarioId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Error desconocido al obtener ARC');
                });
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('listaArc');
            tbody.innerHTML = '';
            if (!data.success) {
                console.error('Error en respuesta ARC:', data.error);
                return;
            }
            if (!Array.isArray(data.arcs)) {
                console.error('Datos ARC no es un arreglo:', data.arcs);
                return;
            }
            data.arcs.forEach(arc => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${arc.anio}</td>
                    <td>${arc.fecha_emision ? new Date(arc.fecha_emision).toLocaleDateString() : ''}</td>
                        <td>${Number(arc.islr_total_retenido).toFixed(2)}</td>
                    <td>
                        <button class="btn-ver" onclick="verARC(${arc.id_arc})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('Error cargando lista ARC:', error.message);
        });
}

function generarNuevoARC(año) {
    if(confirm(`¿Generar ARC para el año ${año}?`)) {
        fetch(`/api/arc/generar_arc/?cedula=${window.usuarioId}&anio=${año}`)
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    alert('ARC generado correctamente');
                    cargarListaARC();
                } else {
                    alert('Error: ' + data.error);
                }
            });
    }
}

function verARC(arcId) {
    const modal = document.getElementById('arcModal');
    const contenido = document.getElementById('contenidoArc');

    contenido.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando ARC...</div>';
    modal.style.display = 'block';

    fetch(`/api/arc/${arcId}/datos_arc/`)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                contenido.innerHTML = generarHTMLARC(data.data);
            } else {
                contenido.innerHTML = `<div class="error">${data.error}</div>`;
            }
        });
}

function generarHTMLARC(data) {
    return `
        <div class="arc-container">
            <div class="arc-header">
                <div class="logo-izquierdo">
                    <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio" width="80">
                </div>
                <div class="textos-centro__titulo">
                    <h2>COMPROBANTE DE RETENCIÓN DE I.S.L.R.</h2>
                    <h3>Artículo 11, Parágrafo Único del Reglamento de la Ley de I.S.L.R.</h3>
                    <h4>AÑO ${data.anio}</h4>
                </div>
                <div class="logo-derecho">
                    <img src="/static/image/logo_polibanz.png" alt="Logo Policía" width="80">
                </div>
            </div>

            <div class="contenedor-tablas">
                <table class="tabla-modal-arc__agente">
                    <thead>
                        <tr><th>AGENTE DE RETENCIÓN</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>${data.agente.nombre}</td></tr>
                        <tr><td>RIF: ${data.agente.rif}</td></tr>
                        <tr><td>${data.agente.direccion}</td></tr>
                    </tbody>
                </table>
                
                <table class="tabla-modal-arc__sujeto">
                    <thead>
                        <tr><th>SUJETO DE RETENCIÓN</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>${data.usuario.nombre_completo}</td></tr>
                        <tr><td>C.I.: ${data.usuario.cedula}</td></tr>
                    </tbody>
                </table>
            </div>

            <table class="tabla-arc-detalle">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>MES</th>
                        <th>ESPECIFICACIÓN</th>
                        <th>MONTO BRUTO</th>
                        <th>% RET.</th>
                        <th>ISLR RETENIDO</th>
                        <th>MONTO NETO</th>
                        <th>MONTO A DECLARAR</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.meses.map((mes, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${mes.nombre_mes}</td>
                            <td class="eps-celda">
                                <div class="eps-superior">${mes.especificacion_superior}</div>
                                ${mes.especificacion_inferior ? `<div class="eps-inferior">${mes.especificacion_inferior}</div>` : ''}
                            </td>
                            <td>${Number(mes.monto_bruto).toFixed(2)}</td>
                            <td>${Number(mes.porcentaje_retencion).toFixed(2)}%</td>
                            <td>${Number(mes.islr_retenido).toFixed(2)}</td>
                            <td>${Number(mes.monto_bruto - mes.islr_retenido).toFixed(2)}</td>
                            <td>${Number(mes.monto_declarar).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    
                    <tr class="fila-total">
                        <td colspan="5">TOTALES</td>
                    <td>${Number(data.meses.reduce((sum, mes) => sum + Number(mes.islr_retenido), 0)).toFixed(2)}</td>
                        <td></td>
                        <td>${data.total_monto_declarar.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="resumen-conceptos">
                <h4>RESUMEN POR CONCEPTOS</h4>
                <div class="contenedor-resumen">
                    ${Object.entries(data.resumen).map(([concepto, monto]) => `
                        <div class="concepto-resumen">
                            <div class="concepto-titulo">${concepto}</div>
                        <div class="concepto-monto">${Number(monto).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="nota-final">
                <p>${data.nota}</p>
                <p class="fecha-emision">Emitido el: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

function arcModal__cerrar() {
    document.getElementById('arcModal').style.display = 'none';
}

function arcModal__imprimir() {
    const contenido = document.getElementById("contenidoArc").innerHTML;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir ARC</title>
            <style>
                /* ESTILOS GENERALES */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 5mm;
                    font-size: 10pt;
                    line-height: 1.3;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                /* CONTENEDOR PRINCIPAL */
                .arc-container {
                    width: 100%;
                    transform: scale(0.95);
                    transform-origin: top center;
                }
                
                /* ENCABEZADO */
                .arc-header {
                    text-align: center;
                    color: #003366;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                
                .textos-centro__titulo h2 {
                    text-decoration: underline;
                }
                
                /* TABLAS HORIZONTALES SUPERIORES (MÁS PEQUEÑAS) */
                .contenedor-tablas, .contenedor-tablas2 {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    width: 100%;
                    margin-bottom: 10px;
                    align-items: center; /* Centra verticalmente */
                }
                
                .tabla-modal-arc__agente,
                .tabla-modal-arc__sujeto,
                .tabla-modal-arc__agente__direccion,
                .tabla-modal-arc__sujeto__cedula {
                    width: 48% !important;
                    font-size: 8pt !important;
                    border-collapse: collapse;
                    border: 1px solid #000 !important;
                    margin: 0 auto; /* Centrado adicional para tablas */
                }
                
                .tabla-modal-arc__agente th,
                .tabla-modal-arc__sujeto th,
                .tabla-modal-arc__agente__direccion th,
                .tabla-modal-arc__sujeto__cedula th,
                .tabla-modal-arc__agente td,
                .tabla-modal-arc__sujeto td,
                .tabla-modal-arc__agente__direccion td,
                .tabla-modal-arc__sujeto__cedula td {
                    padding: 4px 6px !important;
                    border: 1px solid #000 !important;
                    text-align: center !important; /* Añade esta línea */
                }
                
                .tabla-modal-arc__agente th,
                .tabla-modal-arc__sujeto th,
                .tabla-modal-arc__agente__direccion th,
                .tabla-modal-arc__sujeto__cedula th {
                    background-color: #f2f2f2 !important;
                    font-weight: bold !important;
                }
                .sub_titulo {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                /* TABLA PRINCIPAL CON CELDAS ANIDADAS */
                .tabla-arc-detalle {
                    width: 100%;
                    font-size: 8pt;
                    border-collapse: collapse;
                    margin: 5px 0 15px 0;
                    table-layout: fixed;
                    text-align: center !important;
                }
                
                .tabla-arc-detalle th, 
                .tabla-arc-detalle td {
                    padding: 3px;
                    border: 1px solid #000;
                    text-align: center !important;
                }
                
                .tabla-arc-detalle th,
                .tabla-arc-resumen th {
                    background-color: #003366;
                    color: white;
                    text-align: center !important;
                }
                
                /* ESTILOS PARA CELDAS ANIDADAS (MANTIENE TAMAÑO Y BORDES) */
                .porcentaje-celda, 
                .eps-celda, 
                .montobruto-celda,
                .montoneto-celda {
                    padding: 0 !important;
                    min-width: 80px !important;
                    height: 100%;
                    position: relative;
                }
                
                .porcentaje-tabla, 
                .eps-tabla, 
                .montobruto-tabla,
                .montoneto-tabla {
                    width: 100% !important;
                    height: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 8pt !important;
                    table-layout: fixed; /* Añadido para consistencia */
                }
                
                .porcentaje-superior, 
                .porcentaje-inferior, 
                .eps-superior, 
                .eps-inferior, 
                .montobruto-superior, 
                .montobruto-inferior,
                .montoneto-superior,
                .montoneto-inferior {
                    padding: 4px !important;
                    border: none !important;
                    height: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .porcentaje-superior, 
                .eps-superior, 
                .montobruto-superior,
                .montoneto-superior {
                    border-bottom: 1px solid #000 !important;
                }

                .montobruto-inferior:empty::after {
                content: "\\00a0"; /* Espacio invisible cuando está vacío */
                display: inline-block;
                width: 100%;
            }
                
                /* TABLAS RESUMEN (VACACIONES, SALARIOS, ETC) - CORRECCIONES */
                .tabla-arc-resumen {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    width: 100%;
                }
                
                .tabla-arc-resumen table {
                    width: 23% !important;
                    border-collapse: collapse;
                    border: 1px solid #000 !important;
                    font-size: 8pt;
                }
                
                .tabla-arc-resumen th,
                .tabla-arc-resumen td {
                    border: 1px solid #000 !important;
                    padding: 5px !important;
                    text-align: center;
                }
                
                
                /* AJUSTES PARA IMPRESIÓN */
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    
                    body {
                        padding: 0;
                        font-size: 9pt;
                    }
                    
                    .arc-container {
                        transform: none;
                        width: 100%;
                    }
                    
                    .contenedor-tablas, .contenedor-tablas2 {
                        gap: 10px;
                    }
                    
                    .tabla-modal-arc__agente,
                    .tabla-modal-arc__sujeto,
                    .tabla-modal-arc__agente__direccion,
                    .tabla-modal-arc__sujeto__cedula {
                        font-size: 7pt !important;
                    }
                    
                    .tabla-arc-detalle {
                        font-size: 7pt;
                    }
                    
                    .porcentaje-tabla, 
                    .eps-tabla, 
                    .montobruto-tabla,
                    .montoneto-tabla {
                        font-size: 7pt !important;
                    }
                    
                    table {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="arc-container">
                ${contenido}
            </div>
            <script>
                setTimeout(function() {
                    window.print();
                    window.close();
                }, 400);
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}
