// Función global para abrir el modal
// Función global para abrir el modal
function importarnominaModal__abrir() {
    const modal = document.getElementById("importarnominaModal");
    const contenido = document.getElementById("contenidoImportarnomina");

    contenido.innerHTML = `
        <div class="recibo-modal__contenido">
            <div class="modal-header">
                <h3><i class="fas fa-file-import"></i> Importar Nómina</h3>
                <button class="btn-cerrar">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Paso 1: Selección de tipo de nómina -->
                <div class="paso-importacion activo" data-paso="1">
                    <div class="form-group">
                        <label for="modal-tipo-nomina"><i class="fas fa-list-check"></i> Tipo de Nómina:</label>
                        <select id="modal-tipo-nomina" class="busqueda-input" required>
                            <option value="">Seleccione un tipo</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Obrero">Obrero</option>
                            <option value="Uniformado">Uniformado</option>
                            <option value="Directivo">Directivo</option>
                        </select>
                    </div>
                    
                    <div class="info-ayuda">
                        <i class="fas fa-info-circle"></i> Seleccione el tipo de nómina que desea importar
                    </div>
                </div>
                
                <!-- Paso 2: Período y secuencia -->
                <div class="paso-importacion" data-paso="2">
                    <div class="form-group">
                        <label for="modal-mes"><i class="fas fa-calendar"></i> Mes:</label>
                        <select id="modal-mes" class="busqueda-input" required>
                            <option value="">Seleccione un mes</option>
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-anio"><i class="fas fa-calendar-alt"></i> Año:</label>
                        <input type="number" id="modal-anio" class="busqueda-input" min="2020" max="2030" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-secuencia"><i class="fas fa-sort-numeric-up"></i> Secuencia:</label>
                        <select id="modal-secuencia" class="busqueda-input" required>
                            <option value="Primera">Primera del mes</option>
                            <option value="Segunda">Segunda del mes</option>
                            <option value="Especial">Especial</option>
                        </select>
                    </div>
                    
                    <div class="info-ayuda">
                        <i class="fas fa-info-circle"></i> Especifique el período y secuencia de la nómina
                    </div>
                </div>
                
                <!-- Paso 3: Carga de archivo -->
                <div class="paso-importacion" data-paso="3">
                    <div class="dropzone-modal" id="dropzone-area">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Arrastra tu archivo Excel o CSV aquí</p>
                        <p class="nombre-archivo" id="nombre-archivo"></p>
                        <input type="file" id="archivo-nomina-modal" accept=".xlsx,.xls,.csv" required>
                        <button class="busqueda-boton" id="btn-seleccionar-archivo">
                            <i class="fas fa-folder-open"></i> Seleccionar archivo
                        </button>
                        
                        <div class="info-archivo">
                            <span>Formatos soportados: .xlsx, .xls, .csv (Máx. 5MB)</span>
                            <a href="#" class="descargar-plantilla" id="descargar-plantilla">
                                <i class="fas fa-file-download"></i> Descargar plantilla
                            </a>
                        </div>
                    </div>
                    
                    <div class="previsualizacion-datos" id="previsualizacion-datos">
                        <!-- Aquí se mostrará una vista previa de los datos -->
                    </div>
                </div>
                
                <!-- Paso 4: Confirmación -->
                <div class="paso-importacion" data-paso="4">
                    <div class="resumen-importacion">
                        <h4><i class="fas fa-check-circle"></i> Resumen de Importación</h4>
                        
                        <div class="resumen-item">
                            <span>Tipo de Nómina:</span>
                            <strong id="resumen-tipo">Administrativo</strong>
                        </div>
                        
                        <div class="resumen-item">
                            <span>Período:</span>
                            <strong id="resumen-periodo">Marzo 2024 - Primera</strong>
                        </div>
                        
                        <div class="resumen-item">
                            <span>Archivo:</span>
                            <strong id="resumen-archivo">nomina_administrativa_marzo.xlsx</strong>
                        </div>
                        
                        <div class="resumen-item">
                            <span>Registros detectados:</span>
                            <strong id="resumen-registros">125</strong>
                        </div>
                        
                        <div class="advertencia-importacion">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Revise cuidadosamente la información antes de confirmar. Esta acción no se puede deshacer.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="recibo-modal__acciones">
                <div class="indicador-pasos">
                    <span class="paso" data-paso="1">1</span>
                    <span class="paso" data-paso="2">2</span>
                    <span class="paso" data-paso="3">3</span>
                    <span class="paso" data-paso="4">4</span>
                </div>
                
                <div class="botones-navegacion">
                    <button id="btn-anterior" class="recibo-modal__boton btn-anterior" disabled>
                        <i class="fas fa-arrow-left"></i> Anterior
                    </button>
                    <button id="btn-siguiente" class="recibo-modal__boton btn-siguiente" style="background-color: #006666;">
                        Siguiente <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="btn-importar" class="recibo-modal__boton btn-importar" style="background-color: #003366;">
                        <i class="fas fa-check"></i> Confirmar Importación
                    </button>
                    <button id="btn-cancelar" class="recibo-modal__boton btn-cancelar" style="background-color: #6c757d;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Inicializar los eventos del modal
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
        /*document.body.style.overflow = 'auto'*/
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
        // Ocultar todos los pasos
        pasos.forEach(paso => paso.classList.remove('activo'));
        
        // Mostrar paso actual
        const pasoActivo = modal.querySelector(`.paso-importacion[data-paso="${pasoActual}"]`);
        if (pasoActivo) pasoActivo.classList.add('activo');
        
        // Actualizar indicadores
        indicadoresPasos.forEach((indicador, index) => {
            indicador.classList.toggle('completado', index < pasoActual);
            indicador.classList.toggle('activo', index === pasoActual - 1);
        });
        
        // Actualizar botones
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
                {id: 'modal-secuencia', valid: v => !!v}
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
            'resumen-registros': () => '125' // Esto debería calcularse del archivo
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
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });
        
        dropzone.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            dropzone?.classList.add('highlight');
        }
        
        function unhighlight() {
            dropzone?.classList.remove('highlight');
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
    
    if (btnSeleccionarArchivo && inputArchivo) {
        btnSeleccionarArchivo.addEventListener('click', function() {
            inputArchivo.click();
        });
    }
    
    function handleFiles(files) {
        if (files?.length && nombreArchivo) {
            const file = files[0];
            nombreArchivo.textContent = file.name;
            
            // Validación de tipo y tamaño
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                'text/csv'
            ];
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
                mostrarError('Tipo de archivo no válido. Solo se aceptan Excel (.xls, .xlsx) o CSV.');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                mostrarError('El archivo es demasiado grande. Máximo 5MB.');
                return;
            }
            
            previsualizarArchivo(file);
        }
    }
    
    function mostrarError(mensaje) {
        console.error(mensaje);
        alert(mensaje);
    }
    
    function previsualizarArchivo(file) {
        console.log('Previsualizando archivo:', file.name);
    }
    
    // Descargar plantilla
    if (descargarPlantilla) {
        descargarPlantilla.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Descargando plantilla...');
        });
    }
    
    // Importar nómina
    if (btnImportar) {
        btnImportar.addEventListener('click', function() {
            console.log("Intento de importación");
            
            if (!validarPasoActual()) {
                mostrarError("Por favor complete todos los campos requeridos");
                return;
            }
            
            const formData = new FormData();
            formData.append('tipo_nomina', modal.querySelector('#modal-tipo-nomina')?.value || '');
            formData.append('mes', modal.querySelector('#modal-mes')?.value || '');
            formData.append('anio', modal.querySelector('#modal-anio')?.value || '');
            formData.append('secuencia', modal.querySelector('#modal-secuencia')?.value || '');
            
            if (inputArchivo?.files[0]) {
                formData.append('archivo', inputArchivo.files[0]);
            }
            
            console.log("Datos preparados para importación:", Object.fromEntries(formData));
            
            // SIMULACIÓN - reemplazar con llamada real a tu API
            setTimeout(() => {
                console.log("Importación simulada con éxito");
                alert('Nómina importada correctamente (simulación)');
                cerrarModal();
            }, 1000);
        });
    }
}

// Función global para cerrar el modal
function importarnominaModal__cerrar() {
    const modal = document.getElementById("importarnominaModal");
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Función auxiliar para CSRF (Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado y script iniciado");
});