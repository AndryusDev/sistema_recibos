function initializeVacacionesPermisos() {
    const tablaRegistros = document.getElementById('tablaVacacionesPermisos')?.getElementsByTagName('tbody')[0];
    const btnBuscar = document.getElementById('btn-buscar-vacaciones-permisos');
    const btnLimpiar = document.getElementById('btn-limpiar-vacaciones-permisos');
    const formRegistro = document.getElementById('formRegistroVacacionesPermisos');

    // Función para cargar registros desde la API
    async function cargarRegistros() {
        if (!tablaRegistros) return;
        try {
            const response = await fetch('/api/vacaciones_permisos/listar/');
            const data = await response.json();
            if (data.success) {
                tablaRegistros.innerHTML = '';
                if (data.registros.length === 0) {
                    tablaRegistros.innerHTML = '<tr><td colspan="6" class="text-center">No hay registros disponibles</td></tr>';
                    return;
                }
                data.registros.forEach(registro => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${registro.empleado}</td>
                        <td>${registro.fecha_inicio}</td>
                        <td>${registro.fecha_fin}</td>
                        <td>${registro.tipo}</td>
                        <td>${registro.aprobado_por || ''}</td>
                        <td>${registro.documento_url ? `<a href="${registro.documento_url}" target="_blank">Ver documento</a>` : ''}</td>
                    `;
                    if (registro.tipo.toLowerCase().includes('especial')) {
                        fila.classList.add('permiso-especial');
                    }
                    tablaRegistros.appendChild(fila);
                });
            } else {
                alert('Error al cargar registros: ' + data.error);
            }
        } catch (error) {
            console.error('Error al cargar registros:', error);
            alert('Error al cargar registros');
        }
    }

    // Función para limpiar el formulario
    function limpiarFormulario() {
        if (formRegistro) formRegistro.reset();
    }

    // Función para enviar el formulario
    async function enviarFormulario(event) {
        event.preventDefault();
        const form = event.target;
        if (!form) return;
        const formData = new FormData(form);
        const tipo = formData.get('tipo');
        const empleado_cedula = formData.get('empleado_cedula');
        const fecha_inicio = formData.get('fecha_inicio');
        const fecha_fin = formData.get('fecha_fin');
        /*const aprobado_por_cedula = formData.get('aprobado_por_cedula');*/
        const motivo = formData.get('motivo');

        if (!tipo || !empleado_cedula || !fecha_inicio || !fecha_fin) {
            alert('Por favor complete todos los campos obligatorios.');
            return;
        }

        const payload = {
            tipo,
            empleado_cedula,
            fecha_inicio,
            fecha_fin,
            /*aprobado_por_cedula,*/
            motivo
        };

        try {
            const response = await fetch('/api/vacaciones_permisos/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                form.reset();
                cargarRegistros();
            } else {
                alert('Error al registrar: ' + data.message);
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            alert('Error al enviar formulario');
        }
    }

    async function getCurrentUserInfo() {
        try {
            const response = await fetch('/api/current-user-info/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    credentials: "include",
                },
                credentials: 'include'  // Incluir cookies para autenticación
            });

            if (!response.ok) {
                throw new Error('Error al obtener información del usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { success: false, error: error.message };
        }
    }

    // Función para abrir el modal de permisos
    function openRegistrarPermisoModal() {
        // Mostrar el modal directamente sin buscar usuario
        document.getElementById('modalRegistrarPermiso').style.display = 'block';
    }

    // Asignar el evento al botón
    document.getElementById('btn-registrar-permiso').addEventListener('click', openRegistrarPermisoModal);

    // Similar para vacaciones
    function openRegistrarVacacionesModal() {
        // Mostrar el modal directamente sin buscar usuario
        document.getElementById('modalRegistrarVacaciones').style.display = 'block';
    }

    document.getElementById('btn-registrar-vacaciones').addEventListener('click', openRegistrarVacacionesModal);

    // Función para obtener cookie CSRF
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

    // Event listeners for main form if present
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function (e) {
            e.preventDefault();
            cargarRegistros();
        });
    }
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function (e) {
            e.preventDefault();
            limpiarFormulario();
        });
    }
    if (formRegistro) {
        formRegistro.addEventListener('submit', enviarFormulario);
    }

    // Modal elements
    const modalRegistrarPermiso = document.getElementById('modalRegistrarPermiso');
    const btnRegistrarPermiso = document.getElementById('btn-registrar-permiso');
    const btnCerrarModalPermiso = document.getElementById('btnCerrarModalPermiso');
    const btnCancelarPermiso = document.getElementById('btnCancelarPermiso');

    const modalRegistrarVacaciones = document.getElementById('modalRegistrarVacaciones');
    const btnRegistrarVacaciones = document.getElementById('btn-registrar-vacaciones');
    const btnCerrarModalVacaciones = document.getElementById('btnCerrarModalVacaciones');
    const btnCancelarVacaciones = document.getElementById('btnCancelarVacaciones');

    // Open modal Permiso
    if (btnRegistrarPermiso && modalRegistrarPermiso) {
        btnRegistrarPermiso.addEventListener('click', () => {
            modalRegistrarPermiso.style.display = 'flex';
            modalRegistrarPermiso.style.justifyContent = 'center';
            modalRegistrarPermiso.style.alignItems = 'center';
        });
    }

    // Close modal Permiso
    if (btnCerrarModalPermiso && modalRegistrarPermiso) {
        btnCerrarModalPermiso.addEventListener('click', () => {
            modalRegistrarPermiso.style.display = 'none';
        });
    }
    if (btnCancelarPermiso && modalRegistrarPermiso) {
        btnCancelarPermiso.addEventListener('click', () => {
            modalRegistrarPermiso.style.display = 'none';
        });
    }

    // Open modal Vacaciones
    if (btnRegistrarVacaciones && modalRegistrarVacaciones) {
        btnRegistrarVacaciones.addEventListener('click', () => {
            modalRegistrarVacaciones.style.display = 'flex';
            modalRegistrarVacaciones.style.justifyContent = 'center';
            modalRegistrarVacaciones.style.alignItems = 'center';
        });
    }

    // Close modal Vacaciones
    if (btnCerrarModalVacaciones && modalRegistrarVacaciones) {
        btnCerrarModalVacaciones.addEventListener('click', () => {
            modalRegistrarVacaciones.style.display = 'none';
        });
    }
    if (btnCancelarVacaciones && modalRegistrarVacaciones) {
        btnCancelarVacaciones.addEventListener('click', () => {
            modalRegistrarVacaciones.style.display = 'none';
        });
    }

    // Close modals when clicking outside modal content
    window.addEventListener('click', (event) => {
        if (event.target === modalRegistrarPermiso) {
            modalRegistrarPermiso.style.display = 'none';
        }
        if (event.target === modalRegistrarVacaciones) {
            modalRegistrarVacaciones.style.display = 'none';
        }
    });

    // Auto-fill "Hecho Por" with current session user and make readonly
    const hechoPorInput = document.getElementById('hechoPorPermiso');
    if (hechoPorInput && typeof CURRENT_SESSION_USER_NAME !== 'undefined') {
        hechoPorInput.value = CURRENT_SESSION_USER_NAME;
        hechoPorInput.readOnly = true;
    }

    // Auto-fill "Hecho Por" in Registrar Vacaciones modal and make readonly
    const hechoPorVacacionesInput = document.getElementById('hechoPorVacaciones');
    if (hechoPorVacacionesInput && typeof CURRENT_SESSION_USER_NAME !== 'undefined') {
        hechoPorVacacionesInput.value = CURRENT_SESSION_USER_NAME;
        hechoPorVacacionesInput.readOnly = true;
    }

    // Auto-fill "Nombre" when "Cédula" input changes
    const cedulaInput = document.getElementById('cedulaPermiso');
    const nombreInput = document.getElementById('nombrePermiso');
    if (cedulaInput && nombreInput) {
        cedulaInput.addEventListener('change', async () => {
            const cedula = cedulaInput.value.trim();
            if (cedula.length === 0) {
                nombreInput.value = '';
                return;
            }
            try {
                const response = await fetch(`/api/empleado_por_cedula/?cedula=${encodeURIComponent(cedula)}`);
                if (!response.ok) {
                    nombreInput.value = '';
                    return;
                }
                const data = await response.json();
                if (data.success && data.empleado) {
                    nombreInput.value = `${data.empleado.primer_nombre} ${data.empleado.primer_apellido}`;
                } else {
                    nombreInput.value = '';
                }
            } catch (error) {
                console.error('Error fetching empleado:', error);
                nombreInput.value = '';
            }
        });
    }

    // Date calculation helpers
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function addBusinessDays(date, days) {
        let result = new Date(date);
        let addedDays = 0;
        while (addedDays < days) {
            result.setDate(result.getDate() + 1);
            const day = result.getDay();
            if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
                addedDays++;
            }
        }
        return result;
    }

    // Format date to yyyy-mm-dd
    function formatDate(date) {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();

        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }

    // Event listeners for "Días Continuos" and "Días Hábiles" buttons
    const btnDiasContinuos = document.getElementById('btnDiasContinuos');
    const btnDiasHabiles = document.getElementById('btnDiasHabiles');
    const fechaInicioInput = document.getElementById('fechaInicioPermiso');
    const diasInput = document.getElementById('diasPermiso');
    const fechaFinalInput = document.getElementById('fechaFinalPermiso');

    if (btnDiasContinuos && fechaInicioInput && diasInput && fechaFinalInput) {
        btnDiasContinuos.addEventListener('click', () => {
            const startDate = new Date(fechaInicioInput.value);
            const days = parseInt(diasInput.value, 10);
            if (isNaN(startDate.getTime()) || isNaN(days) || days < 1) {
                alert('Por favor ingrese una fecha de inicio válida y un número de días mayor a 0.');
                return;
            }
            const endDate = addDays(startDate, days - 1);
            fechaFinalInput.value = formatDate(endDate);
        });
    }

    if (btnDiasHabiles && fechaInicioInput && diasInput && fechaFinalInput) {
        btnDiasHabiles.addEventListener('click', () => {
            const startDate = new Date(fechaInicioInput.value);
            const days = parseInt(diasInput.value, 10);
            if (isNaN(startDate.getTime()) || isNaN(days) || days < 1) {
                alert('Por favor ingrese una fecha de inicio válida y un número de días mayor a 0.');
                return;
            }
            const endDate = addBusinessDays(startDate, days - 1);
            fechaFinalInput.value = formatDate(endDate);
        });
    }

    // Override form submission for permisos modal to use the API
    const formRegistrarPermiso = document.getElementById('formRegistrarPermiso');
    if (formRegistrarPermiso) {
        formRegistrarPermiso.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cedula = cedulaInput.value.trim();
            const nombre = nombreInput.value.trim();
            const descripcion = document.getElementById('descripcionPermiso').value.trim();
            const fechaInicio = fechaInicioInput.value;
            const fechaFinal = fechaFinalInput.value;
            const aprobadoPor = document.getElementById('aprobadoPorPermiso').value.trim();
            const hechoPor = hechoPorInput.value.trim();

            if (!cedula || !nombre || !descripcion || !fechaInicio || !fechaFinal) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }

            const payload = {
                tipo: 'permiso',
                empleado_cedula: cedula,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFinal,
                aprobado_por_cedula: aprobadoPor,
                motivo: descripcion,
                hecho_por: hechoPor
            };

            try {
                const response = await fetch('/api/vacaciones_permisos/crear/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (data.success) {
                    alert(data.message);
                    formRegistrarPermiso.reset();
                    modalRegistrarPermiso.style.display = 'none';
                    cargarRegistros();
                } else {
                    alert('Error al registrar permiso: ' + data.message);
                }
            } catch (error) {
                console.error('Error al registrar permiso:', error);
                alert('Error al registrar permiso');
            }
        });
    }
    // Add event listener for formRegistrarVacaciones to call enviarFormulario
    const formRegistrarVacaciones = document.getElementById('formRegistrarVacaciones');
    if (formRegistrarVacaciones) {
        formRegistrarVacaciones.addEventListener('submit', enviarFormulario);
    }

    // Initial load
    cargarRegistros();
}

// Expose the initialization function
window.initializeVacacionesPermisos = initializeVacacionesPermisos;

