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
            });
            registrarAsistenciaModal__cerrar();
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
function fetchAsistencias() {
    fetch('/api/asistencias_listar/')  // Use the correct URL here
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

// Call fetchAsistencias when the page loads
document.addEventListener('DOMContentLoaded', fetchAsistencias);

function submitJustificacionForm() {
    // Get the form values
    var empleado = document.getElementById("justificacion-empleado").value;
    var falta = document.getElementById("justificacion-falta").value;
    var motivo = document.getElementById("justificacion-tipo").value;
    var documento = document.getElementById("justificacion-documento").files[0];
    var notas = document.getElementById("justificacion-notas").value;

    // Create the data object
    var formData = new FormData();
    formData.append('empleado', empleado);
    formData.append('falta', falta);
    formData.append('motivo', motivo);
    if (documento) {
        formData.append('documento', documento);
    }
    formData.append('notas', notas);

    // Send the data to the API
    fetch('/api/justificaciones/', {
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
                text: 'Justificación registrada correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            registrarJustificacionModal__cerrar();
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
