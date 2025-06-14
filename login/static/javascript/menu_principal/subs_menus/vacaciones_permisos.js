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
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor complete todos los campos obligatorios.',
                });
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
            let url = '/api/vacaciones_permisos/crear/';
            if (tipo.toLowerCase() === 'vacaciones') {
                url = '/api/vacaciones_permisos/crear_vacaciones/';
            }
            const response = await fetch(url, {
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al registrar',
                        text: data.message,
                    });
                }
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al enviar formulario',
                });
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

    // Auto-fill "Nombre" in Registrar Vacaciones modal when "Cédula" input changes
    const cedulaVacacionesInput = document.getElementById('cedulaVacaciones');
    const nombreVacacionesInput = document.getElementById('nombreVacaciones');
    const selectAnioVacaciones = document.getElementById('selectAnioVacaciones');
    const diasDisponiblesContainer = document.getElementById('diasDisponiblesContainer');
    const diasDisponiblesVacaciones = document.getElementById('diasDisponiblesVacaciones');
    const empleadoCedulaVacaciones = document.getElementById('empleadoCedulaVacaciones');

    if (cedulaVacacionesInput && nombreVacacionesInput && selectAnioVacaciones && diasDisponiblesContainer && diasDisponiblesVacaciones && empleadoCedulaVacaciones) {
        cedulaVacacionesInput.addEventListener('change', async () => {
            const cedula = cedulaVacacionesInput.value.trim();
            empleadoCedulaVacaciones.value = cedula; // Update hidden input for form submission
            if (cedula.length === 0) {
                nombreVacacionesInput.value = '';
                selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                diasDisponiblesContainer.style.display = 'none';
                diasDisponiblesVacaciones.textContent = '0';
                return;
            }
            try {
                const responseEmpleado = await fetch(`/api/empleado_por_cedula/?cedula=${encodeURIComponent(cedula)}`);
                if (!responseEmpleado.ok) {
                    nombreVacacionesInput.value = '';
                    selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                    diasDisponiblesContainer.style.display = 'none';
                    diasDisponiblesVacaciones.textContent = '0';
                    return;
                }
                const dataEmpleado = await responseEmpleado.json();
                if (dataEmpleado.success && dataEmpleado.empleado) {
                    nombreVacacionesInput.value = `${dataEmpleado.empleado.primer_nombre} ${dataEmpleado.empleado.primer_apellido}`;
                } else {
                    nombreVacacionesInput.value = '';
                }

                // Fetch vacation years and available days for the employee
                const responseVacaciones = await fetch(`/api/vacaciones_permisos/?cedula=${encodeURIComponent(cedula)}`);
                if (!responseVacaciones.ok) {
                    selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                    diasDisponiblesContainer.style.display = 'none';
                    diasDisponiblesVacaciones.textContent = '0';
                    return;
                }
                const dataVacaciones = await responseVacaciones.json();
                if (dataVacaciones.success && Array.isArray(dataVacaciones.vacaciones_pendientes_por_anio)) {
                    console.log('Vacaciones data:', dataVacaciones.vacaciones_pendientes_por_anio);
                    selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                    dataVacaciones.vacaciones_pendientes_por_anio.forEach(vacacion => {
                        const option = document.createElement('option');
                        option.value = vacacion.anio;
                        option.textContent = `${vacacion.anio} - Días disponibles: ${vacacion.dias_pendientes}`;
                        option.dataset.diasDisponibles = vacacion.dias_pendientes;
                        selectAnioVacaciones.appendChild(option);
                    });
                    // Show the container if there is at least one year
                    if (dataVacaciones.vacaciones_pendientes_por_anio.length > 0) {
                        diasDisponiblesContainer.style.display = 'none';
                        diasDisponiblesVacaciones.textContent = '0';
                        // Do not select any year initially, keep placeholder
                        // selectAnioVacaciones.value = dataVacaciones.vacaciones_pendientes_por_anio[0].anio;
                    } else {
                        diasDisponiblesContainer.style.display = 'none';
                        diasDisponiblesVacaciones.textContent = '0';
                    }
                } else {
                    console.log('No vacation data found or invalid format');
                    selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                    diasDisponiblesContainer.style.display = 'none';
                    diasDisponiblesVacaciones.textContent = '0';
                }
            } catch (error) {
                console.error('Error fetching empleado o vacaciones:', error);
                nombreVacacionesInput.value = '';
                selectAnioVacaciones.innerHTML = '<option value="">Seleccione un año</option>';
                diasDisponiblesContainer.style.display = 'none';
                diasDisponiblesVacaciones.textContent = '0';
            }
        });

        // Update available days display when year selection changes
        selectAnioVacaciones.addEventListener('change', () => {
            const selectedOption = selectAnioVacaciones.options[selectAnioVacaciones.selectedIndex];
            if (selectedOption && selectedOption.value) {
                diasDisponiblesVacaciones.textContent = selectedOption.dataset.diasDisponibles || '0';
                diasDisponiblesContainer.style.display = 'block';
            } else {
                diasDisponiblesVacaciones.textContent = '0';
                diasDisponiblesContainer.style.display = 'none';
            }
        });
    }

    // Date calculation helpers
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/
    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/
    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/
    function addBusinessDays(startDate, days) {
        if (days <= 0) return new Date(startDate);
        
        let count = 0;
        let currentDate = new Date(startDate);
        
        // Ajuste inicial: si comienza en fin de semana, avanzamos al próximo lunes
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Contamos el primer día como día 1
        count = 1;
        
        // Si ya cumplimos, retornamos
        if (count >= days) return currentDate;
        
        // Sumamos los días restantes
        while (count < days) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                count++;
            }
        }
        
        return currentDate;
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

    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/
    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/
    /*Corregir funcion ya que el conteo de los dias no lo hace como debe ser*/

    if (btnDiasHabilesVacaciones && fechaInicioVacaciones && fechaFinVacaciones) {
        btnDiasHabilesVacaciones.addEventListener('click', () => {
            const startDate = new Date(fechaInicioVacaciones.value);
            const diasDisponibles = parseInt(diasDisponiblesVacaciones.textContent, 10);
            
            if (isNaN(startDate.getTime()) || isNaN(diasDisponibles) || diasDisponibles < 1) {
                alert('Por favor ingrese una fecha de inicio válida y asegúrese de que haya días disponibles.');
                return;
            }
            
            const endDate = addBusinessDays(startDate, diasDisponibles);
            fechaFinVacaciones.value = formatDate(endDate);
            
            // Debug detallado
            console.log('--- DEBUG DEL CÁLCULO ---');
            console.log('Fecha inicio:', startDate.toDateString(), 'Día semana:', ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][startDate.getDay()]);
            console.log('Días solicitados:', diasDisponibles);
            console.log('Fecha fin calculada:', endDate.toDateString(), 'Día semana:', ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][endDate.getDay()]);
            console.log('Total días hábiles calculados:', countBusinessDays(startDate, endDate));
        });
    }

    // Override form submission for permisos modal to use the API
    const formRegistrarPermiso = document.getElementById('formRegistrarPermiso');
    if (formRegistrarPermiso) {
        formRegistrarPermiso.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cedulaInputLocal = document.getElementById('cedulaPermiso');
            const nombreInputLocal = document.getElementById('nombrePermiso');
            const descripcionInput = document.getElementById('descripcionPermiso');
            const fechaInicioInputLocal = document.getElementById('fechaInicioPermiso');
            const fechaFinalInputLocal = document.getElementById('fechaFinalPermiso');
            const aprobadoPorInput = document.getElementById('aprobadoPorPermiso');
            const hechoPorInputLocal = document.getElementById('hechoPorPermiso');

            const cedula = cedulaInputLocal ? cedulaInputLocal.value.trim() : '';
            const nombre = nombreInputLocal ? nombreInputLocal.value.trim() : '';
            const descripcion = descripcionInput ? descripcionInput.value.trim() : '';
            const fechaInicio = fechaInicioInputLocal ? fechaInicioInputLocal.value : '';
            const fechaFinal = fechaFinalInputLocal ? fechaFinalInputLocal.value : '';
            const aprobadoPor = aprobadoPorInput ? aprobadoPorInput.value.trim() : '';
            const hechoPor = hechoPorInputLocal ? hechoPorInputLocal.value.trim() : '';

            if (!cedula || !nombre || !descripcion || !fechaInicio || !fechaFinal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor complete todos los campos obligatorios.',
                });
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al registrar permiso',
                        text: data.message,
                    });
                }
            } catch (error) {
                console.error('Error al registrar permiso:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar permiso',
                    text: 'Error al registrar permiso',
                });
            }
        });
    }
    // Add event listener for formRegistrarVacaciones to call enviarFormularioVacaciones
    const formRegistrarVacaciones = document.getElementById('formRegistrarVacaciones');

    // Function obtenerControlId removed as it is not needed

    async function enviarFormularioVacaciones(event) {
        event.preventDefault();
        const form = event.target;
        if (!form) return;
        const formData = new FormData(form);

        const empleado_cedula = formData.get('empleado_cedula') || formData.get('cedula');
        const anio_vacaciones = formData.get('anio_vacaciones');
        const fecha_inicio = formData.get('fecha_inicio');
        const fecha_fin = formData.get('fecha_fin') || formData.get('fecha_final');
        const estado = formData.get('estado');
        const motivo_inhabilitacion = formData.get('motivo_inhabilitacion');
        const fecha_inhabilitacion = formData.get('fecha_inhabilitacion');
        const fecha_reanudacion = formData.get('fecha_reanudacion');
        const tipo = 'vacaciones';

        if (!empleado_cedula || !anio_vacaciones || !fecha_inicio || !fecha_fin || !estado) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor complete todos los campos obligatorios.',
            });
            return;
        }

        // Fetch control_id from vacaciones_por_cedula API
        let control_id = null;
        try {
            const response = await fetch(`/api/vacaciones_permisos/?cedula=${encodeURIComponent(empleado_cedula)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.vacaciones_pendientes_por_anio)) {
                    const control = data.vacaciones_pendientes_por_anio.find(v => v.anio == anio_vacaciones);
                    if (control) {
                        control_id = control.id;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching control_id:', error);
        }

        if (!control_id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener el control de vacaciones para el empleado y año seleccionados.',
            });
            return;
        }

        const payload = {
            tipo,
            empleado_cedula,
            control_id,
            fecha_inicio,
            fecha_fin,
            estado,
            motivo_inhabilitacion,
            fecha_inhabilitacion,
            fecha_reanudacion
        };

        try {
            const response = await fetch('/api/vacaciones_permisos/crear_vacaciones/', {
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
                modalRegistrarVacaciones.style.display = 'none';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar vacaciones',
                    text: data.message,
                });
            }
        } catch (error) {
            console.error('Error al registrar vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar vacaciones',
            });
        }
    }

    if (formRegistrarVacaciones) {
        formRegistrarVacaciones.addEventListener('submit', enviarFormularioVacaciones);
    }

    // Function to load vacation records from the API and populate the vacation table
    async function cargarRegistrosVacaciones() {
        const tablaVacacionesCuerpo = document.getElementById('cuerpoTablaVacaciones');
        if (!tablaVacacionesCuerpo) return;
        try {
            const response = await fetch('/api/vacaciones_listar/');
            const data = await response.json();
            if (data.success) {
                tablaVacacionesCuerpo.innerHTML = '';
                if (!data.registros_vacaciones || data.registros_vacaciones.length === 0) {
                    tablaVacacionesCuerpo.innerHTML = '<tr><td colspan="11" class="text-center">No hay registros de vacaciones disponibles</td></tr>';
                    return;
                }
                data.registros_vacaciones.forEach(registro => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${registro.id || ''}</td>
                        <td>${registro.control_id || ''}</td>
                        <td>${registro.fecha_inicio || ''}</td>
                        <td>${registro.fecha_fin || ''}</td>
                        <td>${registro.estado || ''}</td>
                        <td>${registro.dias_planificados || ''}</td>
                        <td>${registro.dias_efectivos || ''}</td>
                        <td>${registro.dias_habilitados || ''}</td>
                        <td>${registro.aprobado_por || ''}</td>
                        <td>${registro.documento_url ? `<a href="${registro.documento_url}" target="_blank">Ver documento</a>` : ''}</td>
                        <td>
                            <!-- Actions can be added here if needed -->
                        </td>
                    `;
                    tablaVacacionesCuerpo.appendChild(fila);
                });
            } else {
                alert('Error al cargar registros de vacaciones: ' + data.error);
            }
        } catch (error) {
            console.error('Error al cargar registros de vacaciones:', error);
            alert('Error al cargar registros de vacaciones');
        }
    }

    // Function to load permisos asistencia records from the API and populate the permisos table
    async function cargarRegistrosPermisosAsistencia() {
        const tablaPermisosCuerpo = document.getElementById('cuerpoTablaPermisos');
        if (!tablaPermisosCuerpo) return;
        try {
            const response = await fetch('/api/vacaciones_permisos/listar/');
            const data = await response.json();
            if (data.success) {
                tablaPermisosCuerpo.innerHTML = '';
                if (!data.registros || data.registros.length === 0) {
                    tablaPermisosCuerpo.innerHTML = '<tr><td colspan="8" class="text-center">No hay registros de permisos disponibles</td></tr>';
                    return;
                }
                data.registros.forEach(registro => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${registro.id || ''}</td>
                        <td>${registro.empleado || ''}</td>
                        <td>${registro.fecha_inicio || ''}</td>
                        <td>${registro.fecha_fin || ''}</td>
                        <td>${registro.tipo || ''}</td>
                        <td>${registro.aprobado_por || ''}</td>
                        <td>${registro.documento_url ? `<a href="${registro.documento_url}" target="_blank">Ver documento</a>` : ''}</td>
                        <td>
                            <!-- Actions can be added here if needed -->
                        </td>
                    `;
                    tablaPermisosCuerpo.appendChild(fila);
                });
            } else {
                alert('Error al cargar registros de permisos: ' + data.error);
            }
        } catch (error) {
            console.error('Error al cargar registros de permisos:', error);
            alert('Error al cargar registros de permisos');
        }
    }

    // Event listeners for vacation filter buttons
    const btnBuscarVacaciones = document.getElementById('btn-aplicar-filtros-vacaciones');
    const btnLimpiarVacaciones = document.getElementById('btn-limpiar-filtros-vacaciones');

    // Event listeners for permisos filter buttons
    const btnBuscarPermisos = document.getElementById('btn-aplicar-filtros-permiso');
    const btnLimpiarPermisos = document.getElementById('btn-limpiar-filtros-permiso');

    if (btnBuscarVacaciones) {
        btnBuscarVacaciones.addEventListener('click', function (e) {
            e.preventDefault();
            cargarRegistrosVacaciones();
        });
    }
    if (btnLimpiarVacaciones) {
        btnLimpiarVacaciones.addEventListener('click', function (e) {
            e.preventDefault();
            // Clear filter inputs
            const filtroEmpleado = document.getElementById('filtro-empleado-vacaciones');
            const filtroFechaInicio = document.getElementById('filtro-fecha-inicio-vacaciones');
            const filtroFechaFin = document.getElementById('filtro-fecha-fin-vacaciones');
            if (filtroEmpleado) filtroEmpleado.value = '';
            if (filtroFechaInicio) filtroFechaInicio.value = '';
            if (filtroFechaFin) filtroFechaFin.value = '';
            cargarRegistrosVacaciones();
        });
    }

    if (btnBuscarPermisos) {
        btnBuscarPermisos.addEventListener('click', function (e) {
            e.preventDefault();
            cargarRegistrosPermisosAsistencia();
        });
    }
    if (btnLimpiarPermisos) {
        btnLimpiarPermisos.addEventListener('click', function (e) {
            e.preventDefault();
            // Clear filter inputs
            const filtroEmpleado = document.getElementById('filtro-empleado-permiso');
            const filtroTipo = document.getElementById('filtro-tipo-permiso');
            const filtroFechaInicio = document.getElementById('filtro-fecha-inicio-permiso');
            const filtroFechaFin = document.getElementById('filtro-fecha-fin-permiso');
            if (filtroEmpleado) filtroEmpleado.value = '';
            if (filtroTipo) filtroTipo.value = '';
            if (filtroFechaInicio) filtroFechaInicio.value = '';
            if (filtroFechaFin) filtroFechaFin.value = '';
            cargarRegistrosPermisosAsistencia();
        });
    }

    // Initial load
    cargarRegistros();
    cargarRegistrosVacaciones();
    cargarRegistrosPermisosAsistencia();
}

// Expose the initialization function
window.initializeVacacionesPermisos = initializeVacacionesPermisos;

