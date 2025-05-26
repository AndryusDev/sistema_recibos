// Variables globales
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
        'resumen-nombre-completo': () => {
            const primerNombre = document.getElementById('modal-primer-nombre').value;
            const segundoNombre = document.getElementById('modal-segundo-nombre').value;
            const primerApellido = document.getElementById('modal-primer-apellido').value;
            const segundoApellido = document.getElementById('modal-segundo-apellido').value;
            return `${primerApellido} ${segundoApellido || ''} ${primerNombre} ${segundoNombre || ''}`.replace(/\s+/g, ' ').trim();
        },
        'resumen-cedula': () => {
            const tipo = document.getElementById('modal-tipo-identificacion');
            const cedula = document.getElementById('modal-cedula').value;
            return tipo ? `${tipo.options[tipo.selectedIndex].text}: ${cedula}` : cedula;
        },
        'resumen-email': () => document.getElementById('modal-email').value || 'No especificado',
        'resumen-cargo': () => {
            const cargo = document.getElementById('modal-cargo');
            return cargo ? cargo.options[cargo.selectedIndex].text : 'No especificado';
        },
        'resumen-fecha-ingreso': () => document.getElementById('modal-fecha-ingreso').value || 'No especificada',
        'resumen-nombre-usuario': () => document.getElementById('modal-nombre-usuario').value || 'No especificado',
        'resumen-roles': () => {
            const rolesSeleccionados = Array.from(document.querySelectorAll('input[name="roles"]:checked'))
                .map(checkbox => checkbox.nextElementSibling.querySelector('.rol-nombre').textContent)
                .join(', ');
            return rolesSeleccionados || 'Ningún rol asignado';
        }
    };

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

function cargarDatosUsuario(usuarioId) {
    // Simulación de carga de datos - en producción sería una llamada AJAX
    setTimeout(() => {
        const usuarioEjemplo = {
            tipo_identificacion: 'V',
            cedula: '12345678',
            primer_nombre: 'Juan',
            segundo_nombre: 'Carlos',
            primer_apellido: 'Pérez',
            segundo_apellido: 'González',
            fecha_ingreso: '2020-01-15',
            tipo_trabajador: '1',
            familia_cargo: '101',
            cargo: '1001',
            email: 'juan.perez@example.com',
            telefono_principal: '04141234567',
            telefono_secundario: '',
            nombre_usuario: 'jperez',
            roles: [1, 3]
        };
        
        const modal = document.getElementById("usuarioModal");
        if (!modal) return;
        
        // Llenar campos básicos
        modal.querySelector('#modal-tipo-identificacion').value = usuarioEjemplo.tipo_identificacion;
        modal.querySelector('#modal-cedula').value = usuarioEjemplo.cedula;
        modal.querySelector('#modal-primer-nombre').value = usuarioEjemplo.primer_nombre;
        modal.querySelector('#modal-segundo-nombre').value = usuarioEjemplo.segundo_nombre;
        modal.querySelector('#modal-primer-apellido').value = usuarioEjemplo.primer_apellido;
        modal.querySelector('#modal-segundo-apellido').value = usuarioEjemplo.segundo_apellido;
        modal.querySelector('#modal-fecha-ingreso').value = usuarioEjemplo.fecha_ingreso;
        modal.querySelector('#modal-email').value = usuarioEjemplo.email;
        modal.querySelector('#modal-telefono').value = usuarioEjemplo.telefono_principal;
        modal.querySelector('#modal-telefono-secundario').value = usuarioEjemplo.telefono_secundario;
        modal.querySelector('#modal-nombre-usuario').value = usuarioEjemplo.nombre_usuario;
        
        // Seleccionar roles
        usuarioEjemplo.roles.forEach(rolId => {
            const checkbox = modal.querySelector(`#modal-rol-${rolId}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Simular selección de tipo de trabajador, familia y cargo
        const tipoTrabajadorSelect = modal.querySelector('#modal-tipo-trabajador');
        if (tipoTrabajadorSelect) {
            tipoTrabajadorSelect.value = usuarioEjemplo.tipo_trabajador;
            tipoTrabajadorSelect.dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                const familiaCargoSelect = modal.querySelector('#modal-familia-cargo');
                if (familiaCargoSelect) {
                    familiaCargoSelect.value = usuarioEjemplo.familia_cargo;
                    familiaCargoSelect.dispatchEvent(new Event('change'));
                    
                    setTimeout(() => {
                        modal.querySelector('#modal-cargo').value = usuarioEjemplo.cargo;
                    }, 500);
                }
            }, 500);
        }
    }, 500);
}

function actualizarTablaUsuarios() {
    // Simular recarga de datos (en producción sería una llamada AJAX)
    console.log('Actualizando tabla de usuarios...');
    // Aquí iría la lógica para actualizar la tabla
}

function mostrarNotificacion(mensaje, tipo) {
    // Implementación básica - puedes usar una librería como Toastr o SweetAlert
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
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
function obtenerFamiliasPorTipo(tipoId) {
    const familias = {
        '1': [
            {id: '101', nombre: 'Administrativo'},
            {id: '102', nombre: 'Técnico'}
        ],
        '2': [
            {id: '201', nombre: 'Operativo'},
            {id: '202', nombre: 'Especializado'}
        ]
    };
    return familias[tipoId] || [];
}

function obtenerCargosPorFamilia(familiaId) {
    const cargos = {
        '101': [
            {id: '1001', nombre_completo: 'Administrativo I'},
            {id: '1002', nombre_completo: 'Administrativo II'}
        ],
        '102': [
            {id: '2001', nombre_completo: 'Técnico I'},
            {id: '2002', nombre_completo: 'Técnico II'}
        ]
    };
    return cargos[familiaId] || [];
}