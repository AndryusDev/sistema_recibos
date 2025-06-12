function submitAsistenciaForm() {
    // Get the form values
    var empleado = document.getElementById("asistencia-empleado").value;
    var fecha = document.getElementById("asistencia-fecha").value;
    var hora_entrada = document.getElementById("asistencia-hora-entrada").value;
    var hora_salida = document.getElementById("asistencia-hora-salida").value;
    var estado = document.getElementById("asistencia-estado").value;
    var notas = document.getElementById("asistencia-notas").value;

    // Create the data object
    var data = {
        empleado: empleado,
        fecha: fecha,
        hora_entrada: hora_entrada,
        hora_salida: hora_salida,
        estado: estado,
        notas: notas
    };

    // Send the data to the API
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
        // Handle the response
        if (data.success) {
            Swal.fire({
                title: 'Éxito',
                text: 'Asistencia registrada correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                fetchAsistencias(); // Refresh the attendance table
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

// Function to fetch and display asistencias
function fetchAsistencias(filters = {}) {
    const params = new URLSearchParams(filters);
    fetch(`/api/asistencias_listar/?${params.toString()}`)  // Use the correct URL here
        .then(response => response.json())
        .then(data => {
            const tablaAsistencias = document.getElementById('cuerpoTablaAsistencias');
            tablaAsistencias.innerHTML = ''; // Clear existing table rows

            if (data.length > 0) {
                data.forEach(asistencia => {
                    const row = tablaAsistencias.insertRow();
                    row.innerHTML = `
                        <td>${asistencia.empleado}</td>
                        <td>${asistencia.fecha}</td>
                        <td>${asistencia.hora_inicio}</td>
                        <td>${asistencia.hora_fin}</td>
                        <td>${asistencia.observaciones}</td>
                        <td></td>  // Add action buttons here if needed
                    `;
                });
            } else {
                tablaAsistencias.innerHTML = '<tr><td colspan="5">No se encontraron asistencias.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching asistencias:', error);
            const tablaAsistencias = document.getElementById('cuerpoTablaAsistencias');
            tablaAsistencias.innerHTML = '<tr><td colspan="5">Error al cargar las asistencias.</td></tr>';
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

// Call fetchAsistencias when the page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchAsistencias();

    const empleadoSelect = document.getElementById('justificacion-empleado');
    empleadoSelect.addEventListener('change', function() {
        const cedula = this.value;
        fetchFaltasJustificables(cedula);
    });


    // Function to handle filtering
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

    // Add event listeners to the filter button
    const filterButton = document.getElementById('btn-aplicar-filtros-asistencia');
    filterButton.addEventListener('click', handleAsistenciaFilter);

    // Add event listeners to the filter input fields for Enter key
    const filterInputs = document.querySelectorAll('.busqueda-input');
    filterInputs.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAsistenciaFilter();
            }
        });
    });
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
        Swal.fire({title: 'Éxito', text: data.message, icon: 'success'});
        registrarJustificacionModal__cerrar();
    })
    .catch(error => {
        Swal.fire({title: 'Error', text: error.message, icon: 'error'});
    });
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
            'Content-Type': 'application/json',
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
