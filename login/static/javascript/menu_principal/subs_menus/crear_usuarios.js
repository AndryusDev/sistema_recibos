// Namespace para evitar conflictos con otros módulos
const CrearUsuariosModule = {
    API_EMPLEADOS_URL: '/api/empleados/',
    pasoActual: 1,
    totalPasos: 4,
    usuarioActualId: null
};

// Función para obtener el CSRF token
function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}

// Función para abrir el modal
function usuarioModal__abrir(usuarioId = null) {
    const modal = document.getElementById("usuarioModal");
    if (modal) {
        CrearUsuariosModule.usuarioActualId = usuarioId;
        modal.style.display = 'flex';
        reiniciarPasos();
        resetearFormulario();
        
        const tituloModal = document.getElementById("modal-titulo");
        if (tituloModal) {
            tituloModal.innerHTML = usuarioId 
                ? '<i class="fas fa-user-edit"></i> Editar Usuario' 
                : '<i class="fas fa-user-plus"></i> Crear Nuevo Usuario';
        }
    }
}

// Función para cerrar el modal
function usuarioModal__cerrar() {
    const modal = document.getElementById("usuarioModal");
    if (modal) modal.style.display = 'none';
}

// Función para navegar entre pasos
function navegarPaso(direccion) {
    if (direccion === 'siguiente' && CrearUsuariosModule.pasoActual < CrearUsuariosModule.totalPasos) {
        if (validarPasoActual()) {
            CrearUsuariosModule.pasoActual++;
            actualizarPasos();
        }
    } else if (direccion === 'anterior' && CrearUsuariosModule.pasoActual > 1) {
        CrearUsuariosModule.pasoActual--;
        actualizarPasos();
    }
}

// Función para actualizar la visualización de pasos
function actualizarPasos() {
    const modal = document.getElementById("usuarioModal");
    if (!modal) return;

    // Ocultar todos los pasos
    modal.querySelectorAll('.paso-formulario').forEach(paso => {
        paso.classList.remove('activo');
    });

    // Mostrar paso actual
    const pasoActivo = modal.querySelector(`.paso-formulario[data-paso="${CrearUsuariosModule.pasoActual}"]`);
    if (pasoActivo) pasoActivo.classList.add('activo');

    // Actualizar indicadores
    modal.querySelectorAll('.indicador-pasos .paso').forEach((paso, index) => {
        paso.classList.toggle('completado', index < CrearUsuariosModule.pasoActual - 1);
        paso.classList.toggle('activo', index === CrearUsuariosModule.pasoActual - 1);
    });

    // Actualizar botones
    const btnAnterior = modal.querySelector('#btn-anterior');
    const btnSiguiente = modal.querySelector('#btn-siguiente');
    const btnGuardar = modal.querySelector('#btn-guardar');

    if (btnAnterior) btnAnterior.disabled = CrearUsuariosModule.pasoActual === 1;
    if (btnSiguiente) btnSiguiente.style.display = CrearUsuariosModule.pasoActual < CrearUsuariosModule.totalPasos ? 'block' : 'none';
    if (btnGuardar) {
        btnGuardar.style.display = CrearUsuariosModule.pasoActual === CrearUsuariosModule.totalPasos ? 'block' : 'none';
        if (CrearUsuariosModule.pasoActual === CrearUsuariosModule.totalPasos) {
            actualizarResumen();
        }
    }
}

// Función para validar el paso actual
function validarPasoActual() {
    const modal = document.getElementById("usuarioModal");
    if (!modal) return false;

    const paso = modal.querySelector(`.paso-formulario[data-paso="${CrearUsuariosModule.pasoActual}"]`);
    if (!paso) return false;

    let valido = true;
    
    // Campos requeridos por paso
    const camposRequeridos = {
        1: ['modal-tipo-identificacion', 'modal-cedula', 'modal-primer-nombre', 'modal-primer-apellido', 'modal-fecha-nacimiento'],
        2: ['fecha-ingreso', 'tipo-trabajador', 'email'],
        3: ['banco', 'tipo-cuenta', 'numero-cuenta']
    };

    // Validar campos del paso actual
    if (camposRequeridos[CrearUsuariosModule.pasoActual]) {
        camposRequeridos[CrearUsuariosModule.pasoActual].forEach(id => {
            const campo = modal.querySelector(`#${id}`);
            if (campo && !campo.value.trim()) {
                marcarCampoInvalido(campo, 'Este campo es requerido');
                valido = false;
            }
        });
    }

    // Validaciones específicas
    if (CrearUsuariosModule.pasoActual === 1) {
        const cedula = modal.querySelector('#modal-cedula');
        if (cedula && cedula.value && isNaN(cedula.value)) {
            marcarCampoInvalido(cedula, 'La cédula debe ser numérica');
            valido = false;
        }

        const fechaNacimiento = modal.querySelector('#modal-fecha-nacimiento');
        if (fechaNacimiento && fechaNacimiento.value) {
            const fecha = new Date(fechaNacimiento.value);
            const hoy = new Date();
            if (fecha > hoy) {
                marcarCampoInvalido(fechaNacimiento, 'La fecha no puede ser futura');
                valido = false;
            }
        }
    }

    return valido;
}

// Función para marcar campo como inválido
function marcarCampoInvalido(campo, mensaje) {
    campo.classList.add('invalido');
    let errorMsg = campo.nextElementSibling;
    if (!errorMsg || !errorMsg.classList.contains('error-mensaje')) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-mensaje';
        campo.parentNode.insertBefore(errorMsg, campo.nextSibling);
    }
    errorMsg.textContent = mensaje;
}

// Función para actualizar el resumen
function actualizarResumen() {
    const modal = document.getElementById("usuarioModal");
    if (!modal) return;

    const elementosResumen = {
        'resumen-nombre-completo': () => {
            const primerNombre = modal.querySelector('#modal-primer-nombre').value;
            const segundoNombre = modal.querySelector('#modal-segundo-nombre').value;
            const primerApellido = modal.querySelector('#modal-primer-apellido').value;
            const segundoApellido = modal.querySelector('#modal-segundo-apellido').value;
            return `${primerApellido} ${segundoApellido || ''} ${primerNombre} ${segundoNombre || ''}`.replace(/\s+/g, ' ').trim();
        },
        'resumen-identificacion': () => {
            const tipo = modal.querySelector('#modal-tipo-identificacion');
            const cedula = modal.querySelector('#modal-cedula').value;
            const rif = modal.querySelector('#modal-rif').value;
            
            if (cedula) {
                return tipo ? `${tipo.options[tipo.selectedIndex].text}: ${cedula}` : cedula;
            }
            return rif ? `RIF: ${rif}` : 'No especificado';
        },
        'resumen-fecha-nacimiento': () => formatDate(modal.querySelector('#modal-fecha-nacimiento').value),
        'resumen-cargo': () => {
            const select = modal.querySelector('#nivel-cargo');
            return select ? select.options[select.selectedIndex].text : 'No especificado';
        },
        'resumen-tipo-trabajador': () => {
            const tipo = modal.querySelector('#tipo-trabajador');
            return tipo ? tipo.options[tipo.selectedIndex].text : 'No especificado';
        },
        'resumen-fecha-ingreso': () => formatDate(modal.querySelector('#fecha-ingreso').value),
        'resumen-banco': () => {
            const banco = modal.querySelector('#banco');
            return banco ? banco.options[banco.selectedIndex].text : 'No especificado';
        },
        'resumen-tipo-cuenta': () => {
            const tipo = modal.querySelector('#tipo-cuenta');
            return tipo ? (tipo.value === 'C' ? 'Corriente' : 'Ahorro') : 'No especificado';
        },
        'resumen-numero-cuenta': () => modal.querySelector('#numero-cuenta').value || 'No especificado',
        'resumen-email-usuario': () => modal.querySelector('#email').value || 'No especificado'
    };

    Object.entries(elementosResumen).forEach(([id, fn]) => {
        const elemento = modal.querySelector(`#${id}`);
        if (elemento) {
            elemento.textContent = fn() || 'No especificado';
        }
    });
}

// Función para formatear fechas
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Función para resetear el formulario
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
    
    // Resetear selects dependientes
    /*const familiaCargo = modal.querySelector('#familia-cargo');
    const cargo = modal.querySelector('#cargo');
    
    if (familiaCargo) {
        familiaCargo.innerHTML = '<option value="">Seleccione tipo de trabajador primero</option>';
        familiaCargo.disabled = true;
    }
    
    if (cargo) {
        cargo.innerHTML = '<option value="">Seleccione familia de cargo primero</option>';
        cargo.disabled = true;
    }*/
    
    reiniciarPasos();
}

// Función para reiniciar pasos
function reiniciarPasos() {
    CrearUsuariosModule.pasoActual = 1;
    actualizarPasos();
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Implementación simple con alert - puedes reemplazar por algo más elegante
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

// Función principal para guardar usuario
async function guardarUsuario() {
    const btnGuardar = document.getElementById('btn-guardar');
    const modal = document.getElementById("usuarioModal");
    
    if (!validarPasoActual()) {
        mostrarNotificacion('Por favor complete todos los campos requeridos', 'error');
        return;
    }

    if (btnGuardar && modal) {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            // Recopilar datos de hijos
            const childrenContainer = document.getElementById('children-container');
            const childrenEntries = childrenContainer.querySelectorAll('.child-entry');
            const childrenData = [];

            childrenEntries.forEach(entry => {
                const nombre = entry.querySelector('.child-nombre')?.value || '';
                const apellido = entry.querySelector('.child-apellido')?.value || '';
                const fechaNacimiento = entry.querySelector('.child-fecha-nacimiento')?.value || '';
                const genero = entry.querySelector('.child-genero')?.value || '';
                const cedula = entry.querySelector('.child-cedula')?.value || '';
                const lugarNacimiento = entry.querySelector('.child-lugar-nacimiento')?.value || '';
                const estudia = entry.querySelector('.child-estudia')?.value || '';
                const nivelEducativo = entry.querySelector('.child-nivel-educativo')?.value || '';
                const discapacidad = entry.querySelector('.child-discapacidad')?.checked || false;

                if (nombre && apellido && fechaNacimiento && genero) {
                    childrenData.push({
                        nombre_completo: `${nombre} ${apellido}`.trim(),
                        fecha_nacimiento: fechaNacimiento,
                        genero,
                        cedula,
                        lugar_nacimiento: lugarNacimiento,
                        estudia,
                        nivel_educativo: nivelEducativo,
                        discapacidad
                    });
                }
            });

            const formData = {
                tipo_identificacion: modal.querySelector('#modal-tipo-identificacion').value,
                cedula: parseInt(modal.querySelector('#modal-cedula').value),
                rif: modal.querySelector('#modal-rif').value || '',
                primer_nombre: modal.querySelector('#modal-primer-nombre').value,
                segundo_nombre: modal.querySelector('#modal-segundo-nombre').value || '',
                primer_apellido: modal.querySelector('#modal-primer-apellido').value,
                segundo_apellido: modal.querySelector('#modal-segundo-apellido').value || '',
                fecha_nacimiento: modal.querySelector('#modal-fecha-nacimiento').value,
                lugar_nacimiento: modal.querySelector('#modal-lugar-nacimiento').value || '',
                genero: modal.querySelector('#modal-genero').value || '',
                estado_civil: modal.querySelector('#modal-estado-civil').value || '',
                grado_instruccion: modal.querySelector('#modal-grado-instruccion').value || '',
                fecha_ingreso: modal.querySelector('#fecha-ingreso').value,
                tipo_trabajador: parseInt(modal.querySelector('#tipo-trabajador').value),
                cargo_id: parseInt(modal.querySelector('#nivel-cargo').value), // Cambiado a cargo_id
                nivel_salarial: parseInt(modal.querySelector('#nivel-salarial').value) || null,
                telefono_principal: modal.querySelector('#telefono-principal').value || '',
                telefono_secundario: modal.querySelector('#telefono-secundario').value || '',
                email: modal.querySelector('#email').value || '',
                direccion: modal.querySelector('#direccion').value || '',
                hijos: parseInt(modal.querySelector('#hijos').value) || 0,
                conyuge: modal.querySelector('#conyuge').value === 'true',
                banco: modal.querySelector('#banco').value || '',
                tipo_cuenta: modal.querySelector('#tipo-cuenta').value || '',
                numero_cuenta: modal.querySelector('#numero-cuenta').value || '',
                hijos_data: childrenData
            };

            // Validación adicional
            if (isNaN(formData.tipo_trabajador) || isNaN(formData.cargo_id)) {
                throw new Error('Seleccione valores válidos para tipo trabajador y cargo');
            }

            // Print children data before sending to server for debugging
            console.log('Children data to send:', childrenData);
            console.log('Datos a enviar:', formData);

            // Enviar datos al servidor
            const guardarResponse = await fetch('/api/empleadoss/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(formData)
            });

            const empleadoData = await guardarResponse.json();
            
            if (!guardarResponse.ok) {
                throw new Error(empleadoData.error || empleadoData.detail || 'Error al guardar empleado');
            }

            mostrarNotificacion(empleadoData.message || 'Empleado creado correctamente', 'success');
            await actualizarTablaEmpleados();
            setTimeout(usuarioModal__cerrar, 1500);

        } catch (error) {
            console.error("Error completo:", error);
            mostrarNotificacion(
                `Error al guardar empleado: ${error.message}`,
                'error'
            );
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
        }
    }
}

// Función editarUsuario que faltaba
function editarUsuario(boton) {
    const usuarioId = boton.getAttribute('data-id');
    usuarioModal__abrir(usuarioId);
}



// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const tipoTrabajador = document.getElementById('tipo-trabajador');
    const familiaCargo = document.getElementById('familia-cargo');
    const cargo = document.getElementById('cargo');
    
    if (tipoTrabajador && familiaCargo && cargo) {
        tipoTrabajador.addEventListener('change', function() {
            // Limpiar estado de invalidación
            familiaCargo.classList.remove('invalido');
            cargo.classList.remove('invalido');
            
            // Limpiar mensajes de error
            const errorMsg = familiaCargo.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-mensaje')) {
                errorMsg.remove();
            }
            
            // Resto de tu lógica para cargar opciones...
        });
        
        familiaCargo.addEventListener('change', function() {
            // Limpiar estado de invalidación
            cargo.classList.remove('invalido');
            
            // Limpiar mensaje de error
            const errorMsg = cargo.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-mensaje')) {
                errorMsg.remove();
            }
            
        });
    }
    // Call the function to add children event listeners
    agregarEventosHijos();
});

// Función para añadir y eliminar hijos dinámicamente
function agregarEventosHijos() {
    const addChildBtn = document.getElementById('add-child-btn');
    const childrenContainer = document.getElementById('children-container');

    if (addChildBtn && childrenContainer) {
        addChildBtn.addEventListener('click', () => {
            const childIndex = childrenContainer.children.length;

            const childEntry = document.createElement('div');
            childEntry.classList.add('child-entry');
            childEntry.style.border = '1px solid #ddd';
            childEntry.style.padding = '10px';
            childEntry.style.marginBottom = '10px';
            childEntry.style.position = 'relative';

            childEntry.innerHTML = `
                <button type="button" class="remove-child-btn" style="position: absolute; top: 5px; right: 5px; background: #dc3545; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer;" title="Eliminar hijo">&times;</button>
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" class="form-input child-nombre" name="child_nombre_${childIndex}" required>
                </div>
                <div class="form-group">
                    <label>Apellido:</label>
                    <input type="text" class="form-input child-apellido" name="child_apellido_${childIndex}" required>
                </div>
                <div class="form-group">
                    <label>Cédula:</label>
                    <input type="text" class="form-input child-cedula" name="child_cedula_${childIndex}">
                </div>
                <div class="form-group">
                    <label>Fecha de Nacimiento:</label>
                    <input type="date" class="form-input child-fecha-nacimiento" name="child_fecha_nacimiento_${childIndex}" required>
                </div>
                <div class="form-group">
                    <label>Lugar de Nacimiento:</label>
                    <input type="text" class="form-input child-lugar-nacimiento" name="child_lugar_nacimiento_${childIndex}">
                </div>
                <div class="form-group">
                    <label>Género:</label>
                    <select class="form-input child-genero" name="child_genero_${childIndex}" required>
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>¿Estudia?:</label>
                    <select class="form-input child-estudia" name="child_estudia_${childIndex}">
                        <option value="S" selected>Sí</option>
                        <option value="N">No</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nivel Educativo:</label>
                    <input type="text" class="form-input child-nivel-educativo" name="child_nivel_educativo_${childIndex}">
                </div>
                <div class="form-group">
                    <label>Discapacidad:</label>
                    <input type="checkbox" class="form-input child-discapacidad" name="child_discapacidad_${childIndex}">
                </div>
            `;

            childrenContainer.appendChild(childEntry);

            // Add event listener to remove button
            const removeBtn = childEntry.querySelector('.remove-child-btn');
            removeBtn.addEventListener('click', () => {
                childrenContainer.removeChild(childEntry);
            });
        });
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

            const response = await fetch(`${CrearUsuariosModule.API_EMPLEADOS_URL}?${params.toString()}`);
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
        html: `Esta acción eliminará al empleado con ID: ${usuarioId} y todas sus cuentas bancarias asociadas`,
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

        const response = await fetch(`/api/empleado/${usuarioId}/`, {
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

        await actualizarTablaEmpleados();

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

    window.open(`${CrearUsuariosModule.API_EMPLEADOS_URL}exportar/?${params.toString()}`, '_blank');
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
    agregarEventosHijos()
}

document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos para los selects dependientes
    const tipoTrabajador = document.getElementById('tipo-trabajador');
    const familiaCargo = document.getElementById('familia-cargo');
    const cargo = document.getElementById('cargo');
    
    if (tipoTrabajador && familiaCargo && cargo) {
        tipoTrabajador.addEventListener('change', function() {
            // Lógica para cargar familias de cargo según tipo de trabajador
        });
        
        familiaCargo.addEventListener('change', function() {
            // Lógica para cargar cargos según familia
        });
    }
});

document.getElementById('tipo-trabajador').addEventListener('change', function() {
    const tipoTrabajadorId = this.value;
    const cargoSelect = document.getElementById('nivel-cargo');
    
    if (!tipoTrabajadorId) {
        // Resetear el select si no hay tipo seleccionado
        cargoSelect.innerHTML = '<option value="">Seleccione tipo de trabajador primero</option>';
        return;
    }
    
    // Obtener cargos filtrados por tipo de trabajador
    fetch(`/api/cargos_tipo/?tipo_trabajador=${tipoTrabajadorId}`)
        .then(response => response.json())
        .then(data => {
            cargoSelect.innerHTML = '<option value="">Seleccione...</option>';
            data.forEach(cargo => {
                const option = document.createElement('option');
                option.value = cargo.id;
                option.textContent = `${cargo.familia_nombre} - ${cargo.nivel_nombre}`;
                cargoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar cargos:', error);
            cargoSelect.innerHTML = '<option value="">Error al cargar cargos</option>';
        });
});


// Exportar funciones globales
window.usuarioModal__abrir = usuarioModal__abrir;
window.usuarioModal__cerrar = usuarioModal__cerrar;
window.editarUsuario = editarUsuario;
window.confirmarEliminarUsuario = confirmarEliminarUsuario;
window.guardarUsuario = guardarUsuario;
window.navegarPaso = navegarPaso;
window.aplicarFiltrosEmpleados = aplicarFiltrosEmpleados;
window.limpiarFiltrosEmpleados = limpiarFiltrosEmpleados;
window.exportarEmpleados = exportarEmpleados;

document.addEventListener('DOMContentLoaded', function() {
    const tipoTrabajador = document.getElementById('tipo-trabajador');
    const familiaCargo = document.getElementById('familia-cargo');
    const cargo = document.getElementById('cargo');
    
    if (tipoTrabajador && familiaCargo && cargo) {
        tipoTrabajador.addEventListener('change', function() {
            // Limpiar estado de invalidación
            familiaCargo.classList.remove('invalido');
            cargo.classList.remove('invalido');
            
            // Limpiar mensajes de error
            const errorMsg = familiaCargo.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-mensaje')) {
                errorMsg.remove();
            }
            
            // Resto de tu lógica para cargar opciones...
        });
        
        familiaCargo.addEventListener('change', function() {
            // Limpiar estado de invalidación
            cargo.classList.remove('invalido');
            
            // Limpiar mensaje de error
            const errorMsg = cargo.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-mensaje')) {
                errorMsg.remove();
            }
            
        });
    }
    // Call the function to add children event listeners
    agregarEventosHijos();
});
