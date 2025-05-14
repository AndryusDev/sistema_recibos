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
                {id: 'modal-fecha-cierre', valid: v => !!v} // Validación del nuevo campo
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
    
    // Drag and drop para archivos (código existente sin cambios)
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
            
            // Validación de tipo y tamaño (código existente)
        }
    }
    
    // Descargar plantilla (código existente)
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

            mostrarNotificacion(
                `Nómina importada correctamente. ${resultado.message}`,
                'success'
            );

            actualizarTablaNominas(); // Asegúrate de que esta función esté definida
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

// Función global para cerrar el modal (sin cambios)
function importarnominaModal__cerrar() {
    const modal = document.getElementById("importarnominaModal");
    if (modal) modal.style.display = 'none';
}

// Inicialización al cargar el DOM (sin cambios)
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");
});

// Función para enviar los datos al servidor
async function enviarDatosImportacion(formData) {
    try {
        const response = await fetch('/api/nominas/importar/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la importación');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al importar nómina:', error);
        throw error;
    }
}

// Función para actualizar la tabla después de importar
function actualizarTablaNominas() {
    fetch('/api/nominas/')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.tabla-recibos__tbody');
            if (tbody) {
                tbody.innerHTML = data.map(nomina => `
                    <tr class="tabla-recibos__fila">
                        <td class="tabla-recibos__celda">${nomina.tipo}</td>
                        <td class="tabla-recibos__celda">${obtenerNombreMes(nomina.mes)} ${nomina.año}</td>
                        <td class="tabla-recibos__celda">${nomina.secuencia}</td>
                        <td class="tabla-recibos__celda">${nomina.registros}</td>
                        <td class="tabla-recibos__celda">
                            <div class="fecha-cierre-container">
                                <span class="fecha-cierre">${formatearFecha(nomina.fecha_cierre)}</span>
                            </div>
                        </td>
                        <td class="tabla-recibos__celda">${formatearFechaHora(nomina.fecha_carga)}</td>
                        <td class="tabla-recibos__celda">
                            <button class="tabla-recibos__boton" onclick="verNomina(${nomina.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="tabla-recibos__boton" onclick="descargarNomina(${nomina.id})">
                                <i class="fas fa-download"></i> Descargar
                            </button>
                            <button class="tabla-recibos__boton" style="background-color: #dc3545;" onclick="eliminarNomina(${nomina.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => console.error('Error al actualizar tabla:', error));
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

function mostrarNotificacion(mensaje, tipo) {
    // Implementar lógica para mostrar notificación al usuario
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}