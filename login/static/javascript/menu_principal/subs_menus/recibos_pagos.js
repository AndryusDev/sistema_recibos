console.log("recibos_pagos.js cargado correctamente");

console.log("recibos_pagos.js cargado correctamente");

// Definimos primero la función global para asegurar su disponibilidad
window.abrirRecibo = function(boton) {
    // Verificamos si el manager está disponible
    if (!window.reciboManager) {
        console.error("Error: ReciboManager no está inicializado");
        return;
    }
    // Llamamos al método del manager
    window.reciboManager.abrirModal(boton);
};

class ReciboManager {
    constructor() {
        console.log("Inicializando ReciboManager");
        this.initModalCloseListener();
    }

    initModalCloseListener() {
        const modal = document.getElementById('reciboModal');
        if (!modal) {
            console.error("No se encontró el modal con ID 'reciboModal'");
            return;
        }

        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('recibo-modal') || 
                e.target.classList.contains('recibo-modal__cerrar')) {
                this.cerrarModal();
            }
        });
    }

    async abrirModal(boton) {
        if (!boton || !boton.dataset) {
            console.error("Botón inválido recibido");
            return;
        }

        const reciboId = boton.dataset.reciboId;
        if (!reciboId) {
            console.error("No se encontró data-recibo-id en el botón");
            return;
        }

        console.log(`Solicitando datos para recibo ID: ${reciboId}`);

        try {
            // Mostrar loader
            const contenido = document.getElementById('contenidoRecibo');
            if (!contenido) {
                throw new Error("No se encontró el contenedor del recibo");
            }

            contenido.innerHTML = `
                <div class="recibo-loader">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando recibo...</p>
                </div>
            `;
            
            const modal = document.getElementById('reciboModal');
            if (modal) {
                modal.style.display = 'flex';
            }

            const response = await fetch(`/api/recibos/${reciboId}/`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }

            const data = await response.json();
            this.renderizarRecibo(data);
            
        } catch (error) {
            console.error('Error al cargar el recibo:', error);
            this.mostrarError('Error al cargar el recibo. Por favor intente nuevamente.');
        }
    }

    renderizarRecibo(data) {
        const contenido = document.getElementById('contenidoRecibo');
        
        // Plantilla de encabezado
        let html = `
        <div class="contenedor-encabezados">
            <div class="logo-izquierdo">
                <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio">
            </div>
            <div class="textos-centro">
                <h3 class="Encabezado_recibo">República Bolivariana de Venezuela</h3>
                <h3 class="Encabezado_recibo">Ministerio del Poder Popular Para las Relaciones Interiores, Justicia y Paz</h3>
                <h3 class="Encabezado_recibo">Viceministerio del Sistema Integrado de Policía</h3>
                <h3 class="Encabezado_recibo">Policía Estadal Bolivariana de Anzoátegui</h3>
                <h3 class="Encabezado_recibo">DIRECCIÓN DE RECURSOS HUMANOS</h3>
            </div>
            <div class="logo-derecho">
                <img src="/static/image/logo_polibanz.png" alt="Logo Policía">
            </div>
        </div>
        <table class="recibo-modal__tablaencabezado">
            <tr>
                <th class="titulo" colspan="2">RECIBO DE PAGO</th>
                <th>SUELDO BASE:</th>
                <td>${this.formatearMoneda(data.encabezado.sueldo_base)}</td>
            </tr>
            <tr>
                <th>FECHA DE INGRESO</th>
                <th>APELLIDOS Y NOMBRES:</th>
                <th>CEDULA:</th>
                <th>NRO DE CUENTA</th>
            </tr>
            <tr>
                <td>${data.encabezado.fecha_ingreso}</td>
                <td>${data.encabezado.nombre_completo.toUpperCase()}</td>
                <td>${data.encabezado.cedula}</td>
                <td>${data.encabezado.numero_cuenta}</td>
            </tr>
            <tr>
                <th>CARGO</th>
                <td>${data.encabezado.cargo.toUpperCase()}</td>
                <td colspan="2" class="centrado">PERIODO ${data.encabezado.periodo}</td>
            </tr>
        </table>`;

        // Tabla de conceptos
        html += `<table class="recibo-modal__tabla">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Asignación</th>
                    <th>Deducción</th>
                </tr>
            </thead>
            <tbody>`;

        data.conceptos.forEach(concepto => {
            html += `
                <tr>
                    <td>${concepto.codigo}</td>
                    <td>${concepto.descripcion}</td>
                    <td>${concepto.asignacion ? this.formatearMoneda(concepto.asignacion) : '-'}</td>
                    <td>${concepto.deduccion ? this.formatearMoneda(concepto.deduccion) : '-'}</td>
                </tr>`;
        });

        // Totales
        html += `</tbody></table>
        <table class="recibo-modal__tablatotales">
            <tr>
                <td></td>
                <th>TOTALES</th>
                <td>${this.formatearMoneda(data.totales.total_asignaciones)}</td>
                <td>${this.formatearMoneda(data.totales.total_deducciones)}</td>
            </tr>
            <tr>
                <td></td>
                <th>TOTAL NÓMINA:</th>
                <td>${this.formatearMoneda(data.totales.total_nomina)}</td>
                <td></td>
            </tr>
        </table>
        <div class="recibo-footer">
            <p>Dir. Recursos Humanos</p>
            <p>Dirección: Av. Intercomunal Jorge Rodríguez. Crucero de Lechería. RIF G-200001091-6</p>
            <p>Tlf. 0281 - 2863550 ext. 112</p>
        </div>`;

        contenido.innerHTML = html;
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-VE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    mostrarError(mensaje) {
        document.getElementById('contenidoRecibo').innerHTML = `
            <div class="recibo-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }

    cerrarModal() {
        document.getElementById('reciboModal').style.display = 'none';
    }

    static imprimirRecibo() {
        const contenido = document.getElementById('contenidoRecibo').cloneNode(true);
        
        // Eliminar botones u otros elementos no deseados para impresión
        contenido.querySelectorAll('.no-imprimir').forEach(el => el.remove());
        
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Recibo de Pago</title>
                    <link rel="stylesheet" href="/static/css/recibos_pagos.css">
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            @page { size: auto; margin: 5mm; }
                        }
                        .no-imprimir { display: none !important; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${contenido.innerHTML}
                </body>
            </html>
        `);
        ventana.document.close();
    }
}

// Función global para el onclick
window.abrirRecibo = function(boton) {
    if (!window.reciboManager) {
        console.error("ReciboManager no está inicializado");
        return;
    }
    window.reciboManager.abrirModal(boton);
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.reciboManager = new ReciboManager();
});