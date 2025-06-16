document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'arc.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de arc cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'arc.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de arc descargado');
    }
});

function arcModal__abrir(anio, usuarioId) {
    const modal = document.getElementById("arcModal");
    const contenido = document.getElementById("contenidoArc");
    
    // Mostrar carga mientras se obtienen los datos
    contenido.innerHTML = '<div class="loading">Cargando ARC...</div>';
    
    // Obtener datos del ARC desde la API
    fetch(`/api/arc/generar_arc/?cedula=${usuarioId}&anio=${anio}`)
        .then(async response => {
            if (!response.ok) {
                const text = await response.text();
                console.error('Error en generar_arc:', response.status, text);
                throw new Error(`Error en generar_arc: ${response.status} ${text}`);
            }
            return response.json();
        })
        .then(arcData => {
            console.log('Datos recibidos de generar_arc:', arcData); // Debug log added
            // Obtener datos formateados para el frontend
            return fetch(`/api/arc/${arcData.id}/datos_arc/`);
        })
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos para ARC:', data); // Debug log added
            // Generar el HTML con los datos recibidos
            contenido.innerHTML = generarHTMLARC(data);
            modal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error al generar ARC:', error);
            contenido.innerHTML = '<div class="error">Error al generar el ARC</div>';
        });
}

function generarHTMLARC(data) {
    return `
        <div class="arc-container">
            <!-- Encabezado con logos -->
            <div class="arc-header">
                <div class="logo-izquierdo">
                    <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio" width="80">
                </div>
                <div class="textos-centro__titulo">
                    <h2><strong>${data.agente.nombre}</strong></h2>
                </div>
                <div class="logo-derecho">
                    <img src="/static/image/logo_polibanz.png" alt="Logo Policía" width="80">
                </div>
            </div>

            <div class="sub">
                <h3 class="sub_titulo">ARC - AÑO ${data.anio}</h3>
            </div>
            
            <!-- Tablas de agente y sujeto -->
            <div class="contenedor-tablas">
                <table class="tabla-modal-arc__agente">
                    <thead>
                        <tr>
                            <th>NOMBRE O RAZÓN SOCIAL DEL AGENTE DE RETENCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${data.agente.nombre}</td>
                        </tr>
                    </tbody>
                </table>
                <table class="tabla-modal-arc__sujeto">
                    <thead>
                        <tr>
                            <th>NOMBRE O RAZÓN SOCIAL DEL SUJETO RETENCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${data.usuario.nombre_completo}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Más tablas... -->
            
            <!-- Tabla detalle por meses -->
            <table class="tabla-arc-detalle">
                <thead>
                    <tr>
                        <th>OPER. NRO.</th>
                        <th>Mes</th>
                        <th>Esp</th>
                        <th>Monto Bruto</th>
                        <th>%</th>
                        <th>ISLR Retenido</th>
                        <th>Monto Neto</th>
                        <th>Monto a Declarar</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.meses.map((mes, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${mes.nombre_mes}</td>
                            <td class="eps-celda">
                                <table class="eps-tabla">
                                    <tr><td class="eps-superior">${mes.especificacion_superior}</td></tr>
                                    <tr><td class="eps-inferior">${mes.especificacion_inferior}</td></tr>
                                </table>
                            </td>
                            <td class="montobruto-celda">
                                <table class="montobruto-tabla">
                                    <tr><td class="montobruto-superior">${mes.monto_bruto.toFixed(2)}</td></tr>
                                    <tr><td class="montobruto-inferior"></td></tr>
                                </table>
                            </td>
                            <td class="porcentaje-celda">
                                <table class="porcentaje-tabla">
                                    <tr><td class="porcentaje-superior">${mes.porcentaje_retencion.toFixed(2)}</td></tr>
                                    <tr><td class="porcentaje-inferior">%</td></tr>
                                </table>
                            </td>
                            <td class="porcentaje-celda">
                                <table class="porcentaje-tabla">
                                    <tr><td class="porcentaje-superior">${mes.islr_retenido.toFixed(2)}</td></tr>
                                    <tr><td class="porcentaje-inferior">%</td></tr>
                                </table>
                            </td>
                            <td class="montoneto-celda">
                                <table class="montoneto-tabla">
                                    <tr><td class="montoneto-superior"></td></tr>
                                    <tr><td class="montoneto-inferior"></td></tr>
                                </table>
                            </td>
                            <td>${mes.monto_declarar.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    
                    <tr class="fila-total">
                        <td colspan="7" class="total-texto">Total monto a declarar Bs.:</td>
                        <td class="total-monto">${data.total_monto_declarar.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Resumen de conceptos -->
            <div class="tabla-arc-resumen">
                ${Object.entries(data.resumen).map(([concepto, monto]) => `
                    <table class="tabla-arc-resumen__${concepto.toLowerCase()}">
                        <tr>
                            <th><strong>${concepto.toUpperCase()}</strong></th>
                        </tr>
                        <tr>
                            <td>${monto.toFixed(2)}</td>
                        </tr>
                    </table>
                `).join('')}
            </div>
            
            <p class="nota-final">${data.nota}</p>
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
