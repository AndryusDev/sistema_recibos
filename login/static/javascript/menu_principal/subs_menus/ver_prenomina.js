// ===== CONSTANTES GLOBALES =====
const API_PRENOMINAS_URL = '/listar_prenominas/';

try {
    Swal = window.Swal;
    if (!Swal) {
        console.warn('SweetAlert2 no está cargado globalmente');
        Swal = {
            fire: (options) => { return Promise.resolve({ isConfirmed: confirm(options.title) } )},
            close: () => {}
        };
    }
} catch (error) {
    console.error('Error verificando SweetAlert2:', error);
    Swal = {
        fire: (options) => { return Promise.resolve({ isConfirmed: confirm(options.title) } )},
        close: () => {}
    };
}

function mostrarNotificacion(mensaje, tipo, html = false) {
    console.log("Mostrando notificación:", {mensaje, tipo, html}); // Depuración
    
    if (typeof Swal === 'undefined' && typeof window.Swal !== 'undefined') {
        Swal = window.Swal;
    }
    
    if (typeof Swal !== 'undefined') {
        const options = {
            title: tipo === 'success' ? 'Éxito' : 'Error',
            icon: tipo,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
        };

        if (html) {
            options.html = mensaje;
        } else {
            options.text = mensaje;
        }

        return Swal.fire(options).then(result => {
            console.log("Notificación mostrada", result);
            return result;
        });
    } else {
        console.error('SweetAlert2 no está disponible');
        const div = document.createElement('div');
        div.innerHTML = `<div style="padding: 20px; background: ${tipo === 'success' ? '#d4edda' : '#f8d7da'}; 
                        color: ${tipo === 'success' ? '#155724' : '#721c24'}; border-radius: 5px;">
            <strong>${tipo === 'success' ? 'Éxito' : 'Error'}:</strong> ${mensaje}
        </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
}

// Función para formatear la fecha
function formatearFechaPreNomina(fechaStr) {
    const fecha = new Date(fechaStr);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dias[fecha.getDay()]} | ${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

// Función para mostrar el modal de pre-nómina
async function mostrarPreNominaModal(prenominaId) {
    const modal = document.getElementById('preNominaModal');
    const contenido = document.getElementById('contenidoPreNomina');

    if (!modal || !contenido) {
        console.error('Modal no encontrado');
        return;
    }

    try {
        // Construir la URL de la API
        const apiUrl = `/api/prenomina/${prenominaId}/`;

        // Realizar la llamada a la API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error al obtener detalles de la pre-nómina: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Error desconocido al obtener detalles de la pre-nómina');
        }

        const prenomina = data.prenomina;
        const detalles = data.detalles;

        // Formatear la fecha
        function formatearFecha(fechaStr) {
            const fecha = new Date(fechaStr);
            const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            return `${dias[fecha.getDay()]} | ${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
        }

        // Crear el contenido del modal
        let detallesHTML = '';
        detalles.forEach(detalle => {
            detallesHTML += `
                <tr>
                    <td>${detalle.codigo}</td>
                    <td>${detalle.descripcion}</td>
                    <td>${detalle.asignacion || '-'}</td>
                    <td>${detalle.deduccion || '-'}</td>
                    <td>${detalle.numero_personas }</td>
                </tr>
            `;
        });

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
                    <span class="prenomina-valor">${formatearFecha(prenomina.fecha_creacion)}</span>
                </div>
                <div class="prenomina-fila-periodo">
                    <span class="prenomina-etiqueta">PERIODO:</span>
                    <span class="prenomina-valor">${prenomina.periodo}</span>
                </div>
                <div class="prenomina-fila-periodo">
                    <span class="prenomina-etiqueta">TIPO:</span>
                    <span class="prenomina-valor">${prenomina.tipo}</span>
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
                    ${detallesHTML}
                    <tr class="prenomina-fila-total">
                        <td></td>
                        <th>TOTALES</th>
                        <td>${prenomina.total}</td>
                        <td>0,00</td>
                        <td></td>
                    </tr>
                    <tr class="prenomina-fila-total">
                        <td></td>
                        <th>TOTALES NOMINA</th>
                        <td>${prenomina.total}</td>
                        <td>0,00</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <div class="prenomina-total">
                <h4>TOTAL NOMINA: ${prenomina.total}</h4>
            </div>
        `;

        modal.style.display = 'flex';

    } catch (error) {
        console.error('Error al mostrar el modal de pre-nómina:', error);
        mostrarNotificacion('Error al mostrar el modal de pre-nómina: ' + error.message, 'error');
    }
}

// Función para cerrar el modal de pre-nómina
function cerrarPreNominaModal() {
    const modal = document.getElementById('preNominaModal');
    if (modal) modal.style.display = 'none';
}

// ===== FUNCION DE INICIALIZACION MEJORADA =====
function initializeVerPrenomina() {
    // Verificar primero si estamos en la página correcta
    if (!document.getElementById('prenomina-table')) {
        console.log('No está en página de ver prenomina');
        return;
    }

    console.log('Inicializando módulo de ver prenomina...');

    // 1. Configurar eventos de filtrado con verificación de existencia
    const setupFiltros = () => {
        const elementosRequeridos = [
            'tipo-filter', 'mes-filter', 'anio-filter', 'orden-filter'
        ];

        const elementosExisten = elementosRequeridos.every(id => {
            const existe = document.getElementById(id) !== null;
            if (!existe) console.warn(`Elemento no encontrado: ${id}`);
            return existe;
        });

        if (elementosExisten) {
            // Configurar eventos solo si todos los elementos existen
            document.getElementById('tipo-filter').addEventListener('change', function() {
                console.log('Tipo filter changed');
                aplicarFiltros();
            });
            document.getElementById('mes-filter').addEventListener('change', function() {
                console.log('Mes filter changed');
                aplicarFiltros();
            });
            document.getElementById('anio-filter').addEventListener('change', function() {
                console.log('Anio filter changed');
                aplicarFiltros();
            });
            document.getElementById('orden-filter').addEventListener('change', function() {
                console.log('Orden filter changed');
                aplicarFiltros();
            });

            console.log('Eventos de filtrado configurados correctamente');
            return true;
        }
        return false;
    };

    // 2. Intentar configurar inmediatamente
    let filtrosConfigurados = setupFiltros();

    // 3. Si no se configuró, usar MutationObserver para esperar por los elementos
    if (!filtrosConfigurados) {
        console.log('Configurando observer para elementos dinámicos...');

        const observer = new MutationObserver((mutations, obs) => {
            if (setupFiltros()) {
                obs.disconnect(); // Dejar de observar cuando esté listo
                console.log('Elementos dinámicos detectados, eventos configurados');
        aplicarFiltros(); // Cargar datos iniciales
    }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Si ya estaban los elementos, cargar datos
        aplicarFiltros();
    }

    // 4. Configurar otros eventos (eliminación, etc.)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.prenomina-tabla__boton')) {
            e.preventDefault();
            const prenominaId = e.target.closest('.prenomina-tabla__boton').getAttribute('data-prenomina-id');
            mostrarPreNominaModal(prenominaId);
        }
    });
}

// Función para aplicar los filtros y cargar las prenominas
async function aplicarFiltros() {
    const cuerpoTabla = document.getElementById('prenomina-table');
    if (!cuerpoTabla) return;

    try {
        // Mostrar estado de carga
        const tbody = cuerpoTabla.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando prenominas...</td></tr>';
        }

        // Construir parámetros
        const params = new URLSearchParams({
            tipo: encodeURIComponent(document.getElementById('tipo-filter')?.value || ''),
            mes: encodeURIComponent(document.getElementById('mes-filter')?.value || ''),
            anio: encodeURIComponent(document.getElementById('anio-filter')?.value || ''),
            orden: encodeURIComponent(document.getElementById('orden-filter')?.value || '-fecha_creacion')
        });

        console.log('Fetching data with params:', params.toString());

        const response = await fetch(API_PRENOMINAS_URL + '?' + params.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('Data received:', data);

        if (data.success) {
            if (data.prenominas && data.prenominas.length > 0) {
                actualizarTablaPrenominas(data.prenominas);
            } else {
                const tbody = cuerpoTabla.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron prenominas con los filtros aplicados</td></tr>';
                }
            }
        } else {
            throw new Error(data.error || 'Error desconocido al obtener prenominas');
        }
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        const tbody = cuerpoTabla.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center error">Error al cargar datos: ${error.message}</td></tr>`;
        }
        mostrarNotificacion('Error al cargar prenominas: ' + error.message, 'error');
    }
}

// Función para actualizar la tabla de prenominas
async function actualizarTablaPrenominas(prenominas) {
    const table = document.getElementById('prenomina-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    console.log('Updating table with data:', prenominas);

    tbody.innerHTML = prenominas.map(prenomina => `
        <tr>
            <td>${prenomina.id_prenomina}</td>
            <td>${prenomina.tipo_nomina}</td>
            <td>${prenomina.periodo}</td>
            <td>${prenomina.secuencia}</td>
            <td>${prenomina.fecha_cierre}</td>
            <td>${prenomina.fecha_creacion}</td>
            <td>${prenomina.total}</td>
            <td class="prenomina-tabla__celda">
                <button class="prenomina-tabla__boton" data-prenomina-id="${prenomina.id_prenomina}">
                    Ver Detalles
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== INICIALIZACION CUANDO EL TEMPLATE SE CARGA =====
// Solo inicializar si estamos en la página correcta
$(document).ready(function() {
    if (document.getElementById('prenomina-table')) {
        console.log('DOM is ready, initializing VerPrenomina');
        initializeVerPrenomina();
    }
});

// Exportar funciones globales
window.initializeVerPrenomina = initializeVerPrenomina;
window.mostrarPreNominaModal = mostrarPreNominaModal;
