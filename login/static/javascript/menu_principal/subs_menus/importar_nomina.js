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
    const totalPasos = 5; // Updated total steps to 5
    
    // Store individual assignments data
    let asignacionesIndividuales = {};
    
    // Función para cerrar el modal
    function cerrarModal() {
        modal.style.display = 'none';
    }
    
    // Asignar eventos de cierre
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
    
    // Navegación entre pasos
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', async function() {
            if (await validarPasoActual()) {
                // Si vamos al paso 3, cargar empleados y conceptos
                if (pasoActual === 2) {
                    await cargarDatosPaso3();
                }
                pasoActual++;
                actualizarPasos();
            }
        });
    }

async function cargarDatosPaso3() {
    const tipoNomina = modal.querySelector('#modal-tipo-nomina').value;
    if (!tipoNomina) return;

    try {
        // 1. Cargar empleados
        await cargarEmpleadosPorTipo();

        // 2. Cargar conceptos disponibles
        const response = await fetch('/api/conceptos/', {
            headers: {
                'Accept': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            }
        });

        if (!response.ok) throw new Error('Error al cargar conceptos');
        const data = await response.json();

        // Renderizar conceptos en el panel
        const conceptosContainer = document.getElementById('conceptos-disponibles');
        if (conceptosContainer && data.conceptos) {
            console.log('Renderizando conceptos...');
            conceptosContainer.innerHTML = data.conceptos.map(concepto => `
                <div class="concepto-checkbox">
                    <input type="checkbox" id="concepto-${concepto.codigo}" 
                        data-codigo="${concepto.codigo}">
                    <label for="concepto-${concepto.codigo}">
                        ${concepto.descripcion}
                    </label>
                </div>
            `).join('');
            console.log('Conceptos renderizados');
            // Call actualizarPeriodo after conceptos are rendered
            if (typeof actualizarPeriodo === 'function') {
                actualizarPeriodo();
            }

            // Add event listeners to general concept checkboxes to update mini panel if open
            const generalCheckboxes = conceptosContainer.querySelectorAll('input[type="checkbox"]');
            generalCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const miniPanel = document.getElementById('mini-panel-configuracion');
                    if (!miniPanel || miniPanel.style.display === 'none') return;

                    const empleadoId = miniPanel.dataset.empleadoId;
                    if (!empleadoId) return;

                    // If individual override exists for this concept, do not override checkbox
                    if (window.asignacionesIndividuales &&
                        window.asignacionesIndividuales[empleadoId] &&
                        typeof window.asignacionesIndividuales[empleadoId][checkbox.dataset.codigo] === 'boolean') {
                        return;
                    }

                    // Update the corresponding individual checkbox in mini panel
                    const indCheckbox = miniPanel.querySelector(`input[id="ind-concepto-${checkbox.dataset.codigo}"]`);
                    if (indCheckbox) {
                        indCheckbox.checked = checkbox.checked;
                    }
                });
            });
        }

        // Pre-check conceptos for nomina administrativa
        console.log('Tipo de nómina seleccionado:', tipoNomina);
        if (tipoNomina.toLowerCase().includes('administrativ')) {
            console.log('Nomina administrativa detectada, preseleccionando conceptos...');
            const precheckedConcepts = ['1001', '1104', '1103', '20001', '20002', '20003', '20004'];
            // Delay pre-checking to ensure DOM update
            setTimeout(() => {
                precheckedConcepts.forEach(codigo => {
                    const checkbox = conceptosContainer.querySelector(`input[data-codigo="${codigo}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log(`Checkbox preseleccionado: ${codigo}`);
                    } else {
                        console.warn(`Checkbox no encontrado para código: ${codigo}`);
                    }
                });
            }, 50);
        }

        // 3. Configurar eventos
        configurarEventosTabla();
        configurarEventosConceptos();

    } catch (error) {
        console.error('Error en cargarDatosPaso3:', error);
        mostrarNotificacion('Error al cargar datos: ' + error.message, 'error');
    }
}

    function configurarEventosConceptos() {
        // Evento para "Agregar Concepto General"
        const btnConceptoGeneral = document.getElementById('btn-agregar-concepto-general');
        if (btnConceptoGeneral) {
            btnConceptoGeneral.addEventListener('click', mostrarDialogoConceptoGeneral);
        }

        // Evento para "Aplicar a Seleccionados"
        const btnAplicarSeleccionados = document.getElementById('btn-aplicar-seleccionados');
        if (btnAplicarSeleccionados) {
            btnAplicarSeleccionados.addEventListener('click', aplicarASeleccionados);
        }

        // Eventos de filtrado
        const filtroEmpleados = document.getElementById('filtro-empleados');
        if (filtroEmpleados) {
            filtroEmpleados.addEventListener('input', function() {
                const texto = this.value.toLowerCase();
                const filas = document.querySelectorAll('#tbody-gestion-nomina tr');
                
                filas.forEach(fila => {
                    const nombre = fila.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    const cedula = fila.querySelector('td:nth-child(3)').textContent.toLowerCase();
                    fila.style.display = nombre.includes(texto) || cedula.includes(texto) ? '' : 'none';
                });
            });
        }
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
    
    async function validarPasoActual() {
        let valido = true;
        
        if (pasoActual === 1) {
            const tipoNomina = modal.querySelector('#modal-tipo-nomina');
            if (!tipoNomina?.value) {
                tipoNomina?.classList.add('invalido');
                valido = false;
            } else {
                tipoNomina?.classList.remove('invalido');
                // Cargar empleados cuando se selecciona el tipo de nómina
                await cargarEmpleadosPorTipo();
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
            // Validar que al menos un concepto esté seleccionado
            const conceptosSeleccionados = modal.querySelectorAll('#conceptos-disponibles input[type="checkbox"]:checked');
            if (conceptosSeleccionados.length === 0) {
                const pasoConceptos = modal.querySelector('#conceptos-disponibles');
                if (pasoConceptos) pasoConceptos.style.border = '2px solid var(--color-error)';
                valido = false;
            } else {
                const pasoConceptos = modal.querySelector('#conceptos-disponibles');
                if (pasoConceptos) pasoConceptos.style.border = 'none';
                
                // Almacenar los códigos de conceptos seleccionados en un campo oculto
                const codigosConceptos = Array.from(conceptosSeleccionados).map(checkbox => {
                    return checkbox.getAttribute('data-codigo');
                });
                
                // Crear o actualizar campo oculto para los conceptos
                let conceptosInput = modal.querySelector('#conceptos-seleccionados');
                if (!conceptosInput) {
                    conceptosInput = document.createElement('input');
                    conceptosInput.type = 'hidden';
                    conceptosInput.id = 'conceptos-seleccionados';
                    conceptosInput.name = 'conceptos_seleccionados';
                    modal.querySelector('.modal-body').appendChild(conceptosInput);
                }
                conceptosInput.value = JSON.stringify(codigosConceptos);
            }
        }
        
        return valido;
    }
    
async function cargarEmpleadosPorTipo() {
    const tipoNomina = document.getElementById('modal-tipo-nomina').value;
    const tablaBody = document.getElementById('tbody-gestion-nomina');
    const selectAll = document.getElementById('select-all-empleados');
    
    try {
        tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando empleados...</td></tr>';
        
        const response = await fetch(`/api/empleados/por_tipo/${tipoNomina}/`, {
            headers: {
                'Accept': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar empleados');
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error || 'Error en la respuesta');
        
        const empleados = data.empleados || [];
        const conceptosAplicados = data.conceptos || [];
        
        // Actualizar headers de conceptos
        actualizarHeadersConceptos(conceptosAplicados);
        
        // Renderizar empleados
        renderizarEmpleados(empleados, conceptosAplicados);
        
        // Configurar eventos
        configurarEventosTabla();
        
    } catch (error) {
        console.error('Error:', error);
        tablaBody.innerHTML = `<tr><td colspan="5" class="text-center error">Error: ${error.message}</td></tr>`;
    }
}

function actualizarHeadersConceptos(conceptos) {
    const headerRow = document.querySelector('#tabla-gestion-nomina thead tr');
    const conceptosHeader = document.getElementById('conceptos-headers');
    
    conceptos.forEach(concepto => {
        const th = document.createElement('th');
        th.className = 'col-concepto';
        th.textContent = concepto.descripcion;
        th.dataset.codigo = concepto.codigo;
        conceptosHeader.appendChild(th);
    });
}

function renderizarEmpleados(empleados, conceptos) {
    const tablaBody = document.getElementById('tbody-gestion-nomina');
    tablaBody.innerHTML = '';
    
    empleados.forEach(empleado => {
        const tr = document.createElement('tr');
        tr.dataset.empleadoId = empleado.id;
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="empleado-checkbox" data-id="${empleado.id}">
            </td>
            <td>${empleado.nombre}</td>
            <td>${empleado.cedula}</td>
            <td>${empleado.cargo}</td>
            <td>
                <button class="btn-configuracion-individual" data-cedula="${empleado.cedula}">
                    Configuración Individual
                </button>
            </td>
            ${conceptos.map(concepto => `
                <td class="celda-editable valor-concepto" 
                    data-concepto="${concepto.codigo}"
                    data-empleado="${empleado.id}"
                    ondblclick="habilitarEdicion(this)">
                    ${empleado.conceptos?.[concepto.codigo] || '0.00'}
                </td>
            `).join('')}
        `;
        
        tablaBody.appendChild(tr);
    });
}

function configurarEventosTabla() {
    // Selección masiva
    const selectAll = document.getElementById('select-all-empleados');
    selectAll.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.empleado-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });
    
    // Botón de aplicar a seleccionados
    document.getElementById('btn-aplicar-seleccionados').addEventListener('click', aplicarASeleccionados);
    
    // Botón de agregar concepto general
    // Removed duplicate global event listener for btn-agregar-concepto-general to fix click issue

    // Add double-click event listener on employee name and cedula cells to open individual concept modal
    const tablaBody = document.getElementById('tbody-gestion-nomina');
    if (tablaBody) {
        tablaBody.querySelectorAll('tr').forEach(tr => {
            const nombreCelda = tr.querySelector('td:nth-child(2)');
            const cedulaCelda = tr.querySelector('td:nth-child(3)');
            if (nombreCelda) {
                nombreCelda.addEventListener('dblclick', () => {
                    const cedula = cedulaCelda ? cedulaCelda.textContent.trim() : null;
                    if (cedula) abrirConfiguracionEmpleadoPorCedula(cedula);
                });
            }
            if (cedulaCelda) {
                cedulaCelda.addEventListener('dblclick', () => {
                    const cedula = cedulaCelda.textContent.trim();
                    abrirConfiguracionEmpleadoPorCedula(cedula);
                });
            }
        });
    }

    // Add click event listeners to "Configuración Individual" buttons
    if (tablaBody) {
        const botonesConfiguracion = tablaBody.querySelectorAll('.btn-configuracion-individual');
        botonesConfiguracion.forEach(boton => {
            boton.addEventListener('click', () => {
                const cedula = boton.getAttribute('data-cedula');
                if (cedula) {
                    abrirConfiguracionEmpleadoPorCedula(cedula);
                }
            });
        });
    }
}

// New function to open individual concept modal by cedula
function abrirConfiguracionEmpleadoPorCedula(cedula) {
    const modal = document.getElementById("importarnominaModal");
    if (!modal) return;

    // Find employee data by cedula from the current table rows
    const tablaBody = document.getElementById('tbody-gestion-nomina');
    if (!tablaBody) return;

    let empleado = null;
    tablaBody.querySelectorAll('tr').forEach(tr => {
        const cedulaCelda = tr.querySelector('td:nth-child(3)');
        if (cedulaCelda && cedulaCelda.textContent.trim() === cedula) {
            empleado = {
                id: tr.dataset.empleadoId,
                nombre: tr.querySelector('td:nth-child(2)')?.textContent.trim() || '',
                cedula: cedula,
                cargo: tr.querySelector('td:nth-child(4)')?.textContent.trim() || ''
            };
        }
    });

    if (!empleado) {
        mostrarNotificacion('Empleado no encontrado para cédula: ' + cedula, 'error');
        return;
    }

    // Show the mini panel modal for the employee
    abrirConfiguracionEmpleado(empleado);

    // Show overlay for the mini panel modal
    const miniPanelOverlay = document.getElementById('mini-panel-overlay');
    if (miniPanelOverlay) {
        miniPanelOverlay.style.display = 'block';
        miniPanelOverlay.classList.add('show');
        miniPanelOverlay.addEventListener('click', () => {
            const miniPanel = document.getElementById('mini-panel-configuracion');
            if (miniPanel) miniPanel.style.display = 'none';
            miniPanelOverlay.style.display = 'none';
            miniPanelOverlay.classList.remove('show');
        }, { once: true });
    }
}

function habilitarEdicion(celda) {
    celda.contentEditable = true;
    celda.classList.add('editando');
    celda.focus();
    
    const valorOriginal = celda.textContent.trim();
    
    celda.addEventListener('blur', function() {
        finalizarEdicion(celda, valorOriginal);
    });
    
    celda.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            celda.blur();
        }
    });
}

function finalizarEdicion(celda, valorOriginal) {
    const nuevoValor = celda.textContent.trim();
    const esValido = /^\d+(\.\d{0,2})?$/.test(nuevoValor);
    
    if (!esValido) {
        celda.textContent = valorOriginal;
        mostrarNotificacion('Por favor ingrese un valor numérico válido', 'error');
    } else {
        celda.textContent = parseFloat(nuevoValor).toFixed(2);
        actualizarValorConcepto(
            celda.dataset.empleado,
            celda.dataset.concepto,
            parseFloat(nuevoValor)
        );
    }
    
    celda.contentEditable = false;
    celda.classList.remove('editando');
}

async function actualizarValorConcepto(empleadoId, conceptoCodigo, valor) {
    try {
        const response = await fetch('/api/nominas/actualizar_concepto/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify({
                empleado_id: empleadoId,
                concepto_codigo: conceptoCodigo,
                valor: valor
            })
        });
        
        if (!response.ok) throw new Error('Error al actualizar concepto');
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Valor actualizado correctamente', 'success');
        } else {
            throw new Error(data.error || 'Error al actualizar');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

async function aplicarASeleccionados() {
    const empleadosSeleccionados = Array.from(
        document.querySelectorAll('.empleado-checkbox:checked')
    ).map(cb => cb.dataset.id);
    
    if (empleadosSeleccionados.length === 0) {
        mostrarNotificacion('Por favor seleccione al menos un empleado', 'warning');
        return;
    }
    
    const { value: concepto } = await Swal.fire({
        title: 'Aplicar Concepto a Seleccionados',
        input: 'select',
        inputOptions: await obtenerOpcionesConceptos(),
        inputPlaceholder: 'Seleccione un concepto',
        showCancelButton: true,
        confirmButtonText: 'Aplicar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor seleccione un concepto';
            }
        }
    });
    
    if (concepto) {
        // Instead of POSTing immediately, update local assignments
        if (!window.asignacionesIndividuales) {
            window.asignacionesIndividuales = {};
        }
        empleadosSeleccionados.forEach(empleadoId => {
            if (!window.asignacionesIndividuales[empleadoId]) {
                window.asignacionesIndividuales[empleadoId] = {};
            }
            window.asignacionesIndividuales[empleadoId][concepto] = true;
        });
        mostrarNotificacion('Concepto aplicado localmente a empleados seleccionados', 'success');
        // Optionally update UI to reflect changes
        await cargarEmpleadosPorTipo(); // Recargar tabla para mostrar cambios
    }
}

async function obtenerFormularioConceptos() {
    try {
        const response = await fetch('/api/conceptos/');
        if (!response.ok) throw new Error('Error al cargar conceptos');
        const data = await response.json();
        
        return `
            <div class="form-group">
                <label for="concepto-aplicar">Concepto:</label>
                <select id="concepto-aplicar" class="swal2-input">
                    <option value="">Seleccione un concepto</option>
                    ${data.conceptos.map(c => `
                        <option value="${c.codigo}">${c.descripcion}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="valor-aplicar">Valor:</label>
                <input type="number" id="valor-aplicar" class="swal2-input" step="0.01" min="0">
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        return '<p class="error">Error al cargar conceptos</p>';
    }
}

async function obtenerOpcionesConceptos() {
    try {
        const response = await fetch('/api/conceptos/');
        if (!response.ok) throw new Error('Error al cargar conceptos');
        const data = await response.json();
        const opciones = {};
        data.conceptos.forEach(concepto => {
            opciones[concepto.codigo] = concepto.descripcion;
        });
        return opciones;
    } catch (error) {
        console.error('Error al obtener opciones de conceptos:', error);
        return {};
    }
}

async function mostrarDialogoConceptoGeneral() {
    const { value: concepto } = await Swal.fire({
        title: 'Agregar Concepto General',
        input: 'select',
        inputOptions: await obtenerOpcionesConceptos(),
        inputPlaceholder: 'Seleccione un concepto',
        showCancelButton: true,
        confirmButtonText: 'Aplicar a Todos',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor seleccione un concepto';
            }
        }
    });
    
    if (concepto) {
        // Instead of POSTing immediately, update general concepts checkboxes
        const conceptosContainer = document.getElementById('conceptos-disponibles');
        if (conceptosContainer) {
            const checkbox = conceptosContainer.querySelector(`input[data-codigo="${concepto}"]`);
            if (checkbox) {
                checkbox.checked = true;
                // Trigger change event if needed
                checkbox.dispatchEvent(new Event('change'));
            }
        }
        mostrarNotificacion('Concepto general aplicado localmente a todos', 'success');
        await cargarEmpleadosPorTipo(); // Recargar tabla para mostrar cambios
    }
}
    
    function renderizarListaEmpleados(empleados) {
        const listaContainer = modal.querySelector('#lista-empleados');
        if (empleados.length === 0) {
            listaContainer.innerHTML = '<p>No se encontraron empleados.</p>';
            return;
        }
        listaContainer.innerHTML = '';
        empleados.forEach(empleado => {
            const div = document.createElement('div');
            div.className = 'empleado-item';
            div.textContent = `${empleado.nombre} (${empleado.email})`;
            const btnConfig = document.createElement('button');
            btnConfig.className = 'btn-configurar';
            btnConfig.textContent = 'Configurar';
            btnConfig.addEventListener('click', () => abrirConfiguracionEmpleado(empleado));
            div.appendChild(btnConfig);
            listaContainer.appendChild(div);
        });
    }
    
function abrirConfiguracionEmpleado(empleado) {
    const modal = document.getElementById("importarnominaModal");
    if (!modal) return;

    const miniPanel = modal.querySelector("#mini-panel-configuracion");
    const conceptosLista = modal.querySelector("#conceptos-individuales-lista");
    const empleadoInfo = modal.querySelector("#empleado-info");
    if (!miniPanel || !conceptosLista || !empleadoInfo) return;

    // Show the mini panel
    miniPanel.style.display = "block";

    // Display employee info
    empleadoInfo.textContent = `Empleado: ${empleado.nombre} | Cédula: ${empleado.cedula} | Cargo: ${empleado.cargo}`;

    // Store current employee for reference
    miniPanel.dataset.empleadoId = empleado.cedula || empleado.codigo || empleado.email || empleado.nombre;

    // Get general selected concepts from Step 3
    const conceptosSeleccionados = Array.from(
        modal.querySelectorAll('#conceptos-disponibles input[type="checkbox"]:checked')
    ).map(cb => cb.getAttribute('data-codigo'));

    // Get all concepts from Step 3 (checkboxes)
    const todosConceptos = Array.from(
        modal.querySelectorAll('#conceptos-disponibles input[type="checkbox"]')
    ).map(cb => ({
        codigo: cb.getAttribute('data-codigo'),
        descripcion: cb.nextElementSibling ? cb.nextElementSibling.textContent.trim() : '',
        seleccionadoGeneral: cb.checked
    }));

    // Clear previous list
    conceptosLista.innerHTML = '';

    // Load individual selections if any
    if (!window.asignacionesIndividuales) {
        window.asignacionesIndividuales = {};
    }
    const asignacionEmpleado = window.asignacionesIndividuales[miniPanel.dataset.empleadoId] || {};

    // Render checkboxes for all concepts, marking those selected generally and individual overrides
    todosConceptos.forEach(concepto => {
        const div = document.createElement('div');
        div.className = 'concepto-checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `ind-concepto-${concepto.codigo}`;
        input.dataset.codigo = concepto.codigo;

        // Determine checked state: individual override if exists, else general selection
        if (typeof asignacionEmpleado[concepto.codigo] === 'boolean') {
            input.checked = asignacionEmpleado[concepto.codigo];
        } else {
            input.checked = concepto.seleccionadoGeneral;
        }

        // Add event listener to update window.asignacionesIndividuales on change
        input.addEventListener('change', () => {
            if (!window.asignacionesIndividuales) {
                window.asignacionesIndividuales = {};
            }
            if (!window.asignacionesIndividuales[miniPanel.dataset.empleadoId]) {
                window.asignacionesIndividuales[miniPanel.dataset.empleadoId] = {};
            }
            window.asignacionesIndividuales[miniPanel.dataset.empleadoId][concepto.codigo] = input.checked;
        });

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = `${concepto.descripcion} (${concepto.codigo})`;

        div.appendChild(input);
        div.appendChild(label);
        conceptosLista.appendChild(div);
    });

    // Save and Cancel buttons
    const btnGuardar = miniPanel.querySelector('button.guardar');
    const btnCancelar = miniPanel.querySelector('button.cancelar');

    // Remove previous event listeners if any
    btnGuardar.replaceWith(btnGuardar.cloneNode(true));
    btnCancelar.replaceWith(btnCancelar.cloneNode(true));

    // Re-select buttons after cloning
    const newBtnGuardar = miniPanel.querySelector('button.guardar');
    const newBtnCancelar = miniPanel.querySelector('button.cancelar');

    newBtnGuardar.addEventListener('click', () => {
        // Save individual selections
        const checkboxes = conceptosLista.querySelectorAll('input[type="checkbox"]');
        const nuevasAsignaciones = {};
        checkboxes.forEach(cb => {
            nuevasAsignaciones[cb.dataset.codigo] = cb.checked;
        });
        window.asignacionesIndividuales[miniPanel.dataset.empleadoId] = nuevasAsignaciones;

        // Hide mini panel
        miniPanel.style.display = 'none';

        // Optionally notify user
        mostrarNotificacion(`Configuración guardada para ${empleado.nombre}`, 'success');
    });

    newBtnCancelar.addEventListener('click', () => {
        // Hide mini panel without saving
        miniPanel.style.display = 'none';
    });
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

            // Obtener valores del formulario
            const tipoNomina = modal.querySelector('#modal-tipo-nomina').value;
            const mes = modal.querySelector('#modal-mes').value;
            const anio = modal.querySelector('#modal-anio').value;
            const secuencia = modal.querySelector('#modal-secuencia').value;
            const periodo = modal.querySelector('#modal-periodo').value;
            const fechaCierre = modal.querySelector('#modal-fecha-cierre').value;
            
            // Obtener conceptos seleccionados
            const conceptosSeleccionados = Array.from(
                modal.querySelectorAll('#conceptos-disponibles input[type="checkbox"]:checked')
            ).map(checkbox => checkbox.getAttribute('data-codigo'));

            // Validar que haya al menos un concepto seleccionado
            if (conceptosSeleccionados.length === 0) {
                mostrarNotificacion('Debe seleccionar al menos un concepto de pago', 'error');
                btnImportar.disabled = false;
                btnImportar.innerHTML = '<i class="fas fa-check"></i> Confirmar Importación';
                return;
            }

            // Preparar datos para enviar
            const secuenciaSelect = modal.querySelector('#modal-secuencia');
                    // Remove this block from here and move to modal initialization
                    // if (secuenciaSelect) {
                    //     // Primero obtenemos el campo periodo una sola vez
                    //     const periodoField = modal.querySelector('#modal-periodo');
                        
                    //     // Función para actualizar el periodo
                    //     const actualizarPeriodo = () => {
                    //         const valorSecuencia = secuenciaSelect.value.toUpperCase().trim(); // Convertir a mayúsculas y quitar espacios para comparación
                    //         console.log('actualizarPeriodo called with valorSecuencia:', valorSecuencia);
                            
                    //         // Validación más robusta con comparación exacta
                    //         if (valorSecuencia === 'PRIMERA QUINCENA') {
                    //             periodoField.value = '1';
                    //         } else if (valorSecuencia === 'SEGUNDA QUINCENA') {
                    //             periodoField.value = '2';
                    //         } else {
                    //             // Valor por defecto o manejo de error
                    //             periodoField.value = '1'; 
                    //             console.warn('Valor de secuencia no reconocido:', secuenciaSelect.value);
                    //         }
                            
                    //         console.log('Periodo actualizado a:', periodoField.value); // Para debugging

                    //         // Nueva lógica para checkbox cesta ticket (codigo 8003)
                    //         const conceptosContainer = document.getElementById('conceptos-disponibles');
                    //         if (conceptosContainer) {
                    //             const cestaTicketCheckbox = conceptosContainer.querySelector('input[data-codigo="8003"]');
                    //             console.log('cestaTicketCheckbox found:', cestaTicketCheckbox);
                    //             if (cestaTicketCheckbox) {
                    //                 if (valorSecuencia === 'PRIMERA QUINCENA') {
                    //                     cestaTicketCheckbox.checked = false;
                    //                     cestaTicketCheckbox.disabled = true;
                    //                     console.log('Cesta ticket checkbox disabled and unchecked');
                    //                 } else if (valorSecuencia === 'SEGUNDA QUINCENA') {
                    //                     cestaTicketCheckbox.checked = true;
                    //                     cestaTicketCheckbox.disabled = false;
                    //                     console.log('Cesta ticket checkbox enabled and checked');
                    //                 } else {
                    //                     cestaTicketCheckbox.disabled = false;
                    //                     console.log('Cesta ticket checkbox enabled');
                    //                 }
                    //             }
                    //         } else {
                    //             console.log('conceptosContainer not found');
                    //         }
                    //     };
        
                    //     // Asignar el evento
                    //     secuenciaSelect.addEventListener('change', actualizarPeriodo);
                        
                    //     // Actualizar inmediatamente si ya hay un valor seleccionado
                    //     if (secuenciaSelect.value) {
                    //         actualizarPeriodo();
                    //     }
                    // } // Default to 1 if not found

            // Include individual concept selections per employee
            const asignacionesIndividuales = window.asignacionesIndividuales || {};

            const data = {
                tipo_nomina: tipoNomina,
                mes: mes,
                anio: anio,
                secuencia: secuencia,
                fecha_cierre: fechaCierre,
                conceptos: conceptosSeleccionados,
                periodo: periodo,
                conceptos_individuales: asignacionesIndividuales
            };

            console.log("Datos enviados para generar nómina automática:", data);

            try {
                const response = await fetch('/api/generar_nomina_automatica/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': CSRF_TOKEN
                    },
                    body: JSON.stringify(data)
                });

                const resultado = await response.json();

                if (!response.ok) {
                    throw new Error(resultado.error || 'Error al generar nómina');
                }

                const mensajeDetallado = crearMensajeDetallado({
                    message: resultado.message || 'Nómina generada exitosamente',
                    stats: resultado.stats || {
                        empleados_procesados: 0,
                        conceptos_generados: 0,
                        errores: 0
                    },
                    conceptos: conceptosSeleccionados
                });

                await mostrarNotificacionDetallada(mensajeDetallado);
                await actualizarTablaNominas();
                setTimeout(cerrarModal, 1500);

            } catch (error) {
                console.error("Error al generar nómina:", error);
                mostrarNotificacion(`Error al generar nómina: ${error.message}`, 'error');
            } finally {
                btnImportar.disabled = false;
                btnImportar.innerHTML = '<i class="fas fa-check"></i> Confirmar Importación';
            }
        });
    }
}

// Función auxiliar para crear el mensaje HTML
function crearMensajeDetallado(resultado) {
    const conceptosLista = resultado.conceptos && resultado.conceptos.length > 0 
        ? resultado.conceptos.map(codigo => {
            const checkbox = document.querySelector(`input[data-codigo="${codigo}"]`);
            return checkbox ? checkbox.nextElementSibling.textContent.trim() : codigo;
        }).join(', ')
        : 'Ningún concepto seleccionado';

    return `
        <div class="notificacion-detallada">
            <div class="notificacion-titulo">${resultado.message || 'Proceso completado'}</div>
            <div class="notificacion-contenido">
                <div class="notificacion-seccion">
                    <h4>Resumen de Importación</h4>
                    <ul class="notificacion-lista">
                        <li><strong>Empleados procesados:</strong> ${resultado.stats.empleados_procesados || 0}</li>
                        <li><strong>Recibos generados:</strong> ${resultado.stats.recibos_generados || 0}</li>
                        <li><strong>Conceptos aplicados:</strong> ${conceptosLista}</li>
                        <li class="texto-exito">Proceso completado</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Función para mostrar notificación con estilos
async function mostrarNotificacionDetallada(mensaje) {
    const style = document.createElement('style');
    style.textContent = `
        .notificacion-detallada {
            font-family: Arial, sans-serif;
            max-width: 500px;
        }
        .notificacion-titulo {
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #155724;
        }
        .notificacion-contenido {
            margin-top: 10px;
        }
        .notificacion-seccion {
            margin-bottom: 10px;
        }
        .notificacion-seccion h4 {
            margin: 5px 0;
            font-size: 1.1em;
            color: #333;
        }
        .notificacion-lista {
            padding-left: 20px;
            margin: 5px 0;
        }
        .notificacion-lista li {
            margin-bottom: 5px;
        }
        .texto-exito {
            color: #28a745;
        }
    `;
    document.head.appendChild(style);
    
    return mostrarNotificacion(mensaje, 'success', true);
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
            const errorText = await response.text();
            throw new Error(errorText || 'Error en la importación');
        }
        
        return await response.json();
        
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

function mostrarNotificacion(mensaje, tipo, html = false) {
    console.log("Mostrando notificación:", {mensaje, tipo, html}); // Depuración
    
    // Asegurarse de que SweetAlert2 esté cargado correctamente
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

        // Forzar el renderizado de HTML si es necesario
        return Swal.fire(options).then(result => {
            console.log("Notificación mostrada", result);
            return result;
        });
    } else {
        console.error('SweetAlert2 no está disponible');
        // Fallback mejorado
        const div = document.createElement('div');
        div.innerHTML = `<div style="padding: 20px; background: ${tipo === 'success' ? '#d4edda' : '#f8d7da'}; 
                        color: ${tipo === 'success' ? '#155724' : '#721c24'}; border-radius: 5px;">
            <strong>${tipo === 'success' ? 'Éxito' : 'Error'}:</strong> ${mensaje}
        </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos estáticos (filtros)
    inicializarEventosBusqueda();
    // Cargar datos iniciales
    aplicarFiltros();
});

// ===== FUNCIÓN DE INICIALIZACIÓN MEJORADA =====

// Move actualizarPeriodo outside to global scope
function actualizarPeriodo() {
    const modal = document.getElementById("importarnominaModal");
    if (!modal) return;

    const secuenciaSelect = modal.querySelector('#modal-secuencia');
    const periodoField = modal.querySelector('#modal-periodo');
    if (!secuenciaSelect || !periodoField) return;

    const valorSecuencia = secuenciaSelect.value.toUpperCase().trim();
    console.log('actualizarPeriodo called with valorSecuencia:', valorSecuencia);

    if (valorSecuencia === 'PRIMERA QUINCENA') {
        periodoField.value = '1';
    } else if (valorSecuencia === 'SEGUNDA QUINCENA') {
        periodoField.value = '2';
    } else {
        periodoField.value = '1';
        console.warn('Valor de secuencia no reconocido:', secuenciaSelect.value);
    }

    console.log('Periodo actualizado a:', periodoField.value);

    const conceptosContainer = document.getElementById('conceptos-disponibles');
    if (conceptosContainer) {
        const cestaTicketCheckbox = conceptosContainer.querySelector('input[data-codigo="8003"]');
        console.log('cestaTicketCheckbox found:', cestaTicketCheckbox);
        if (cestaTicketCheckbox) {
            if (valorSecuencia === 'PRIMERA QUINCENA') {
                cestaTicketCheckbox.checked = false;
                cestaTicketCheckbox.disabled = true;
                console.log('Cesta ticket checkbox disabled and unchecked');
            } else if (valorSecuencia === 'SEGUNDA QUINCENA') {
                cestaTicketCheckbox.checked = true;
                cestaTicketCheckbox.disabled = false;
                console.log('Cesta ticket checkbox enabled and checked');
            } else {
                cestaTicketCheckbox.disabled = false;
                console.log('Cesta ticket checkbox enabled');
            }
        }
    } else {
        console.log('conceptosContainer not found');
    }
}

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

    // 5. Attach actualizarPeriodo event listener to secuencia select here
    const modal = document.getElementById("importarnominaModal");
    if (modal) {
        const secuenciaSelect = modal.querySelector('#modal-secuencia');
        if (secuenciaSelect) {
            secuenciaSelect.addEventListener('change', actualizarPeriodo);
            if (secuenciaSelect.value) {
                actualizarPeriodo();
            }
        }
    }
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


// Verificar y cargar SweetAlert2 correctamente
if (typeof window.Swal !== 'undefined') {
    Swal = window.Swal;
} else if (typeof swal !== 'undefined') {
    Swal = swal;
} else {
    console.error('SweetAlert2 no está cargado correctamente');
    // Cargar dinámicamente si es necesario
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => {
        Swal = window.Swal;
    };
    document.head.appendChild(script);
}
