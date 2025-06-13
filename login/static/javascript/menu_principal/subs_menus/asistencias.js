function initializeAsistencias() {
    // Obtener token CSRF
    const CSRF_TOKEN = getCookie('csrftoken');

    // Función para obtener cookie CSRF (la misma que en vacaciones_permisos.js)
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

    // Función para enviar asistencia
    function submitAsistenciaForm() {
        const empleado = document.getElementById("asistencia-empleado").value;
        const fecha = document.getElementById("asistencia-fecha").value;
        const hora_entrada = document.getElementById("asistencia-hora-entrada").value;
        const hora_salida = document.getElementById("asistencia-hora-salida").value;
        const estado = document.getElementById("asistencia-estado").value;
        const notas = document.getElementById("asistencia-notas").value;

        const data = {
            empleado: empleado,
            fecha: fecha,
            hora_entrada: hora_entrada,
            hora_salida: hora_salida,
            estado: estado,
            notas: notas
        };

        fetch('/api/asistencias/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Asistencia registrada correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    fetchAsistencias();
                    registrarAsistenciaModal__cerrar();
                });
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

    // Función para cargar asistencias
    function fetchAsistencias(filters = {}) {
        const params = new URLSearchParams(filters);
        fetch(`/api/asistencias_listar/?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                const tablaAsistencias = document.getElementById('cuerpoTablaAsistencias');
                if (!tablaAsistencias) return;
                
                tablaAsistencias.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(asistencia => {
                        const row = tablaAsistencias.insertRow();

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
                if (tablaAsistencias) {
                    tablaAsistencias.innerHTML = '<tr><td colspan="7">Error al cargar las asistencias.</td></tr>';
                }
            });
    }

    // Función para cargar faltas justificables
    function fetchFaltasJustificables(cedula) {
        fetch(`/api/get_faltas_justificables/?cedula=${cedula}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener las faltas');
            return response.json();
        })
        .then(data => {
            const selectFaltas = document.getElementById('justificacion-falta');
            if (!selectFaltas) return;
            
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

    // Función para cargar justificaciones
    function fetchJustificaciones(filters = {}) {
        const params = new URLSearchParams(filters);
        fetch(`/justificacion/?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                const tablaJustificaciones = document.getElementById('cuerpoTablaJustificaciones');
                if (!tablaJustificaciones) return;
                
                tablaJustificaciones.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(justificacion => {
                        const documentoLink = justificacion.documento_url ? 
                            `<a href="${justificacion.documento_url}" target="_blank">Ver documento</a>` : 'No disponible';

                        const row = tablaJustificaciones.insertRow();

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
                if (tablaJustificaciones) {
                    tablaJustificaciones.innerHTML = '<tr><td colspan="7">Error al cargar las justificaciones.</td></tr>';
                }
            });
    }

    // Función para enviar justificación
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
        formData.append('descripcion', descripcion);
        
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
            Swal.fire({title: 'Éxito', text: data.message, icon: 'success'});
            registrarJustificacionModal__cerrar();
        })
        .catch(error => {
            Swal.fire({title: 'Error', text: error.message, icon: 'error'});
        });
    }

    // Función para enviar VPL
    function submitVPLForm() {
        const empleado = document.getElementById("vpl-empleado").value;
        const tipo = document.getElementById("vpl-tipo").value;
        const fecha_inicio = document.getElementById("vpl-fecha-inicio").value;
        const fecha_fin = document.getElementById("vpl-fecha-fin").value;
        const notas = document.getElementById("vpl-notas").value;
        const documento = document.getElementById("vpl-documento").files[0];

        const formData = new FormData();
        formData.append('empleado', empleado);
        formData.append('tipo', tipo);
        formData.append('fecha_inicio', fecha_inicio);
        formData.append('fecha_fin', fecha_fin);
        formData.append('notas', notas);
        if (documento) formData.append('documento', documento);

        fetch('/api/vpl/', {
            method: 'POST',
            headers: {'X-CSRFToken': CSRF_TOKEN},
            body: formData
        })
        .then(response => response.json())
        .then(data => {
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

    // Funciones para abrir modales de edición (placeholders)
    function openEditAsistenciaModal(asistencia) {
        console.log('Abrir modal para editar asistencia:', asistencia);
        // Implementar lógica de apertura de modal aquí
    }

    function openEditJustificacionModal(justificacion) {
        console.log('Abrir modal para editar justificación:', justificacion);
        // Implementar lógica de apertura de modal aquí
    }

    // Función para manejar filtros de asistencia
    function handleAsistenciaFilter() {
        const empleado = document.getElementById('filtro-empleado-asistencia')?.value;
        const fechaInicio = document.getElementById('filtro-fecha-inicio-asistencia')?.value;
        const fechaFin = document.getElementById('filtro-fecha-fin-asistencia')?.value;

        const filters = {};
        if (empleado) filters.cedula = empleado;
        if (fechaInicio) filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
        if (fechaFin) filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);

        fetchAsistencias(filters);
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Selector de empleado para faltas justificables
        const empleadoSelect = document.getElementById('justificacion-empleado');
        if (empleadoSelect) {
            empleadoSelect.addEventListener('change', function() {
                const cedula = this.value;
                fetchFaltasJustificables(cedula);
            });
        }

        // Filtros de asistencias
        const filterButton = document.getElementById('btn-aplicar-filtros-asistencia');
        if (filterButton) {
            filterButton.addEventListener('click', handleAsistenciaFilter);
        }

        // Filtros con tecla Enter
        const filterInputs = document.querySelectorAll('.busqueda-input');
        filterInputs.forEach(input => {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    handleAsistenciaFilter();
                }
            });
        });

        // Filtros de justificaciones
        const filterButtonJustificaciones = document.getElementById('btn-aplicar-filtros-justificacion');
        if (filterButtonJustificaciones) {
            filterButtonJustificaciones.addEventListener('click', () => {
                const cedula = document.getElementById('filtro-empleado-justificacion')?.value;
                const fechaInicio = document.getElementById('filtro-fecha-inicio-justificacion')?.value;
                const fechaFin = document.getElementById('filtro-fecha-fin-justificacion')?.value;
                const estado = document.getElementById('filtro-estado-justificacion')?.value;

                const filters = {};
                if (cedula) filters.cedula = cedula;
                if (fechaInicio) filters.fecha_inicio = new Date(fechaInicio).toISOString().slice(0, 10);
                if (fechaFin) filters.fecha_fin = new Date(fechaFin).toISOString().slice(0, 10);
                if (estado) filters.estado = estado;

                fetchJustificaciones(filters);
            });
        }
    }

    // Función de inicialización
    function init() {
        setupEventListeners();
        fetchAsistencias();
        fetchJustificaciones();
    }

    // Iniciar el módulo
    init();
}

// Exponer la función al ámbito global
window.initializeAsistencias = initializeAsistencias;