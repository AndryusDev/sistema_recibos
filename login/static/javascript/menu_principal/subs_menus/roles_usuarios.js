// ===== CONSTANTES GLOBALES =====
const API_USUARIOS_URL = '/api/usuarios/';
const API_ROLES_URL = '/api/roles/';


// ===== FUNCIONES PRINCIPALES =====

// Función para cargar y mostrar la lista de usuarios
async function cargarUsuarios(filtro = 'all', pagina = 1, busqueda = '') {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    const loadingIndicator = `
        <tr>
            <td colspan="6" class="text-center">
                <i class="fas fa-spinner fa-spin"></i> Cargando usuarios...
            </td>
        </tr>
    `;
    
    tbody.innerHTML = loadingIndicator;
    
    try {
        const params = new URLSearchParams({
            page: pagina,
            rol: filtro === 'all' ? '' : filtro,
            search: busqueda
        });
        
        const response = await fetch(`${API_USUARIOS_URL}?${params.toString()}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.usuarios && data.usuarios.length > 0) {
            tbody.innerHTML = data.usuarios.map(usuario => `
                <tr class="tabla-recibos__fila" data-id="${usuario.id}">
                    <td class="tabla-recibos__celda">
                        <div class="user-avatar">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || '')}&background=random" alt="${usuario.nombre}">
                        </div>
                        <span>${usuario.nombre || 'Sin nombre'}</span>
                    </td>
                    <td class="tabla-recibos__celda">${usuario.email || ''}</td>
                    <td class="tabla-recibos__celda">
                        <span class="badge rol-${usuario.rol?.codigo || ''}">
                            ${usuario.rol?.nombre || 'Sin rol'}
                        </span>
                    </td>
                    <td class="tabla-recibos__celda">
                        <span class="badge ${usuario.activo ? 'badge-success' : 'badge-danger'}">
                            ${usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="tabla-recibos__celda">
                        ${formatearFecha(usuario.ultimo_login) || 'Nunca'}
                    </td>
                    <td class="tabla-recibos__celda">
                        <button class="btn-action btn-edit" title="Editar" onclick="abrirModalEditarUsuario(${usuario.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarUsuario(${usuario.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Actualizar paginación si está disponible
            if (data.paginacion) {
                actualizarPaginacion(data.paginacion);
            }
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No se encontraron usuarios</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center error">
                    Error al cargar usuarios: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Función auxiliar para formatear fechas (opcional)
function formatearFecha(fecha) {
    if (!fecha) return null;
    try {
        const date = new Date(fecha);
        return date.toLocaleString();
    } catch (e) {
        console.error('Error formateando fecha:', e);
        return fecha; // Devuelve la fecha original si no se puede formatear
    }
}

// Función para abrir el modal de edición de usuario
async function abrirModalEditarUsuario(usuarioId) {
    try {
        // Obtener datos del usuario
        const response = await fetch(`${API_USUARIOS_URL}${usuarioId}/`, {
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar usuario');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error en la respuesta');
        
        // Guardar usuario que estamos editando
        usuarioEditando = data.usuario;
        
        // Verificar que existan los elementos del DOM
        const elementosRequeridos = [
            'edit-user-name', 
            'edit-user-email',
            'edit-user-active',
            'edit-user-role'
        ];
        
        elementosRequeridos.forEach(id => {
            if (!document.getElementById(id)) {
                throw new Error(`Elemento con ID ${id} no encontrado`);
            }
        });
        
        // Verificar que existan los elementos del DOM
        const nameInput = document.getElementById('edit-user-name');
        const emailInput = document.getElementById('edit-user-email');
        const activeCheckbox = document.getElementById('edit-user-active');

        if (nameInput && emailInput && activeCheckbox) {
            // Llenar el formulario
            nameInput.value = data.usuario.nombre || '';
            emailInput.value = data.usuario.email || '';
            activeCheckbox.checked = data.usuario.activo || false;
        } else {
            console.error('Error: No se encontraron todos los elementos del formulario');
            mostrarError('No se pudieron cargar todos los datos del usuario');
            return;
        }

        // Cargar roles
        
        const modal = document.getElementById('edit-user-modal');
        modal.style.display = 'flex';
        await cargarRoles(data.usuario.rol?.id || null);
        
    } catch (error) {
        console.error('Error al abrir modal:', error);
        mostrarError(error.message || 'No se pudo cargar el usuario');
    }
}

function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

// Función para cargar los roles en el select
async function cargarRoles(rolSeleccionadoId = null) {
    try {
        const response = await fetch(API_ROLES_URL, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al cargar roles');
        
        const selectRol = document.getElementById('edit-user-role');
        if(selectRol){
            selectRol.innerHTML = '<option value="">Seleccionar rol...</option>';
            
            data.roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.nombre;
                option.selected = rol.id == rolSeleccionadoId;
                selectRol.appendChild(option);
            });
        } else {
             console.error('Error: No se encontró el elemento select#edit-user-role');
             mostrarError('No se pudieron cargar los roles');
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarError('Error al cargar roles: ' + error.message);
        
        // Opción de respaldo en caso de error
        const selectRol = document.getElementById('edit-user-role');
        if(selectRol){
            selectRol.innerHTML = `
                <option value="">Error cargando roles</option>
                <option value="1">Administrador</option>
                <option value="2">Usuario</option>
            `;
            
            if (rolSeleccionadoId) {
                selectRol.value = rolSeleccionadoId;
            }
        }
    }
}


// Función para guardar los cambios del usuario
async function guardarCambiosUsuario() {
    const email = document.getElementById('edit-user-email').value.trim();
    const rolId = document.getElementById('edit-user-role').value;
    const activo = document.getElementById('edit-user-active').checked;

    // Validación más robusta
    if (!email) {
        mostrarError('El email es un campo obligatorio');
        return;
    }

    if (!rolId) {
        mostrarError('Debe seleccionar un rol');
        return;
    }

        const datos = {
            email: email,
            rol: { id: parseInt(rolId) },  // Enviar como objeto con propiedad id
            activo: activo
        };

    try {
        const response = await fetch(`${API_USUARIOS_URL}${usuarioEditando.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(datos)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || `Error HTTP! estado: ${response.status}`);
        }

        mostrarNotificacion('Usuario actualizado correctamente', 'success');
        cerrarModalEdicion();
        cargarUsuarios(document.getElementById('filtro-rol').value, paginaActual);
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al actualizar usuario');
    }
}



// Función para eliminar un usuario
async function eliminarUsuario(idUsuario) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Esta acción eliminará al usuario ID: ${idUsuario}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!confirmacion.isConfirmed) return;
    
    try {
        const btn = document.querySelector(`.btn-delete[onclick="eliminarUsuario(${idUsuario})"]`);
        if (btn) btn.disabled = true;
        
        const response = await fetch(`${API_USUARIOS_URL}${idUsuario}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        mostrarNotificacion(data.message || 'Usuario eliminado', 'success');
        await cargarUsuarios(document.getElementById('filtro-rol').value);
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        mostrarNotificacion(`Error al eliminar usuario: ${error.message}`, 'error');
    }
}
function formatearFecha(fecha) {
    if (!fecha) return null;
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Error formateando fecha:', e);
        return fecha;
    }
}
function mostrarNotificacion(mensaje, tipo) {
    Swal.fire({
        title: tipo === 'success' ? 'Éxito' : 'Error',
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Aceptar'
    });
}

// Función para cerrar el modal
function cerrarModalUsuario() {
    document.getElementById('edit-user-modal').style.display = 'none';
}

// ===== FUNCIONES AUXILIARES =====

function cerrarModalEdicion() {
    document.getElementById('edit-user-modal').style.display = 'none';
}

// ===== INICIALIZACIÓN =====

// ===== INICIALIZACIÓN =====
function inicializarModuloUsuarios() {
    console.log('[RolesUsuarios] Inicializando módulo de gestión de usuarios...');
    
    const checkDOM = () => {
        const tbody = document.getElementById('cuerpo-tabla-usuarios');
        if (!tbody) {
            console.log('[RolesUsuarios] Elemento principal no disponible, reintentando...');
            setTimeout(checkDOM, 100);
            return;
        }

        console.log('[RolesUsuarios] Elemento principal encontrado, iniciando...');
        
        // Cargar datos iniciales
        cargarUsuarios();
        
        // Configurar eventos
        const setupEventos = () => {
            // Filtro de roles
            document.addEventListener('change', function(e) {
                if (e.target && e.target.id === 'filtro-rol') {
                    cargarUsuarios(e.target.value);
                }
            });
            
            // Botón de búsqueda
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'btn-buscar-usuarios') {
                    const busqueda = document.querySelector('.search-box input')?.value;
                    cargarUsuarios('all', 1, busqueda);
                }
            });
            
            // Modal eventos
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'btn-cerrar-modal') {
                    cerrarModalUsuario();
                }
                if (e.target && e.target.id === 'btn-cancelar-edicion') {
                    cerrarModalUsuario();
                }
                if (e.target && e.target.id === 'btn-guardar-usuario') {
                    guardarCambiosUsuario(); // Usa la función que sí existe
                }
            });
        };
        
        setupEventos();
    };
    
    checkDOM();
}

// ===== EXPOSICIÓN DE FUNCIONES =====
(function() {
    // Solo exponer las funciones si window está definido (entorno de navegador)
    if (typeof window !== 'undefined') {
        console.log("[RolesUsuarios] Exportando funciones al ámbito global");
        
        // Exportar funciones principales
        window.inicializarModuloUsuarios = inicializarModuloUsuarios;
        window.abrirModalEditarUsuario = abrirModalEditarUsuario;
        window.eliminarUsuario = eliminarUsuario;

        console.log("[RolesUsuarios] Funciones exportadas correctamente:", {
            inicializarModuloUsuarios: typeof window.inicializarModuloUsuarios,
            abrirModalEditarUsuario: typeof window.abrirModalEditarUsuario,
            eliminarUsuario: typeof window.eliminarUsuario
        });

        // Disparar evento cuando el módulo esté listo
        document.dispatchEvent(new CustomEvent('moduloUsuariosReady', {
            detail: { ready: true, timestamp: new Date() }
        }));
    }
})();

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en la página correcta
    if (document.getElementById('cuerpo-tabla-usuarios')) {
        console.log("[RolesUsuarios] DOM listo, inicializando módulo automáticamente");
        inicializarModuloUsuarios();
    }
});
