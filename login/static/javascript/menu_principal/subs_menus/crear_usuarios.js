// Variables globales
const API_EMPLEADOS_URL = '/api/empleados/';
let pasoActual = 1;
const totalPasos = 4;
let usuarioActualId = null;

// Función global para abrir el modal
function usuarioModal__abrir(usuarioId = null) {
    const modal = document.getElementById("usuarioModal");
    if (modal) {
        usuarioActualId = usuarioId;
        modal.style.display = 'flex';
        reiniciarPasos();
        resetearFormulario();
        
        const tituloModal = document.getElementById("modal-titulo");
        if (tituloModal) {
            tituloModal.innerHTML = usuarioId 
                ? '<i class="fas fa-user-edit"></i> Editar Usuario' 
                : '<i class="fas fa-user-plus"></i> Crear Nuevo Usuario';
        }
        
        if (usuarioId) {
            cargarDatosUsuario(usuarioId);
        }
    }
}

// Función global para cerrar el modal
function usuarioModal__cerrar() {
    const modal = document.getElementById("usuarioModal");
    if (modal) modal.style.display = 'none';
}

// Función para navegar entre pasos
function navegarPaso(direccion) {
    if (direccion === 'siguiente') {
        if (validarPasoActual() && pasoActual < totalPasos) {
            pasoActual++;
            actualizarPasos();
        }
    } else if (direccion === 'anterior' && pasoActual > 1) {
        pasoActual--;
        actualizarPasos();
    }
}

// Función para editar usuario
function editarUsuario(boton) {
    const usuarioId = boton.getAttribute('data-idusuario');
    usuarioModal__abrir(usuarioId);
}

// Función para confirmar eliminación
function confirmarEliminarUsuario(boton) {
    const modalConfirmacion = document.getElementById("confirmacionModal");
    if (modalConfirmacion) {
        usuarioActualId = boton.getAttribute('data-usuarioid');
        modalConfirmacion.style.display = 'flex';
    }
}

// Función para cerrar modal de confirmación
function cerrarModalConfirmacion() {
    const modalConfirmacion = document.getElementById("confirmacionModal");
    if (modalConfirmacion) modalConfirmacion.style.display = 'none';
}

// Función para eliminar usuario confirmado
function eliminarUsuarioConfirmado() {
    if (usuarioActualId) {
        console.log('Eliminando usuario:', usuarioActualId);
        // Aquí iría la llamada AJAX para eliminar el usuario
        mostrarNotificacion('Usuario eliminado correctamente', 'success');
        cerrarModalConfirmacion();
        actualizarTablaUsuarios();
    }
}

// Función para guardar usuario
function guardarUsuario() {
    if (validarPasoActual()) {
        const btnGuardar = document.getElementById('btn-guardar');
        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            // Simular envío de datos
            setTimeout(() => {
                mostrarNotificacion(
                    usuarioActualId 
                        ? 'Usuario actualizado correctamente' 
                        : 'Usuario creado correctamente',
                    'success'
                );
                
                cerrarModalUsuario();
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
                actualizarTablaUsuarios();
            }, 1500);
        }
    }
}

// Funciones de apoyo
function reiniciarPasos() {
    pasoActual = 1;
    actualizarPasos();
}

function actualizarPasos() {
    // Ocultar todos los pasos
    document.querySelectorAll('.paso-formulario').forEach(paso => {
        paso.classList.remove('activo');
    });

    // Mostrar paso actual
    const pasoActivo = document.querySelector(`.paso-formulario[data-paso="${pasoActual}"]`);
    if (pasoActivo) pasoActivo.classList.add('activo');

    // Actualizar indicadores
    document.querySelectorAll('.indicador-pasos .paso').forEach((paso, index) => {
        if (paso) {
            paso.classList.toggle('completado', index < pasoActual - 1);
            paso.classList.toggle('activo', index === pasoActual - 1);
        }
    });

    // Actualizar botones
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnGuardar = document.getElementById('btn-guardar');

    if (btnAnterior) btnAnterior.disabled = pasoActual === 1;
    if (btnSiguiente) btnSiguiente.style.display = pasoActual < totalPasos ? 'flex' : 'none';
    if (btnGuardar) btnGuardar.style.display = pasoActual === totalPasos ? 'flex' : 'none';

    // Actualizar resumen si es el último paso
    if (pasoActual === totalPasos) {
        actualizarResumen();
    }
}

function validarPasoActual() {
    const paso = document.querySelector(`.paso-formulario[data-paso="${pasoActual}"]`);
    if (!paso) return false;

    let valido = true;
    
    // Seleccionar todos los campos requeridos excepto segundo nombre y apellido
    const camposRequeridos = paso.querySelectorAll('[required]:not(#modal-segundo-nombre):not(#modal-segundo-apellido)');

    camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
            campo.classList.add('invalido');
            valido = false;
            
            // Opcional: agregar mensaje de error
            if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains('error-mensaje')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-mensaje';
                errorMsg.textContent = 'Este campo es requerido';
                campo.parentNode.insertBefore(errorMsg, campo.nextSibling);
            }
        } else {
            campo.classList.remove('invalido');
            // Remover mensaje de error si existe
            const errorMsg = campo.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-mensaje')) {
                errorMsg.remove();
            }
        }
    });

    // Validaciones adicionales para campos específicos
    if (pasoActual === 1) {
        // Validar que la cédula sea numérica
        const cedula = document.getElementById('modal-cedula');
        if (cedula && cedula.value && isNaN(cedula.value)) {
            cedula.classList.add('invalido');
            valido = false;
            
            if (!cedula.nextElementSibling || !cedula.nextElementSibling.classList.contains('error-mensaje')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-mensaje';
                errorMsg.textContent = 'La cédula debe ser numérica';
                cedula.parentNode.insertBefore(errorMsg, cedula.nextSibling);
            }
        }
        
        // Validar formato de fecha de nacimiento si existe
        const fechaNacimiento = document.getElementById('modal-fecha-nacimiento');
        if (fechaNacimiento && fechaNacimiento.value) {
            const fecha = new Date(fechaNacimiento.value);
            const hoy = new Date();
            
            if (fecha > hoy) {
                fechaNacimiento.classList.add('invalido');
                valido = false;
                
                if (!fechaNacimiento.nextElementSibling || !fechaNacimiento.nextElementSibling.classList.contains('error-mensaje')) {
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-mensaje';
                    errorMsg.textContent = 'La fecha no puede ser futura';
                    fechaNacimiento.parentNode.insertBefore(errorMsg, fechaNacimiento.nextSibling);
                }
            }
        }
    }

    return valido;
}

function actualizarResumen() {
    const elementosResumen = {
        // Información Personal
        'resumen-nombre-completo': () => {
            const primerNombre = document.getElementById('modal-primer-nombre').value;
            const segundoNombre = document.getElementById('modal-segundo-nombre').value;
            const primerApellido = document.getElementById('modal-primer-apellido').value;
            const segundoApellido = document.getElementById('modal-segundo-apellido').value;
            return `${primerApellido} ${segundoApellido || ''} ${primerNombre} ${segundoNombre || ''}`.replace(/\s+/g, ' ').trim();
        },
        'resumen-identificacion': () => {
            const tipo = document.getElementById('modal-tipo-identificacion');
            const cedula = document.getElementById('modal-cedula').value;
            const rif = document.getElementById('modal-rif').value;
            
            if (cedula) {
                return tipo ? `${tipo.options[tipo.selectedIndex].text}: ${cedula}` : cedula;
            } else if (rif) {
                return `RIF: ${rif}`;
            }
            return 'No especificado';
        },
        'resumen-fecha-nacimiento': () => {
            const fecha = document.getElementById('modal-fecha-nacimiento').value;
            return fecha ? formatDate(fecha) : 'No especificada';
        },
        
        // Información Laboral
        'resumen-cargo': () => {
            const cargo = document.getElementById('cargo');
            return cargo ? cargo.options[cargo.selectedIndex].text : 'No especificado';
        },
        'resumen-tipo-trabajador': () => {
            const tipo = document.getElementById('tipo-trabajador');
            return tipo ? tipo.options[tipo.selectedIndex].text : 'No especificado';
        },
        'resumen-fecha-ingreso': () => {
            const fecha = document.getElementById('fecha-ingreso').value;
            return fecha ? formatDate(fecha) : 'No especificada';
        },
        
        // Datos Bancarios
        'resumen-banco': () => {
            const banco = document.getElementById('banco');
            return banco ? banco.options[banco.selectedIndex].text : 'No especificado';
        },
        'resumen-tipo-cuenta': () => {
            const tipo = document.getElementById('tipo-cuenta');
            return tipo ? (tipo.value === 'C' ? 'Corriente' : 'Ahorro') : 'No especificado';
        },
        'resumen-numero-cuenta': () => {
            const cuenta = document.getElementById('numero-cuenta').value;
            return cuenta || 'No especificado';
        },
        
        // Configuración de Usuario (si es necesario)
        'resumen-email-usuario': () => document.getElementById('email').value || 'No especificado'
    };

    // Función auxiliar para formatear fechas
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Actualizar todos los elementos del resumen
    Object.entries(elementosResumen).forEach(([id, fn]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = fn();
    });
}

function resetearFormulario() {
    const modal = document.getElementById("usuarioModal");
    if (!modal) return;
    
    modal.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(campo => {
        campo.value = '';
        campo.classList.remove('invalido');
    });
    
    modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    modal.querySelector('#modal-familia-cargo').innerHTML = '<option value="">Seleccione tipo de trabajador primero</option>';
    modal.querySelector('#modal-familia-cargo').disabled = true;
    
    modal.querySelector('#modal-cargo').innerHTML = '<option value="">Seleccione familia de cargo primero</option>';
    modal.querySelector('#modal-cargo').disabled = true;
}

function mostrarNotificacion(mensaje, tipo) {
    // Implementación básica - puedes usar una librería como Toastr o SweetAlert
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

async function enviarDatosEmpleado(formData) {
    try {
        const response = await fetch('/api/empleados/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken(), // Necesario para Django
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear el empleado');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function getCSRFToken() {
    const cookie = document.cookie.match(/csrftoken=([^ ;]+)/);
    return cookie ? cookie[1] : '';
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Eventos para mostrar/ocultar contraseña
    document.querySelectorAll('.toggle-password').forEach(icono => {
        icono.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Carga dinámica de familias de cargo y cargos
    const tipoTrabajadorSelect = document.getElementById('modal-tipo-trabajador');
    if (tipoTrabajadorSelect) {
        tipoTrabajadorSelect.addEventListener('change', function() {
            const tipoTrabajadorId = this.value;
            const familiaCargoSelect = document.getElementById('modal-familia-cargo');
            const cargoSelect = document.getElementById('modal-cargo');
            
            if (familiaCargoSelect && cargoSelect) {
                familiaCargoSelect.innerHTML = '<option value="">Cargando...</option>';
                familiaCargoSelect.disabled = true;
                
                cargoSelect.innerHTML = '<option value="">Seleccione familia de cargo primero</option>';
                cargoSelect.disabled = true;
                
                if (tipoTrabajadorId) {
                    setTimeout(() => {
                        const familias = obtenerFamiliasPorTipo(tipoTrabajadorId);
                        
                        familiaCargoSelect.innerHTML = '<option value="">Seleccione...</option>';
                        familias.forEach(familia => {
                            const option = document.createElement('option');
                            option.value = familia.id;
                            option.textContent = familia.nombre;
                            familiaCargoSelect.appendChild(option);
                        });
                        
                        familiaCargoSelect.disabled = false;
                    }, 500);
                }
            }
        });
    }

    const familiaCargoSelect = document.getElementById('modal-familia-cargo');
    if (familiaCargoSelect) {
        familiaCargoSelect.addEventListener('change', function() {
            const familiaId = this.value;
            const cargoSelect = document.getElementById('modal-cargo');
            
            if (cargoSelect) {
                cargoSelect.innerHTML = '<option value="">Cargando...</option>';
                cargoSelect.disabled = true;
                
                if (familiaId) {
                    setTimeout(() => {
                        const cargos = obtenerCargosPorFamilia(familiaId);
                        
                        cargoSelect.innerHTML = '<option value="">Seleccione...</option>';
                        cargos.forEach(cargo => {
                            const option = document.createElement('option');
                            option.value = cargo.id;
                            option.textContent = cargo.nombre_completo;
                            cargoSelect.appendChild(option);
                        });
                        
                        cargoSelect.disabled = false;
                    }, 500);
                }
            }
        });
    }
});

// Funciones simuladas para obtener datos
    async function actualizarTablaEmpleados(empleados = null) {
    const tbody = document.querySelector('.tabla-datos__tbody');
    const sinResultados = document.getElementById('sin-resultados-empleados');

    if (empleados === null) {
        try {
            const response = await fetch(`${API_EMPLEADOS_URL}?${params.toString()}`);
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            
            const data = await response.json();
            empleados = data.empleados || [];
        } catch (error) {
            console.error("Error al obtener empleados:", error);
            tbody.innerHTML = `<tr><td colspan="21">Error al cargar datos: ${error.message}</td></tr>`;
            return;
        }
    }

    if (!Array.isArray(empleados)) {
        console.error("Datos de empleados no son un array:", empleados);
        empleados = [];
    }

    if (empleados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="21">No hay empleados registrados</td></tr>';
        if (sinResultados) sinResultados.style.display = 'block';
    } else {
        tbody.innerHTML = empleados.map(empleado => `
            <tr data-id="${empleado.id}">
                <td class="tabla-datos__columna col-small">${empleado.tipo_id || 'No especificado'}</td>
                <td class="tabla-datos__columna col-small">${empleado.cedula || ''}</td>
                <td class="tabla-datos__columna col-large">${empleado.nombre_completo || ''}</td>
                <td class="tabla-datos__columna col-medium">${empleado.fecha_nacimiento || 'No especificada'}</td>
                <td class="tabla-datos__columna col-medium">${empleado.lugar_nacimiento || ''}</td>
                <td class="tabla-datos__columna col-small">${empleado.genero || ''}</td>
                <td class="tabla-datos__columna col-small">${empleado.estado_civil || ''}</td>
                <td class="tabla-datos__columna col-medium">${empleado.fecha_ingreso || 'No especificada'}</td>
                <td class="tabla-datos__columna col-large">${empleado.cargo || 'Sin cargo'}</td>
                <td class="tabla-datos__columna col-medium">${empleado.tipo_trabajador || ''}</td>
                <td class="tabla-datos__columna col-medium">${empleado.grado_instruccion || ''}</td>
                <td class="tabla-datos__columna col-medium">${empleado.telefono_principal || ''}</td>
                <td class="tabla-datos__columna col-medium">${empleado.telefono_secundario || ''}</td>
                <td class="tabla-datos__columna col-large">${empleado.email || ''}</td>
                <td class="tabla-datos__columna col-large celda-wrap">${empleado.direccion || ''}</td>
                <td class="tabla-datos__columna col-xsmall">${empleado.hijos || 0}</td>
                <td class="tabla-datos__columna col-xsmall">${empleado.conyuge || 'No'}</td>
                <td class="tabla-datos__columna col-medium">${empleado.rif || ''}</td>
                <td class="tabla-datos__columna celda-wrap">
                    ${empleado.cuentas_bancarias || 'No hay cuentas bancarias'}
                </td>
                <td class="tabla-datos__columna col-small">${empleado.status || 'Inactivo'}</td>
                <td class="tabla-datos__columna col-xlarge">
                    <button class="btn btn-editar" onclick="editarEmpleado('${empleado.cedula}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-ver" onclick="verDetalleEmpleado('${empleado.cedula}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${empleado.status === 'Activo' ? 
                        `<button class="btn btn-desactivar" onclick="cambiarEstadoEmpleado('${empleado.cedula}', false)">
                            <i class="fas fa-user-times"></i> Desactivar
                        </button>` : 
                        `<button class="btn btn-activar" onclick="cambiarEstadoEmpleado('${empleado.cedula}', true)">
                            <i class="fas fa-user-check"></i> Activar
                        </button>`
                    }
                </td>
            </tr>
        `).join('');
    }
}

// Función para aplicar filtros (similar a tu aplicarFiltrosEmpleados)
async function aplicarFiltrosEmpleados() {
    try {
        // Asegurarse de que los parámetros estén definidos
        const params = new URLSearchParams({
            estado: document.getElementById('filtro-estado')?.value || '',
            cargo: document.getElementById('filtro-cargo')?.value || '',
            tipo_trabajador: document.getElementById('filtro-tipo-trabajador')?.value || '',
            orden: document.getElementById('filtro-orden')?.value || 'primer_apellido'
        });
        
        await actualizarTablaEmpleados();
    } catch (error) {
        console.error("Error aplicando filtros:", error);
        mostrarNotificacion(`Error al aplicar filtros: ${error.message}`, 'error');
    }
}

function limpiarFiltrosEmpleados() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-cargo').value = '';
    document.getElementById('filtro-tipo-trabajador').value = '';
    document.getElementById('filtro-orden').value = 'primer_apellido';
    aplicarFiltrosEmpleados();
}

// ===== ACTUALIZACIÓN DE TABLA (MODIFICADA PARA INTEGRAR) =====
async function actualizarTablaEmpleados(empleados = null, filtros = {}) {
    const tbody = document.querySelector('.tabla-datos__tbody');
    const sinResultados = document.getElementById('sin-resultados-empleados');
    
    if (!tbody) {
        console.error("No se encontró el elemento tbody en la tabla");
        return;
    }

    try {
        // Si no se pasó el parámetro o es null, hacer fetch
        if (empleados === null) {
            // Crear los parámetros de búsqueda
            const params = new URLSearchParams();
            
            // Agregar filtros si existen
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.cargo) params.append('cargo', filtros.cargo);
            if (filtros.tipo_trabajador) params.append('tipo_trabajador', filtros.tipo_trabajador);
            if (filtros.orden) params.append('orden', filtros.orden);

            const response = await fetch(`${API_EMPLEADOS_URL}?${params.toString()}`);
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            
            const data = await response.json();
            empleados = data.empleados || []; // Asegurar que sea array
        }

        // Validación robusta del array
        if (!Array.isArray(empleados)) {
            console.error("Datos de empleados no son un array:", empleados);
            empleados = []; // Forzar array vacío
        }

        if (empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="21" class="text-center">No hay usuarios registrados</td></tr>';
            if (sinResultados) sinResultados.style.display = 'block';
        } else {
            tbody.innerHTML = empleados.map(empleado => `
                <tr class="tabla-datos__fila" data-usuario-id="${empleado.id}">
                    <td class="tabla-datos__celda">${empleado.tipo_id || ''}</td>
                    <td class="tabla-datos__celda">${empleado.cedula || ''}</td>
                    <td class="tabla-datos__celda col-large">${empleado.nombre_completo || ''}</td>
                    <td class="tabla-datos__celda">${empleado.fecha_nacimiento || ''}</td>
                    <td class="tabla-datos__celda celda-wrap">${empleado.lugar_nacimiento || ''}</td>
                    <td class="tabla-datos__celda">${empleado.genero || ''}</td>
                    <td class="tabla-datos__celda">${empleado.estado_civil || ''}</td>
                    <td class="tabla-datos__celda">${empleado.fecha_ingreso || ''}</td>
                    <td class="tabla-datos__celda celda-wrap">${empleado.cargo || 'Sin cargo asignado'}</td>
                    <td class="tabla-datos__celda">${empleado.tipo_trabajador || 'Sin tipo asignado'}</td>
                    <td class="tabla-datos__celda">${empleado.grado_instruccion || ''}</td>
                    <td class="tabla-datos__celda">${empleado.telefono_principal || ''}</td>
                    <td class="tabla-datos__celda">${empleado.telefono_secundario || ''}</td>
                    <td class="tabla-datos__celda celda-wrap">${empleado.email || ''}</td>
                    <td class="tabla-datos__celda celda-wrap">${empleado.direccion || ''}</td>
                    <td class="tabla-datos__celda text-center">${empleado.hijos || 0}</td>
                    <td class="tabla-datos__celda text-center">${empleado.conyuge || 'No'}</td>
                    <td class="tabla-datos__celda">${empleado.rif || ''}</td>
                    <td class="tabla-datos__celda celda-wrap">
                        ${empleado.cuentas_bancarias && empleado.cuentas_bancarias !== 'Sin cuentas activas' ? 
                            empleado.cuentas_bancarias.replace(/\(([^)]+)\):/g, '($1)') : 
                            'Sin cuentas'}
                    </td>
                    <td class="tabla-datos__celda">
                        <span class="badge-estado ${empleado.status === 'Activo' ? 'activo' : 'inactivo'}">
                            ${empleado.status || 'Inactivo'}
                        </span>
                    </td>
                    <td class="tabla-datos__celda acciones">
                        <button class="tabla-datos__boton btn-editar" data-idusuario="${empleado.id}" onclick="editarUsuario(this)">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="tabla-datos__boton btn-eliminar" data-usuarioid="${empleado.id}" onclick="confirmarEliminarUsuario(this)">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
            
            if (sinResultados) sinResultados.style.display = 'none';
        }
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        tbody.innerHTML = '<tr><td colspan="21" class="text-center">Error al cargar datos</td></tr>';
    }
}
// ===== FUNCIONES DE ELIMINACIÓN (MODIFICADAS PARA INTEGRAR) =====
async function confirmarEliminarUsuario(boton) {
    const usuarioId = boton.getAttribute('data-usuarioid');
    
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Esta acción eliminará al empleado con ID: ${usuarioId}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

        const response = await fetch(`/api/empleados/${usuarioId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': CSRF_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Error ${response.status}`);
        }

        await Swal.fire({
            title: '¡Eliminado!',
            text: data.message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        await aplicarFiltrosEmpleados();

    } catch (error) {
        console.error('Error eliminando empleado:', error);
        mostrarNotificacion(`Error al eliminar empleado: ${error.message}`, 'error');
    } finally {
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
    }
}

// ===== FUNCIONALIDAD DE EXPORTACIÓN (NUEVO) =====
function exportarEmpleados() {
    const tipoExportacion = document.getElementById('exportar-formato')?.value || 'excel';
    const params = new URLSearchParams({
        estado: document.getElementById('filtro-estado')?.value || '',
        cargo: document.getElementById('filtro-cargo')?.value || '',
        tipo_trabajador: document.getElementById('filtro-tipo-trabajador')?.value || '',
        formato: tipoExportacion
    });

    window.open(`${API_EMPLEADOS_URL}exportar/?${params.toString()}`, '_blank');
}

// ===== FUNCIONES AUXILIARES (NUEVAS) =====
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// ===== INICIALIZACIÓN (MODIFICADA PARA INTEGRAR) =====
function inicializarEventosEmpleados() {
    // Filtros
    document.getElementById('btn-aplicar-filtros-empleados')?.addEventListener('click', aplicarFiltrosEmpleados);
    document.getElementById('btn-limpiar-filtros-empleados')?.addEventListener('click', limpiarFiltrosEmpleados);
    
    // Exportación
    document.getElementById('btn-exportar-empleados')?.addEventListener('click', exportarEmpleados);
    
    // Permitir búsqueda con Enter
    document.querySelectorAll('.filtro-empleado').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') aplicarFiltrosEmpleados();
        });
    });
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventosEmpleados();
    aplicarFiltrosEmpleados();
    
    // Mantener tus eventos existentes
    document.querySelectorAll('.toggle-password').forEach(icono => {
        icono.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    // ... (el resto de tu código de inicialización existente)
});

// Exportar funciones globales (manteniendo las tuyas y añadiendo nuevas)
window.aplicarFiltrosEmpleados = aplicarFiltrosEmpleados;
window.limpiarFiltrosEmpleados = limpiarFiltrosEmpleados;
window.exportarEmpleados = exportarEmpleados;

// Al final de gestion_empleados.js
window.usuarioModal__abrir = usuarioModal__abrir;
window.usuarioModal__cerrar = usuarioModal__cerrar;
window.editarUsuario = editarUsuario;
window.confirmarEliminarUsuario = confirmarEliminarUsuario;
window.eliminarUsuarioConfirmado = eliminarUsuarioConfirmado;
window.cerrarModalConfirmacion = cerrarModalConfirmacion;
window.guardarUsuario = guardarUsuario;
window.navegarPaso = navegarPaso;
window.aplicarFiltrosEmpleados = aplicarFiltrosEmpleados;
window.limpiarFiltrosEmpleados = limpiarFiltrosEmpleados;
window.exportarEmpleados = exportarEmpleados;