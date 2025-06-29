function submitAsistenciaForm() {
    // Get the form values
    var empleado = document.getElementById("asistencia-empleado").value;
    var fechaInicio = document.getElementById("asistencia-fecha-inicio").value;
    var fechaFin = document.getElementById("asistencia-fecha-fin").value;
    var estado = document.getElementById("asistencia-estado").value;
    var notas = document.getElementById("asistencia-notas").value;

    if (!empleado) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor ingrese el empleado.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    if (!fechaInicio) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor ingrese la fecha de falta inicial.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    if (!fechaFin) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor ingrese la fecha final.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    if (fechaFin < fechaInicio) {
        Swal.fire({
            title: 'Error',
            text: 'La fecha final debe ser igual o posterior a la fecha inicial.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Create the data object
    var data = {
        empleado: empleado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: estado,
        notas: notas
    };

    // Send the data to the API
    fetch('/api/asistencias/batch_faltas/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': CSRF_TOKEN
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response
        if (data.success) {
            Swal.fire({
                title: 'Éxito',
                text: 'Faltas registradas correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                fetchAsistencias(); // Refresh the attendance table
                registrarAsistenciaModal__cerrar();
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo registrar las faltas.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    })
    .catch(error => {
        Swal.fire({
            title: 'Error',
            text: 'Error al registrar las faltas.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        console.error('Error:', error);
    });
}

function fetchAsistencias(filters = {}) {
    const params = new URLSearchParams(filters);
    fetch(`/api/asistencias_listar/?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            const tablaAsistencias = document.getElementById('cuerpoTablaAsistencias');
            tablaAsistencias.innerHTML = '';

            if (data.length > 0) {
                data.forEach(asistencia => {
                    const row = tablaAsistencias.insertRow();

                    // Create action buttons: View Document and Edit
                    const viewDocButton = document.createElement('button');
                    viewDocButton.className = 'tabla-recibos__boton btn-ver-documento';
                    viewDocButton.innerHTML = '<i class="fas fa-file-alt"></i> Ver Documento';
                    viewDocButton.title = 'Ver Documento';
                    viewDocButton.onclick = () => {
                        if (asistencia.documento_url) {
                            window.open(asistencia.documento_url, '_blank');
                        } else {
                            alert('No hay documento disponible para esta asistencia.');
                        }
                    };

                    const editButton = document.createElement('button');
                    editButton.className = 'tabla-recibos__boton btn-editar';
                    editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
                    editButton.title = 'Editar Asistencia';
                    editButton.onclick = () => {
                        openEditAsistenciaModal(asistencia);
                    };

                    const actionCell = document.createElement('td');
                    actionCell.appendChild(viewDocButton);
                    actionCell.appendChild(editButton);

                    row.innerHTML = `
                        <td>${asistencia.empleado}</td>
                        <td>${asistencia.estado}</td>
                        <td>${asistencia.fecha}</td>
                        <td>${asistencia.hora_inicio}</td>
                        <td>${asistencia.hora_fin}</td>
                        <td>${asistencia.observaciones}</td>
                    `;
                    row.appendChild(actionCell);
                });
            } else {
                tablaAsistencias.innerHTML = '<tr><td colspan="7">No se encontraron asistencias.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching asistencias:', error);
            const tablaAsistencias = document.getElementById('cuerpoTablaAsistencias');
            tablaAsistencias.innerHTML = '<tr><td colspan="7">Error al cargar las asistencias.</td></tr>';
        });
}

function fetchFaltasJustificables(cedula) {
    fetch(`/api/get_faltas_justificables/?cedula=${cedula}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener las faltas');
        }
        return response.json();
    })
    .then(data => {
        const selectFaltas = document.getElementById('justificacion-falta');
        selectFaltas.innerHTML = '<option value="">-- Seleccione una falta --</option>';
        
        if (data.length > 0) {
            data.forEach(falta => {
                const option = document.createElement('option');
                option.value = falta.id;
                option.textContent = `Falta del ${falta.fecha} (${falta.hora_entrada || 'Sin hora'} - ${falta.hora_salida || 'Sin hora'}) - ${falta.observaciones || 'Sin observaciones'}`;
                selectFaltas.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay faltas justificables para este empleado';
            selectFaltas.appendChild(option);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las faltas justificables',
            icon: 'error'
        });
    });
}

function fetchJustificaciones(filters = {}) {
    const params = new URLSearchParams(filters);
    fetch(`/justificacion/?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            const tablaJustificaciones = document.getElementById('cuerpoTablaJustificaciones');
            tablaJustificaciones.innerHTML = ''; // Clear existing table rows

            if (data.length > 0) {
                data.forEach(justificacion => {
                    const aprobadoPor = justificacion.aprobado_por ? justificacion.aprobado_por : 'N/A';
                    const fechaAprobacion = justificacion.fecha_aprobacion ? justificacion.fecha_aprobacion : 'N/A';
                    const documentoLink = justificacion.documento_url ? 
                        `<a href="\${justificacion.documento_url}" target="_blank">Ver documento</a>` : 'No disponible';

                    const row = tablaJustificaciones.insertRow();

                    // Create Edit button
                    const editButton = document.createElement('button');
                    editButton.className = 'tabla-recibos__boton btn-editar';
                    editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
                    editButton.title = 'Editar Justificación';
                    editButton.onclick = () => {
                        openEditJustificacionModal(justificacion);
                    };

                    const actionCell = document.createElement('td');
                    actionCell.innerHTML = documentoLink;
                    actionCell.appendChild(editButton);

                    row.innerHTML = `
                        <td>${justificacion.empleado_cedula || ''}</td>
                        <td>${justificacion.fecha_asistencia || ''}</td>
                        <td>${justificacion.tipo || ''}</td>
                        <td>${justificacion.descripcion || ''}</td>
                        <td>${justificacion.fecha_creacion || ''}</td>
                    `;
                    row.appendChild(actionCell);
                });
            } else {
                tablaJustificaciones.innerHTML = '<tr><td colspan="7">No se encontraron justificaciones.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching justificaciones:', error);
            const tablaJustificaciones = document.getElementById('cuerpoTablaJustificaciones');
            tablaJustificaciones.innerHTML = '<tr><td colspan="7">Error al cargar las justificaciones.</td></tr>';
        });
}

/*usar posteriormentee para mostrar informacion*/                        /*<td>${aprobadoPor}</td>
                        <td>${fechaAprobacion}</td>*/

/* Placeholder functions for opening edit modals - to be implemented */
function openEditAsistenciaModal(asistencia) {
    alert('Abrir modal para editar asistencia: ' + JSON.stringify(asistencia));
}

function openEditJustificacionModal(justificacion) {
    alert('Abrir modal para editar justificación: ' + JSON.stringify(justificacion));
}

// Call fetchAsistencias and fetchJustificaciones when the page loads

function registrarAsistenciaModal__abrir() {
    clearAsistenciaForm();
    document.getElementById("registrarAsistenciaModal").style.display = "flex";
}

function registrarAsistenciaModal__cerrar() {
    document.getElementById("registrarAsistenciaModal").style.display = "none";
}

function registrarJustificacionModal__abrir() {
    clearJustificacionForm();
    document.getElementById("registrarJustificacionModal").style.display = "flex";
}

function registrarJustificacionModal__cerrar() {
    document.getElementById("registrarJustificacionModal").style.display = "none";
}

function registrarVPLModal__abrir() {
    document.getElementById("registrarVPLModal").style.display = "flex";
}

function registrarVPLModal__cerrar() {
    document.getElementById("registrarVPLModal").style.display = "none";
}

// Inicialización de eventos
function initializeAsistencias() {
    // Cargar datos iniciales
    fetchAsistencias();
    fetchJustificaciones();

    // Configurar eventos del empleado para justificaciones
    const empleadoSelect = document.getElementById('justificacion-empleado');
    if (empleadoSelect) {
        empleadoSelect.addEventListener('change', function() {
            const cedula = this.value;
            fetchFaltasJustificables(cedula);
        });
    }

    // Configurar eventos del tipo VPL para mostrar/ocultar documento
    const vplTipoSelect = document.getElementById('vpl-tipo');
    if (vplTipoSelect) {
        vplTipoSelect.addEventListener('change', function() {
            const documentoGroup = document.getElementById('vpl-documento-group');
            if (this.value === 'licencia') {
                documentoGroup.style.display = 'block';
            } else {
                documentoGroup.style.display = 'none';
            }
        });
    }

    // Función para manejar filtros de asistencias
    function handleAsistenciaFilter() {
        const empleado = document.getElementById('filtro-empleado-asistencia').value;
        const fechaInicio = document.getElementById('filtro-fecha-inicio-asistencia').value;
        const fechaFin = document.getElementById('filtro-fecha-fin-asistencia').value;

        const filters = {};
        filters.cedula = empleado;
        if (fechaInicio) {
            filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
        }
        if (fechaFin) {
            filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);
        }

        fetchAsistencias(filters);
    }

    // Eventos para filtros de asistencias
    const filterButton = document.getElementById('btn-aplicar-filtros-asistencia');
    if (filterButton) {
        filterButton.addEventListener('click', handleAsistenciaFilter);
    }

    const filterInputs = document.querySelectorAll('.busqueda-input');
    filterInputs.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAsistenciaFilter();
            }
        });
    });

    // Eventos para filtros de justificaciones
    const filterButtonJustificaciones = document.getElementById('btn-aplicar-filtros-justificacion');
    if (filterButtonJustificaciones) {
        filterButtonJustificaciones.addEventListener('click', () => {
            const cedula = document.getElementById('filtro-empleado-justificacion').value;
            const fechaInicio = document.getElementById('filtro-fecha-inicio-justificacion').value;
            const fechaFin = document.getElementById('filtro-fecha-fin-justificacion').value;
            const estado = document.getElementById('filtro-estado-justificacion').value;

            const filters = {};
            if (cedula) filters.cedula = cedula;
            if (fechaInicio) filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
            if (fechaFin) filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);
            if (estado) filters.estado = estado;

            fetchJustificaciones(filters);
        });
    }

    // Eventos para botones de guardar en modales
    const btnGuardarAsistencia = document.querySelector('#registrarAsistenciaModal .btn-guardar');
    if (btnGuardarAsistencia) {
        btnGuardarAsistencia.addEventListener('click', submitAsistenciaForm);
    }

    const btnGuardarJustificacion = document.querySelector('#registrarJustificacionModal .btn-guardar');
    if (btnGuardarJustificacion) {
        btnGuardarJustificacion.addEventListener('click', submitJustificacionForm);
    }

    const btnGuardarVPL = document.querySelector('#registrarVPLModal .btn-guardar');
    if (btnGuardarVPL) {
        btnGuardarVPL.addEventListener('click', submitVPLForm);
    }
}

// Exportar funciones al ámbito global
window.initializeAsistencias = initializeAsistencias;
window.registrarAsistenciaModal__abrir = registrarAsistenciaModal__abrir;
window.registrarAsistenciaModal__cerrar = registrarAsistenciaModal__cerrar;
window.registrarJustificacionModal__abrir = registrarJustificacionModal__abrir;
window.registrarJustificacionModal__cerrar = registrarJustificacionModal__cerrar;
window.registrarVPLModal__abrir = registrarVPLModal__abrir;
window.registrarVPLModal__cerrar = registrarVPLModal__cerrar;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeAsistencias();
});

function submitJustificacionForm() {
    const faltaId = document.getElementById("justificacion-falta").value;
    const tipo = document.getElementById("justificacion-tipo").value;
    const descripcion = document.getElementById("justificacion-notas").value;

    if (!faltaId || !tipo) {
        Swal.fire({title: 'Error', text: 'Seleccione una falta y el tipo', icon: 'error'});
        return;
    }


    const formData = new FormData();
    formData.append('falta', faltaId);
    formData.append('tipo', tipo);
    formData.append('descripcion', descripcion);  // Nombre alineado con el modelo
    
    const documento = document.getElementById("justificacion-documento").files[0];
    if (documento) formData.append('documento', documento);

    fetch('/api/justificaciones/', {
        method: 'POST',
        headers: {'X-CSRFToken': CSRF_TOKEN},
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) throw new Error(data.message);
        Swal.fire({title: 'Éxito', text: data.message, icon: 'success'}).then(() => {
            registrarJustificacionModal__cerrar();
            clearJustificacionForm();
            fetchJustificaciones();
        });
    })
    .catch(error => {
        Swal.fire({title: 'Error', text: error.message, icon: 'error'});
    });
}

function clearAsistenciaForm() {
    document.getElementById("asistencia-empleado").value = "";
    document.getElementById("asistencia-fecha-inicio").value = "";
    document.getElementById("asistencia-fecha-fin").value = "";
    // Removed hora_entrada and hora_salida as they are no longer in the form
    document.getElementById("asistencia-estado").value = "F";
    document.getElementById("asistencia-notas").value = "";
}

function clearJustificacionForm() {
    document.getElementById("justificacion-empleado").value = "";
    document.getElementById("justificacion-falta").innerHTML = '<option value="">-- Seleccione una falta --</option>';
    document.getElementById("justificacion-tipo").value = "";
    document.getElementById("justificacion-documento").value = "";
    document.getElementById("justificacion-notas").value = "";
}

function clearVPLForm() {
    document.getElementById("vpl-empleado").value = "";
    document.getElementById("vpl-tipo").value = "vacaciones";
    document.getElementById("vpl-fecha-inicio").value = "";
    document.getElementById("vpl-fecha-fin").value = "";
    document.getElementById("vpl-notas").value = "";
    document.getElementById("vpl-documento").value = "";
    document.getElementById("vpl-documento-group").style.display = "none";
}

function initializeAsistencias() {
    // Cargar datos iniciales
    fetchAsistencias();
    fetchJustificaciones();

    // Configurar eventos del empleado para justificaciones
    const empleadoSelect = document.getElementById('justificacion-empleado');
    if (empleadoSelect) {
        empleadoSelect.addEventListener('change', function() {
            const cedula = this.value;
            fetchFaltasJustificables(cedula);
        });
    }

    // Configurar eventos del tipo VPL para mostrar/ocultar documento
    const vplTipoSelect = document.getElementById('vpl-tipo');
    if (vplTipoSelect) {
        vplTipoSelect.addEventListener('change', function() {
            const documentoGroup = document.getElementById('vpl-documento-group');
            if (this.value === 'licencia') {
                documentoGroup.style.display = 'block';
            } else {
                documentoGroup.style.display = 'none';
            }
        });
    }

    // Función para manejar filtros de asistencias
    function handleAsistenciaFilter() {
        const empleado = document.getElementById('filtro-empleado-asistencia').value;
        const fechaInicio = document.getElementById('filtro-fecha-inicio-asistencia').value;
        const fechaFin = document.getElementById('filtro-fecha-fin-asistencia').value;

        const filters = {};
        filters.cedula = empleado;
        if (fechaInicio) {
            filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
        }
        if (fechaFin) {
            filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);
        }

        fetchAsistencias(filters);
    }

    // Eventos para filtros de asistencias
    const filterButton = document.getElementById('btn-aplicar-filtros-asistencia');
    if (filterButton) {
        filterButton.addEventListener('click', handleAsistenciaFilter);
    }

    const filterInputs = document.querySelectorAll('.busqueda-input');
    filterInputs.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAsistenciaFilter();
            }
        });
    });

    // Eventos para filtros de justificaciones
    const filterButtonJustificaciones = document.getElementById('btn-aplicar-filtros-justificacion');
    if (filterButtonJustificaciones) {
        filterButtonJustificaciones.addEventListener('click', () => {
            const cedula = document.getElementById('filtro-empleado-justificacion').value;
            const fechaInicio = document.getElementById('filtro-fecha-inicio-justificacion').value;
            const fechaFin = document.getElementById('filtro-fecha-fin-justificacion').value;
            const estado = document.getElementById('filtro-estado-justificacion').value;

            const filters = {};
            if (cedula) filters.cedula = cedula;
            if (fechaInicio) filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
            if (fechaFin) filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);
            if (estado) filters.estado = estado;

            fetchJustificaciones(filters);
        });
    }

    // Eventos para botones de guardar en modales
    const btnGuardarAsistencia = document.querySelector('#registrarAsistenciaModal .btn-guardar');
    if (btnGuardarAsistencia) {
        btnGuardarAsistencia.addEventListener('click', submitAsistenciaForm);
    }

    const btnGuardarJustificacion = document.querySelector('#registrarJustificacionModal .btn-guardar');
    if (btnGuardarJustificacion) {
        btnGuardarJustificacion.addEventListener('click', submitJustificacionForm);
    }

    const btnGuardarVPL = document.querySelector('#registrarVPLModal .btn-guardar');
    if (btnGuardarVPL) {
        btnGuardarVPL.addEventListener('click', submitVPLForm);
    }

    // Hook clear form on modal close buttons
    const btnCancelarAsistencia = document.getElementById("btn-cancelar-registrar-asistencia");
    if (btnCancelarAsistencia) {
        btnCancelarAsistencia.addEventListener("click", () => {
            clearAsistenciaForm();
            registrarAsistenciaModal__cerrar();
        });
    }

    const btnCancelarJustificacion = document.getElementById("btn-cancelar-registrar-justificacion");
    if (btnCancelarJustificacion) {
        btnCancelarJustificacion.addEventListener("click", () => {
            clearJustificacionForm();
            registrarJustificacionModal__cerrar();
        });
    }

    const btnCancelarVPL = document.getElementById("btn-cancelar-registrar-vpl");
    if (btnCancelarVPL) {
        btnCancelarVPL.addEventListener("click", () => {
            clearVPLForm();
            registrarVPLModal__cerrar();
        });
    }
}
function submitVPLForm() {
    // Get the form values
    var empleado = document.getElementById("vpl-empleado").value;
    var tipo = document.getElementById("vpl-tipo").value;
    var fecha_inicio = document.getElementById("vpl-fecha-inicio").value;
    var fecha_fin = document.getElementById("vpl-fecha-fin").value;
    var notas = document.getElementById("vpl-notas").value;
    var documento = document.getElementById("vpl-documento").files[0];

    // Create the data object
    var formData = new FormData();
    formData.append('empleado', empleado);
    formData.append('tipo', tipo);
    formData.append('fecha_inicio', fecha_inicio);
    formData.append('fecha_fin', fecha_fin);
    formData.append('notas', notas);
    if (documento) {
        formData.append('documento', documento);
    }

    // Send the data to the API
    fetch('/api/vpl/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': CSRF_TOKEN
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response
        if (data.success) {
            Swal.fire({
                title: 'Éxito',
                text: 'Vacaciones, permiso o licencia registrado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            registrarVPLModal__cerrar();
        } else {
            Swal.fire({
                title: 'Error',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}
