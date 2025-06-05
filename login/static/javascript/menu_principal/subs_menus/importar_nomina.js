// ===== CONSTANTES GLOBALES =====
const API_NOMINAS_URL = '/api/nominas/';
const CSRF_TOKEN = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

// Función global para abrir el modal
function importarnominaModal__abrir() {
    const modal = document.getElementById("importarnominaModal");
    const contenido = document.getElementById("contenidoImportarnomina");
    modal.style.display = 'flex';
    inicializarModalImportacion();
}

// Función para inicializar todos los eventos del modal
function inicializarModalImportacion() {
    const modal = document.getElementById("importarnominaModal");
    if (!modal) return;

    // Elementos del modal
    const btnCerrar = modal.querySelector('.btn-cerrar');
    const btnCancelar = modal.querySelector('#btn-cancelar');
    const pasos = modal.querySelectorAll('.paso-importacion');
    const indicadoresPasos = modal.querySelectorAll('.indicador-pasos .paso');
    const btnAnterior = modal.querySelector('#btn-anterior');
    const btnSiguiente = modal.querySelector('#btn-siguiente');
    const btnImportar = modal.querySelector('#btn-importar');
    const dropzone = modal.querySelector('#dropzone-area');
    const inputArchivo = modal.querySelector('#archivo-nomina-modal');
    const nombreArchivo = modal.querySelector('#nombre-archivo');
    const btnSeleccionarArchivo = modal.querySelector('#btn-seleccionar-archivo');
    const descargarPlantilla = modal.querySelector('#descargar-plantilla');
    
    let pasoActual = 1;
    const totalPasos = 4;
    
    // Función para cerrar el modal
    function cerrarModal() {
        modal.style.display = 'none';
    }
    
    // Asignar eventos de cierre
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
    
    // Navegación entre pasos
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', function() {
            if (validarPasoActual()) {
                pasoActual++;
                actualizarPasos();
            }
        });
    }
    
    if (btnAnterior) {
        btnAnterior.addEventListener('click', function() {
            pasoActual--;
            actualizarPasos();
        });
    }
    
    function actualizarPasos() {
        pasos.forEach(paso => paso.classList.remove('activo'));
        const pasoActivo = modal.querySelector(`.paso-importacion[data-paso="${pasoActual}"]`);
        if (pasoActivo) pasoActivo.classList.add('activo');
        
        indicadoresPasos.forEach((indicador, index) => {
            indicador.classList.toggle('completado', index < pasoActual);
            indicador.classList.toggle('activo', index === pasoActual - 1);
        });
        
        if (btnAnterior) btnAnterior.disabled = pasoActual === 1;
        if (btnSiguiente) btnSiguiente.style.display = pasoActual < totalPasos ? 'flex' : 'none';
        if (btnImportar) {
            btnImportar.style.display = pasoActual === totalPasos ? 'flex' : 'none';
            if (pasoActual === totalPasos) {
                btnImportar.disabled = !validarPasoActual();
                actualizarResumen();
            }
        }
    }
    
    function validarPasoActual() {
        let valido = true;
        
        if (pasoActual === 1) {
            const tipoNomina = modal.querySelector('#modal-tipo-nomina');
            if (!tipoNomina?.value) {
                tipoNomina?.classList.add('invalido');
                valido = false;
            } else {
                tipoNomina?.classList.remove('invalido');
            }
        } else if (pasoActual === 2) {
            const campos = [
                {id: 'modal-mes', valid: v => !!v},
                {id: 'modal-anio', valid: v => v && v >= 2020 && v <= 2030},
                {id: 'modal-secuencia', valid: v => !!v},
                {id: 'modal-fecha-cierre', valid: v => !!v}
            ];
            
            campos.forEach(campo => {
                const element = modal.querySelector(`#${campo.id}`);
                if (element) {
                    if (!campo.valid(element.value)) {
                        element.classList.add('invalido');
                        valido = false;
                    } else {
                        element.classList.remove('invalido');
                    }
                }
            });
        } else if (pasoActual === 3) {
            if (!inputArchivo?.files?.length) {
                dropzone?.style.setProperty('border-color', 'var(--color-error)', 'important');
                valido = false;
            } else {
                dropzone?.style.setProperty('border-color', 'var(--color-secundario)', 'important');
            }
        }
        
        return valido;
    }
    
    function actualizarResumen() {
        const elementosResumen = {
            'resumen-tipo': () => modal.querySelector('#modal-tipo-nomina')?.value || 'No seleccionado',
            'resumen-periodo': () => {
                const mes = modal.querySelector('#modal-mes');
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const nombreMes = meses[parseInt(mes?.value) - 1] || '';
                return `${nombreMes} ${modal.querySelector('#modal-anio')?.value || ''} - ${modal.querySelector('#modal-secuencia')?.value || ''}`;
            },
            'resumen-archivo': () => inputArchivo?.files[0]?.name || 'No seleccionado',
            'resumen-fecha-cierre': () => modal.querySelector('#modal-fecha-cierre')?.value || 'No definida'
        };
        
        Object.entries(elementosResumen).forEach(([id, fn]) => {
            const elemento = modal.querySelector(`#${id}`);
            if (elemento) elemento.textContent = fn();
        });
    }
    
    // Drag and drop para archivos
    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (inputArchivo) inputArchivo.files = files;
            handleFiles(files);
        }
    }
    
    if (inputArchivo) {
        inputArchivo.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }
    
    function handleFiles(files) {
        if (files?.length && nombreArchivo) {
            const file = files[0];
            nombreArchivo.textContent = file.name;
        }
    }
    
    // Descargar plantilla
    if (descargarPlantilla) {
        descargarPlantilla.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Descargando plantilla...');
        });
    }
    
    if (btnImportar) {
        btnImportar.addEventListener('click', async function() {
            if (!validarPasoActual()) {
                mostrarNotificacion('Por favor complete todos los campos requeridos', 'error');
                return;
            }

            btnImportar.disabled = true;
            btnImportar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            const formData = new FormData();
            formData.append('tipo_nomina', modal.querySelector('#modal-tipo-nomina')?.value || '');
            formData.append('mes', modal.querySelector('#modal-mes')?.value || '');
            formData.append('anio', modal.querySelector('#modal-anio')?.value || '');
            formData.append('secuencia', modal.querySelector('#modal-secuencia')?.value || '');
            formData.append('fecha_cierre', modal.querySelector('#modal-fecha-cierre')?.value || '');

            if (inputArchivo?.files[0]) {
                formData.append('archivo', inputArchivo.files[0]);
            }

            try {
                const resultado = await enviarDatosImportacion(formData);

                // Mostrar el mensaje completo como antes
                mostrarNotificacion(
                    `SUCCESS: ${resultado.message}`,
                    'success'
                );

                // Actualizar la tabla directamente sin aplicar filtros
                actualizarTablaNominas();
                cerrarModal();
            } catch (error) {
                mostrarNotificacion(
                    `Error al importar nómina: ${error.message}`,
                    'error'
                );
            } finally {
                btnImportar.disabled = false;
                btnImportar.innerHTML = '<i class="fas fa-check"></i> Confirmar Importación';
            }
        });
    }
}

// Función global para cerrar el modal
function importarnominaModal__cerrar() {
    const modal = document.getElementById("importarnominaModal");
    if (modal) modal.style.display = 'none';
}

// Función para enviar los datos al servidor
async function enviarDatosImportacion(formData) {
    try {
        const response = await fetch('/api/nominas/importar/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': CSRF_TOKEN,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Error en la importación';
            mostrarNotificacion(errorMsg, 'error');
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error al importar nómina:', error);
        mostrarNotificacion(error.message, 'error');
        throw error;
    }
}

// Función para actualizar la tabla después de importar
async function actualizarTablaNominas(nominas) {
    const tbody = document.getElementById('cuerpoTablaNominas');
    const sinResultados = document.getElementById('sin-resultados');
    
    // Mostrar estado de carga
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando nóminas...</td></tr>';
    
    try {
        // Si no se proporcionan nóminas, obtenerlas del servidor
        if (!nominas) {
            const params = new URLSearchParams({
                orden: document.getElementById('filtro-orden')?.value || '-fecha_carga'
            });
            
            const response = await fetch(`${API_NOMINAS_URL}?${params.toString()}`, {
                headers: {
                    'X-CSRFToken': CSRF_TOKEN,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                nominas = data.nominas || [];
            } else {
                throw new Error(data.error || 'Error desconocido al obtener nóminas');
            }
        }
        
        // Actualizar la tabla con los datos
        if (nominas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay nóminas registradas</td></tr>';
            if (sinResultados) sinResultados.style.display = 'block';
        } else {
            tbody.innerHTML = nominas.map(nomina => `
                <tr class="tabla-recibos__fila" data-id="${nomina.id_nomina}">
                    <td class="tabla-recibos__celda">${nomina.id_nomina}</td>
                    <td class="tabla-recibos__celda">${nomina.tipo_nomina}</td>
                    <td class="tabla-recibos__celda">${nomina.periodo}</td>
                    <td class="tabla-recibos__celda">${nomina.secuencia}</td>
                    <td class="tabla-recibos__celda">
                        <div class="fecha-cierre-container">
                            <span class="fecha-cierre">${nomina.fecha_cierre}</span>
                        </div>
                    </td>
                    <td class="tabla-recibos__celda">${nomina.fecha_carga}</td>
                    <td class="tabla-recibos__celda">
                        <button class="tabla-recibos__boton" onclick="descargarNomina(${nomina.id_nomina})">
                            <i class="fas fa-download"></i> Descargar
                        </button>
                        <button class="tabla-recibos__boton btn-eliminar" style="background-color: #dc3545;" data-id="${nomina.id_nomina}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
            
            if (sinResultados) sinResultados.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al actualizar tabla:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center error">Error al cargar datos: ${error.message}</td></tr>`;
        if (sinResultados) sinResultados.style.display = 'block';
    }
}

async function aplicarFiltros() {
    const cuerpoTabla = document.getElementById('cuerpoTablaNominas');
    await actualizarTablaNominas();
    if (!cuerpoTabla) return;

    try {
        // Mostrar estado de carga
        cuerpoTabla.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando nóminas...</td></tr>';

        // Construir parámetros
        const params = new URLSearchParams({
            tipo: document.getElementById('filtro-tipo')?.value || '',
            mes: document.getElementById('filtro-mes')?.value || '',
            anio: document.getElementById('filtro-anio')?.value || '',
            orden: document.getElementById('filtro-orden')?.value || '-fecha_carga'
        });

        const response = await fetch(`${API_NOMINAS_URL}?${params.toString()}`, {
            headers: {
                'X-CSRFToken': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            if (data.nominas && data.nominas.length > 0) {
                actualizarTablaNominas(data.nominas);
            } else {
                cuerpoTabla.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron nóminas con los filtros aplicados</td></tr>';
            }
        } else {
            throw new Error(data.error || 'Error desconocido al obtener nóminas');
        }
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        cuerpoTabla.innerHTML = `<tr><td colspan="7" class="text-center error">Error al cargar datos: ${error.message}</td></tr>`;
        mostrarNotificacion('Error al cargar nóminas: ' + error.message, 'error');
    }
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-mes').value = '';
    document.getElementById('filtro-anio').value = '';
    document.getElementById('filtro-orden').value = '-fecha_carga';
    aplicarFiltros();
}

async function eliminarNomina(idNomina) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Esta acción eliminará la nómina ID: ${idNomina}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        // Deshabilitar el botón para evitar doble clic
        const btn = document.querySelector(`.btn-eliminar[data-id="${idNomina}"]`);
        if (btn) btn.disabled = true;

        const response = await fetch(`/api/nominas/${idNomina}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({action: 'delete'}),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Error ${response.status}`);
        }

        await Swal.fire({
            title: '¡Eliminada!',
            text: data.message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        await actualizarTablaNominas();

    } catch (error) {
        console.error('Error eliminando nómina:', error);
        
        // Mostrar error solo si no es un "no encontrado"
        if (!error.message.includes('404') && !error.message.includes('no existe')) {
            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al eliminar la nómina',
                icon: 'error'
            });
        }
    } finally {
        // Rehabilitar el botón si existe
        const btn = document.querySelector(`.btn-eliminar[data-id="${idNomina}"]`);
        if (btn) btn.disabled = false;
    }
}

function getCSRFToken() {
    // 1. Intentar obtener de la etiqueta meta
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (metaToken) return metaToken;
    
    // 2. Intentar obtener del input hidden
    const inputToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (inputToken) return inputToken;
    
    // 3. Intentar obtener de las cookies
    const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    if (cookieToken) return cookieToken;
    
    // 4. Fallback a variable global si existe
    if (typeof CSRF_TOKEN !== 'undefined') return CSRF_TOKEN;
    
    console.error('No se pudo obtener el token CSRF');
    throw new Error('No se pudo obtener el token de seguridad');
}

// Inicializar eventos de búsqueda
function inicializarEventosBusqueda() {
    const btnBuscar = document.getElementById('btn-aplicar-filtros');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    
    if (btnBuscar) btnBuscar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    
    // Permitir búsqueda al presionar Enter en cualquier filtro
    document.querySelectorAll('.busqueda-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') aplicarFiltros();
        });
    });
    
    // Asegurarse de que los elementos de filtro existan
    if (!document.getElementById('filtro-tipo') || 
        !document.getElementById('filtro-mes') || 
        !document.getElementById('filtro-anio') || 
        !document.getElementById('filtro-orden')) {
        console.warn('No se encontraron todos los elementos de filtro en el DOM');
    }
}

// Funciones auxiliares
function obtenerNombreMes(numeroMes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1] || '';
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
}

function formatearFechaHora(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES');
}

let Swal;
try {
    Swal = window.Swal;
    if (!Swal) {
        console.warn('SweetAlert2 no está cargado globalmente');
        // Opción 1: Cargar dinámicamente (si es necesario)
        // await cargarSweetAlert2(); // Implementar esta función si es necesario
        // Opción 2: Usar un fallback básico
        Swal = {
            fire: (options) => { return Promise.resolve({ isConfirmed: confirm(options.title) } )},
            close: () => {},
            // ...otros métodos que uses
        };
    }
} catch (error) {
    console.error('Error verificando SweetAlert2:', error);
    Swal = {
        fire: (options) => { return Promise.resolve({ isConfirmed: confirm(options.title) } )},
        close: () => {}
    };
}

function mostrarNotificacion(mensaje, tipo) {
    // Asegúrate de que SweetAlert esté cargado
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: tipo === 'success' ? 'Éxito' : 'Error',
            text: mensaje,
            icon: tipo,
            confirmButtonText: 'Aceptar'
        });
    } else {
        console.error('SweetAlert2 no está cargado');
        alert(mensaje); // Fallback básico
    }
}

// Inicialización al cargar la página
// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos estáticos (filtros)
    inicializarEventosBusqueda();
    
    // Delegación de eventos para elementos dinámicos
    document.addEventListener('click', function(e) {
        // Eliminar nómina - versión mejorada
        const btnEliminar = e.target.closest('.btn-eliminar');
        if (btnEliminar) {
            const idNomina = btnEliminar.getAttribute('data-id');
            if (idNomina) {
                eliminarNomina(idNomina).catch(error => {
                    console.error('Error en eliminación:', error);
                });
            }
        }
    });
    
    // Cargar datos iniciales
    aplicarFiltros();
});

// ===== FUNCIÓN DE INICIALIZACIÓN MEJORADA =====
function initializeImportarNomina() {
    // Verificar primero si estamos en la página correcta
    if (!document.getElementById('cuerpoTablaNominas')) {
        console.log('No está en página de importar nómina');
        return;
    }

    console.log('Inicializando módulo de importar nómina...');
    
    // 1. Configurar eventos de filtrado con verificación de existencia
    const setupFiltros = () => {
        const elementosRequeridos = [
            'filtro-tipo', 'filtro-mes', 'filtro-anio', 'filtro-orden',
            'btn-aplicar-filtros', 'btn-limpiar-filtros'
        ];
        
        const elementosExisten = elementosRequeridos.every(id => {
            const existe = document.getElementById(id) !== null;
            if (!existe) console.warn(`Elemento no encontrado: ${id}`);
            return existe;
        });
        
        if (elementosExisten) {
            // Configurar eventos solo si todos los elementos existen
            document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
            document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
            
            document.querySelectorAll('.busqueda-input').forEach(input => {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') aplicarFiltros();
                });
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
        if (e.target.closest('.btn-eliminar')) {
            const idNomina = e.target.closest('.btn-eliminar').getAttribute('data-id');
            if (idNomina) eliminarNomina(idNomina);
        }
    });
}

// ===== INICIALIZACIÓN CUANDO EL TEMPLATE SE CARGA =====
// Solo inicializar si estamos en la página correcta
if (document.getElementById('importarnominaModal')) {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImportarNomina);
    } else {
        // Si el DOM ya está listo
        setTimeout(initializeImportarNomina, 300);
    }
}

// Exportar funciones globales
window.initializeImportarNomina = initializeImportarNomina;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;

// ===== EJECUCIÓN INICIAL =====
// Verificar si estamos en la página de nóminas
if (document.getElementById('cuerpoTablaNominas')) {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarModuloNominas);
    } else {
        // Si el DOM ya está listo
        setTimeout(inicializarModuloNominas, 100);
    }
}